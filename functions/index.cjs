"use strict";
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const {
  emptyProfile,
  evaluate,
  apply,
  ProgressError,
} = require("./progress.cjs");
initializeApp();
const db = getFirestore();
const options = {
  region: "europe-west1",
  maxInstances: 10,
  timeoutSeconds: 30,
};
function identity(request) {
  if (!request.auth)
    throw new HttpsError("unauthenticated", "Войди через Google.");
  return request.auth;
}
exports.ensureProfile = onCall(options, async (request) => {
  const auth = identity(request),
    ref = db.doc(`users/${auth.uid}`);
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists)
      tx.create(ref, {
        ...emptyProfile(auth.uid, auth.token),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    else
      tx.update(ref, {
        displayName: String(
          auth.token.name || snapshot.data().displayName,
        ).slice(0, 200),
        email: String(auth.token.email || "").slice(0, 320),
        photoURL: String(auth.token.picture || "").slice(0, 2048),
        updatedAt: FieldValue.serverTimestamp(),
      });
  });
  return { ok: true };
});
exports.recordAttempt = onCall(options, async (request) => {
  const auth = identity(request);
  try {
    const evaluation = evaluate(request.data),
      ref = db.doc(`users/${auth.uid}`),
      attempt = ref.collection("attempts").doc(request.data.id);
    return await db.runTransaction(async (tx) => {
      const [profileSnapshot, attemptSnapshot] = await tx.getAll(ref, attempt);
      if (!profileSnapshot.exists)
        throw new HttpsError("failed-precondition", "Профиль ещё загружается.");
      if (attemptSnapshot.exists) {
        if (attemptSnapshot.data().key !== request.data.key)
          throw new HttpsError(
            "already-exists",
            "Номер попытки уже использован.",
          );
        return {
          result: attemptSnapshot.data().result,
          progress: profileSnapshot.data(),
        };
      }
      const { profile, result } = apply(profileSnapshot.data(), evaluation);
      tx.set(ref, { ...profile, updatedAt: FieldValue.serverTimestamp() });
      tx.create(attempt, {
        key: result.key,
        result,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { result, progress: profile };
    });
  } catch (error) {
    if (error instanceof ProgressError)
      throw new HttpsError(error.code, error.message);
    throw error;
  }
});
