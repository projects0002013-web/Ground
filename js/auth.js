/* Firebase Authentication only; no passwords or Admin credentials in the browser. */
(() => {
  "use strict";
  let sdk,
    auth,
    app,
    started = false,
    busy = false;
  const listeners = new Set();
  let state = { user: null, phase: "loading", error: "" };
  const emit = () => listeners.forEach((fn) => fn({ ...state, busy }));
  const config = () => window.GroundFirebaseConfig;
  const configured = () =>
    ["apiKey", "authDomain", "projectId", "appId"].every(
      (key) =>
        typeof config()?.firebase?.[key] === "string" &&
        config().firebase[key].trim(),
    );
  const errors = {
    "auth/popup-blocked":
      "Браузер заблокировал окно входа. Попробуем войти через переход.",
    "auth/popup-closed-by-user": "Вход отменён. Можно попробовать снова.",
    "auth/cancelled-popup-request": "Другая попытка входа уже открыта.",
    "auth/unauthorized-domain": "Вход на этом адресе пока не подключён.",
    "auth/network-request-failed":
      "Нет связи. Проверь интернет и попробуй снова.",
    "auth/operation-not-allowed": "Вход через Google пока не включён.",
    "auth/web-storage-unsupported":
      "Браузер не разрешает сохранять вход. Проверь настройки хранения данных.",
  };
  function errorText(error) {
    return (
      errors[error?.code] || "Не удалось войти. Попробуй снова чуть позже."
    );
  }
  function userInfo(user) {
    return user
      ? {
          uid: user.uid,
          displayName: user.displayName || "Биолог",
          email: user.email || "",
          photoURL: user.photoURL || "",
        }
      : null;
  }
  async function start() {
    if (started) return;
    started = true;
    if (!configured()) {
      state = { user: null, phase: "unconfigured", error: "" };
      emit();
      return;
    }
    try {
      sdk = await import("./firebase-sdk.js");
      app = sdk.initializeApp(config().firebase);
      auth = sdk.getAuth(app);
      if (config().emulators) {
        if (
          !["localhost", "127.0.0.1"].includes(location.hostname) ||
          !config().firebase.projectId.startsWith("demo-")
        )
          throw new Error("Emulators are restricted to local demo projects.");
        sdk.connectAuthEmulator(auth, "http://127.0.0.1:9099", {
          disableWarnings: true,
        });
      }
      await sdk.setPersistence(auth, sdk.browserLocalPersistence);
      sdk.onAuthStateChanged(
        auth,
        (user) => {
          state = {
            user: userInfo(user),
            phase: user ? "authenticated" : "guest",
            error: "",
          };
          emit();
        },
        (error) => {
          state = { ...state, phase: "error", error: errorText(error) };
          emit();
        },
      );
      try {
        await sdk.getRedirectResult(auth);
      } catch (error) {
        state = { ...state, error: errorText(error) };
        emit();
      }
    } catch (error) {
      state = { user: null, phase: "error", error: errorText(error) };
      emit();
    }
  }
  async function signIn() {
    if (busy || !sdk || !auth) return;
    busy = true;
    state.error = "";
    emit();
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await sdk.signInWithPopup(auth, provider);
    } catch (error) {
      if (
        [
          "auth/popup-blocked",
          "auth/operation-not-supported-in-this-environment",
        ].includes(error.code)
      ) {
        try {
          await sdk.signInWithRedirect(auth, provider);
        } catch (redirectError) {
          state.error = errorText(redirectError);
        }
      } else state.error = errorText(error);
    } finally {
      busy = false;
      emit();
    }
  }
  async function signOut() {
    if (busy || !auth) return;
    busy = true;
    emit();
    try {
      await sdk.signOut(auth);
    } catch (error) {
      state.error = "Не удалось выйти. Попробуй ещё раз.";
    } finally {
      busy = false;
      emit();
    }
  }
  window.GroundAuth = {
    start,
    signIn,
    signOut,
    configured,
    subscribe(fn) {
      listeners.add(fn);
      fn({ ...state, busy });
      return () => listeners.delete(fn);
    },
    context: () => ({ sdk, app, auth }),
    errorText,
  };
})();
