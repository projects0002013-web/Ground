/* Free-plan storage adapter. Transactions protect concurrency, not exam integrity. */
(function (root) {
  "use strict";
  const engine =
    typeof module !== "undefined"
      ? require("./progress-engine.js")
      : root.GroundProgressEngine;
  function create(sdk, db) {
    async function ensureProfile(user) {
      const ref = sdk.doc(db, "users", user.uid);
      await sdk.runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        const identity = {
          displayName: String(user.displayName || "Биолог").slice(0, 200),
          email: String(user.email || "").slice(0, 320),
          photoURL: String(user.photoURL || "").slice(0, 2048),
        };
        if (!snapshot.exists())
          transaction.set(ref, {
            ...engine.emptyProfile(user.uid),
            ...identity,
            lastAttemptId: null,
            createdAt: sdk.serverTimestamp(),
            updatedAt: sdk.serverTimestamp(),
          });
        else {
          const old = snapshot.data();
          // Repeated login normally performs no write and never resets rewards.
          const patch = Object.fromEntries(
            Object.entries(identity).filter(
              ([key, value]) => old[key] !== value,
            ),
          );
          const changedCourse = Object.entries(engine.catalog.versions).some(
            ([key, version]) => old.courseVersions?.[key] !== version,
          );
          if (changedCourse) {
            const next = engine.currentProfile(old);
            for (const key of [
              "completed",
              "completedLessons",
              "completedExams",
              "completedRoadLessons",
              "courseVersions",
            ])
              patch[key] = next[key];
            patch.revision = (old.revision || 0) + 1;
          }
          if (Object.keys(patch).length)
            transaction.update(ref, {
              ...patch,
              updatedAt: sdk.serverTimestamp(),
            });
        }
      });
    }
    async function recordAttempt(uid, input) {
      const evaluation = engine.evaluate(input),
        ref = sdk.doc(db, "users", uid),
        attempt = sdk.doc(db, "users", uid, "attempts", input.id);
      return sdk.runTransaction(db, async (transaction) => {
        const profileSnapshot = await transaction.get(ref),
          attemptSnapshot = await transaction.get(attempt);
        if (!profileSnapshot.exists())
          throw new engine.ProgressError(
            "failed-precondition",
            "Профиль ещё загружается.",
          );
        if (attemptSnapshot.exists()) {
          if (attemptSnapshot.data().key !== input.key)
            throw new engine.ProgressError(
              "already-exists",
              "Номер попытки уже использован.",
            );
          return {
            result: attemptSnapshot.data().result,
            progress: profileSnapshot.data(),
          };
        }
        const { profile, result } = engine.apply(
          profileSnapshot.data(),
          evaluation,
        );
        profile.lastAttemptId = input.id;
        transaction.set(ref, { ...profile, updatedAt: sdk.serverTimestamp() });
        transaction.set(attempt, {
          key: result.key,
          result,
          createdAt: sdk.serverTimestamp(),
        });
        return { result, progress: profile };
      });
    }
    return { ensureProfile, recordAttempt };
  }
  const api = { create };
  root.GroundFirestoreProgress = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
