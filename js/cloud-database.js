/* Per-account cache and durable outbox for the free Firestore plan. */
(() => {
  "use strict";
  const P = window.GroundCloudProgress,
    DB = window.GroundDB;
  const listeners = new Set();
  let sharedDb,
    connecting = false;
  let account = { user: null, phase: "loading", error: "", busy: false },
    generation = 0,
    db,
    sdk,
    record,
    ensure,
    profile = null,
    history = [],
    stops = [],
    queue = [],
    pendingPrefs = {},
    baseline = null,
    ready = false,
    flushing = false,
    prefsWriting = false,
    retryTimer,
    prefsTimer;
  const prefsKey = (uid) => `ground.cloud.preferences.${uid}`;
  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }
  function store(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error(
        "Не удалось сохранить попытки. Освободи место в браузере и скачай резервную копию.",
      );
    }
  }
  function emit() {
    listeners.forEach((fn) =>
      fn({
        ...account,
        profile,
        history: history.slice(),
        queue: queue.slice(),
        pendingPrefs: { ...pendingPrefs },
        pending: queue.length + Object.keys(pendingPrefs).length,
      }),
    );
  }
  function phase() {
    if (!account.user) return;
    if (!navigator.onLine) account.phase = "offline";
    else if (account.error) account.phase = "error";
    else
      account.phase =
        ready && (queue.length || Object.keys(pendingPrefs).length)
          ? "syncing"
          : ready
            ? "synced"
            : "loading";
    emit();
  }
  function saveQueue() {
    store(P.queueKey(account.user.uid), queue);
  }
  function savePrefs() {
    store(prefsKey(account.user.uid), pendingPrefs);
  }
  function updateProfile(value) {
    if (!value || value.uid !== account.user?.uid) return;
    if (profile && (value.revision || 0) < (profile.revision || 0)) return;
    if (profile && (value.revision || 0) > (profile.revision || 0)) {
      queue.forEach((entry) => {
        if (
          ["failed-precondition", "functions/failed-precondition"].includes(
            entry.code,
          )
        ) {
          entry.error = "";
          entry.code = "";
        }
      });
      saveQueue();
    }
    profile = value;
    ready = true;
    phase();
  }
  function cleanup() {
    generation++;
    stops.forEach((fn) => fn());
    stops = [];
    clearTimeout(retryTimer);
    clearTimeout(prefsTimer);
    profile = null;
    history = [];
    queue = [];
    pendingPrefs = {};
    baseline = null;
    ready = false;
    flushing = false;
    prefsWriting = false;
    db = null;
    connecting = false;
  }
  function fail(error) {
    account.error =
      error?.code === "permission-denied"
        ? "Нет доступа к облачному профилю. Попробуй войти снова."
        : "Синхронизация пока не удалась. Попытки сохранены на этом устройстве.";
    phase();
  }
  async function connect(user) {
    if (connecting) return;
    connecting = true;
    const token = generation;
    try {
      ({ sdk } = window.GroundAuth.context());
      // Memory cache avoids a shared IndexedDB cache across Google accounts.
      // The application stores its durable cache/outbox under this user's UID.
      const app = window.GroundAuth.context().app;
      if (!sharedDb) {
        sharedDb = sdk.initializeFirestore(app, {
          localCache: sdk.memoryLocalCache(),
        });

        if (window.GroundFirebaseConfig.emulators) {
          sdk.connectFirestoreEmulator(sharedDb, "127.0.0.1", 8080);
        }
      }
      db = sharedDb;
      const storage = window.GroundFirestoreProgress.create(sdk, db);
      ensure = () => storage.ensureProfile(user);
      record = async (input) => ({
        data: await storage.recordAttempt(user.uid, input),
      });
      await ensure();
      if (token !== generation) return;
      stops.push(
        sdk.onSnapshot(
          sdk.doc(db, "users", user.uid),
          (snapshot) => {
            if (token !== generation || !snapshot.exists()) return;
            account.error = "";
            updateProfile(snapshot.data());
            flush();
            flushPreferences();
          },
          (error) => {
            if (token === generation) fail(error);
          },
        ),
      );
      stops.push(
        sdk.onSnapshot(
          sdk.query(
            sdk.collection(db, "users", user.uid, "attempts"),
            sdk.orderBy("createdAt", "desc"),
            sdk.limit(50),
          ),
          (snapshot) => {
            if (token !== generation) return;
            history = snapshot.docs
              .map((doc) => doc.data().result)
              .filter(Boolean);
            phase();
          },
          (error) => {
            if (token === generation) fail(error);
          },
        ),
      );
    } catch (error) {
      if (token === generation) {
        fail(error);
        retryTimer = setTimeout(() => {
          if (token === generation && navigator.onLine) connect(user);
        }, 15000);
      }
    } finally {
      if (token === generation) connecting = false;
    }
  }
  function authChanged(value) {
    const changed = value.user?.uid !== account.user?.uid;
    if (changed) {
      cleanup();
      account = { ...value };
      if (value.user) {
        queue = read(P.queueKey(value.user.uid), []);
        if (!Array.isArray(queue)) queue = [];
        queue = queue.filter(
          (entry) =>
            entry &&
            entry.input &&
            typeof entry.input.id === "string" &&
            Array.isArray(entry.input.answers) &&
            entry.result &&
            Array.isArray(entry.result.answers) &&
            typeof entry.result.completedAt === "string" &&
            typeof entry.result.key === "string",
        );
        pendingPrefs = read(prefsKey(value.user.uid), {});
        if (
          !pendingPrefs ||
          typeof pendingPrefs !== "object" ||
          Array.isArray(pendingPrefs)
        )
          pendingPrefs = {};
        pendingPrefs = Object.fromEntries(
          Object.entries(pendingPrefs).filter(([key]) =>
            [
              "selectedGrade",
              "layout",
              "nickname",
              "onboarded",
              "bookRead",
              "bookPage",
              "scanPage",
            ].includes(key),
          ),
        );
        emit();
        connect(value.user);
      } else emit();
    } else {
      account = {
        ...account,
        busy: value.busy,
        ...(value.error ? { error: value.error } : {}),
        ...(account.user ? {} : { phase: value.phase }),
      };
      emit();
    }
  }
  function setBaseline(state) {
    baseline = P.preferences(state);
  }
  function preferences(state) {
    if (!account.user || !baseline) return;
    const next = P.preferences(state);
    for (const key of Object.keys(next))
      if (JSON.stringify(next[key]) !== JSON.stringify(baseline[key]))
        pendingPrefs[key] = next[key];
    baseline = next;
    savePrefs();
    phase();
    clearTimeout(prefsTimer);
    prefsTimer = setTimeout(flushPreferences, 500);
  }
  async function flushPreferences() {
    if (
      !account.user ||
      !ready ||
      prefsWriting ||
      !navigator.onLine ||
      !Object.keys(pendingPrefs).length
    )
      return;
    const token = generation,
      uid = account.user.uid,
      sent = { ...pendingPrefs };
    prefsWriting = true;
    try {
      await sdk.updateDoc(sdk.doc(db, "users", uid), {
        ...sent,
        updatedAt: sdk.serverTimestamp(),
      });
      if (token !== generation) return;
      for (const key of Object.keys(sent))
        if (JSON.stringify(pendingPrefs[key]) === JSON.stringify(sent[key]))
          delete pendingPrefs[key];
      savePrefs();
      account.error = "";
      phase();
    } catch (error) {
      if (token === generation) fail(error);
    } finally {
      if (token === generation) {
        prefsWriting = false;
        if (Object.keys(pendingPrefs).length && !account.error)
          flushPreferences();
      }
    }
  }
  function enqueue(result) {
    if (!account.user) return;
    const id = result.attemptId || crypto.randomUUID();
    result.attemptId = id;
    const input = P.submission(DB, result, id);
    if (!queue.some((q) => q.input.id === id))
      queue.push({
        input,
        result: { ...result, rewardXP: 0, rewardGenes: 0 },
        error: "",
      });
    saveQueue();
    phase();
    flush();
  }
  async function flush() {
    if (!account.user || !ready || flushing || !navigator.onLine) return;
    const token = generation;
    flushing = true;
    try {
      await flushPreferences();
      for (const entry of queue.slice()) {
        if (token !== generation || !navigator.onLine) return;
        try {
          const response = (await record(entry.input)).data;
          if (token !== generation) return;
          // Apply the committed revision before removing the optimistic attempt.
          const confirmed = {
            ...response.result,
            durationSeconds: entry.result.durationSeconds || 0,
            expired: !!entry.result.expired,
          };
          history = [
            confirmed,
            ...history.filter((r) => r.attemptId !== confirmed.attemptId),
          ].slice(0, 50);
          queue = queue.filter((q) => q.input.id !== entry.input.id);
          saveQueue();
          account.error = "";
          updateProfile(response.progress);
        } catch (error) {
          if (token !== generation) return;
          if (
            [
              "invalid-argument",
              "failed-precondition",
              "already-exists",
            ].includes(error.code?.replace(/^functions\//, ""))
          ) {
            entry.error = error.message || "Попытку нужно повторить.";
            entry.code = error.code;
            saveQueue();
            account.error = entry.error;
            phase();
          } else {
            fail(error);
            break;
          }
        }
      }
    } finally {
      if (token === generation) {
        flushing = false;
        phase();
        if (queue.some((q) => !q.error) && navigator.onLine) {
          clearTimeout(retryTimer);
          retryTimer = setTimeout(flush, 15000);
        }
      }
    }
  }
  function importGuest(guest) {
    if (!account.user || !ready) throw new Error("Дождись загрузки аккаунта.");
    let imported = 0,
      skipped = 0;
    const records = guest.history
      .slice()
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    for (const result of records) {
      try {
        enqueue({
          ...result,
          attemptId: result.attemptId || `legacy_${legacyId(result)}`,
        });
        imported++;
      } catch {
        skipped++;
      }
    }
    return { imported, skipped };
  }
  function legacyId(value) {
    let hash = 2166136261;
    for (const char of JSON.stringify([
      value.key,
      value.completedAt,
      value.answers,
    ]))
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return `${(hash >>> 0).toString(16).padStart(8, "0")}_${value.completedAt.replace(/[^0-9]/g, "")}`;
  }
  window.GroundCloud = {
    start() {
      window.GroundAuth.subscribe(authChanged);
      window.GroundAuth.start();
    },
    subscribe(fn) {
      listeners.add(fn);
      fn({
        ...account,
        profile,
        history,
        queue,
        pendingPrefs,
        pending: queue.length,
      });
      return () => listeners.delete(fn);
    },
    setBaseline,
    preferences,
    enqueue,
    importGuest,
    retry() {
      account.error = "";
      if (account.user) {
        if (!ready) connect(account.user);
        else {
          queue.forEach((q) => (q.error = ""));
          saveQueue();
          flushPreferences();
          flush();
        }
      }
    },
    current: () => ({
      ...account,
      profile,
      history,
      queue,
      pendingPrefs,
      pending: queue.length + Object.keys(pendingPrefs).length,
    }),
  };
  window.addEventListener("online", () => {
    account.error = "";
    if (account.user) {
      if (!ready) connect(account.user);
      else {
        flushPreferences();
        flush();
      }
    }
    phase();
  });
  window.addEventListener("offline", phase);
})();
