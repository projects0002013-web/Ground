export { initializeApp } from "firebase/app";
export {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
export {
  initializeFirestore,
  memoryLocalCache,
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";
export {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
