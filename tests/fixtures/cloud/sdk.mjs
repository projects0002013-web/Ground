/* Test-only SDK adapter. Real production code loads the bundled official SDK. */
let user = JSON.parse(localStorage.getItem("test.auth") || "null"),
  listeners = [];
const changed = (value) => {
  user = value;
  localStorage.setItem("test.auth", JSON.stringify(user));
  listeners.forEach((fn) => fn(user));
};
async function rpc(action, data = {}) {
  if (!navigator.onLine)
    throw Object.assign(Error("offline"), { code: "unavailable" });
  const response = await fetch("/__cloud_test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: user?.uid, action, data }),
  });
  const result = await response.json();
  if (result?.error)
    throw Object.assign(Error(result.error), { code: result.code });
  return result;
}
export const initializeApp = () => ({}),
  getAuth = () => ({}),
  browserLocalPersistence = { kind: "local" },
  browserSessionPersistence = { kind: "session" },
  inMemoryPersistence = { kind: "memory" };
export async function setPersistence(_auth, storage) {
  (window.testPersistenceModes ||= []).push(storage.kind);
  if (window.testPersistenceBlocked?.includes(storage.kind))
    throw Object.assign(Error("storage blocked"), {
      code: "auth/web-storage-unsupported",
    });
}
export function onAuthStateChanged(_auth, fn) {
  listeners.push(fn);
  queueMicrotask(() => fn(user));
  return () => {
    listeners = listeners.filter((x) => x !== fn);
  };
}
export class GoogleAuthProvider {
  setCustomParameters() {}
}
export async function signInWithPopup() {
  if (window.testPopupBlocked)
    throw Object.assign(Error("blocked"), { code: "auth/popup-blocked" });
  changed(
    window.testNextUser || {
      uid: "alice",
      displayName: "Alice",
      email: "alice@example.test",
      photoURL: "",
    },
  );
}
export async function signInWithRedirect() {
  window.testRedirectUsed = true;
  changed(
    window.testNextUser || {
      uid: "alice",
      displayName: "Alice",
      email: "alice@example.test",
      photoURL: "",
    },
  );
}
export const getRedirectResult = async () => null,
  signOut = async () => changed(null);
export const initializeFirestore = () => ({}),
  memoryLocalCache = () => ({}),
  unused = () => ({});
export const doc = (_db, ...path) => ({ path: path.join("/") }),
  collection = doc,
  query = (ref) => ref,
  orderBy = () => {},
  limit = () => {},
  serverTimestamp = () => ({ serverTimestamp: true });
export const updateDoc = async (ref, data) =>
  rpc("preferences", { path: ref.path, ...data });
export function onSnapshot(ref, fn, onError) {
  let active = true,
    previous = "";
  async function poll() {
    try {
      const value = await rpc("read", { path: ref.path });
      const key = JSON.stringify(value);
      if (active && key !== previous) {
        previous = key;
        fn(
          ref.path.endsWith("/attempts")
            ? { docs: value.map((data) => ({ data: () => data })) }
            : { exists: () => !!value, data: () => value },
        );
      }
    } catch (error) {
      if (active && navigator.onLine) onError(error);
    }
  }
  const timer = setInterval(poll, 150);
  poll();
  return () => {
    active = false;
    clearInterval(timer);
  };
}
export const connectAuthEmulator = () => {},
  connectFirestoreEmulator = () => {};

export async function runTransaction(_db, callback) {
  for (let retry = 0; retry < 10; retry++) {
    const reads = {},
      writes = [];
    const tx = {
      get: async (ref) => {
        const value = await rpc("read", { path: ref.path });
        reads[ref.path] = value;
        return {
          exists: () => value !== null,
          data: () => structuredClone(value),
        };
      },
      set: (ref, data) => writes.push({ type: "set", path: ref.path, data }),
      update: (ref, data) =>
        writes.push({ type: "update", path: ref.path, data }),
    };
    const result = await callback(tx);
    if (!writes.length) return result;
    try {
      await rpc("commit", { reads, writes });
      return result;
    } catch (error) {
      if (error.code !== "aborted") throw error;
    }
  }
  throw Object.assign(Error("retry limit"), { code: "aborted" });
}
