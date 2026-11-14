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
            lastActiveAt: sdk.serverTimestamp(),
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
          if (!Array.isArray(old.achievements))
            patch.achievements = engine.achievementIDs(old);
          if (!old.lastActiveAt)
            patch.lastActiveAt =
              old.updatedAt || old.createdAt || sdk.serverTimestamp();
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
      // Create the immutable pending ledger entry separately. Keeping this
      // write out of the progress transaction avoids combining two expensive
      // Firestore Rules evaluations in one request.
      const pendingResult = JSON.parse(JSON.stringify(evaluation.result));
      const pendingActivity = {
        key: evaluation.activity.key,
        kind: evaluation.activity.kind,
        courseKey: evaluation.activity.courseKey,
        previous: evaluation.activity.previous || null,
        rewardXP: evaluation.activity.rewardXP,
        rewardGenes: evaluation.activity.rewardGenes,
        version: evaluation.activity.version,
      };
      try {
        await sdk.setDoc(attempt, {
          key: input.key,
          activity: pendingActivity,
          result: pendingResult,
          createdAt: sdk.serverTimestamp(),
          applied: false,
        });
      } catch (error) {
        // An existing attempt is an idempotent retry, not a new submission.
        const existing = await sdk.getDoc(attempt);
        if (!existing.exists()) throw error;
      }
      return sdk.runTransaction(db, async (transaction) => {
        const profileSnapshot = await transaction.get(ref),
          attemptSnapshot = await transaction.get(attempt);
        if (!profileSnapshot.exists())
          throw new engine.ProgressError(
            "failed-precondition",
            "Профиль ещё загружается.",
          );
        if (!attemptSnapshot.exists())
          throw new engine.ProgressError(
            "failed-precondition",
            "Попытка не сохранена. Повтори отправку.",
          );
        const saved = attemptSnapshot.data();
        if (saved.key !== input.key || saved.result?.attemptId !== input.id)
          throw new engine.ProgressError(
            "already-exists",
            "Номер попытки уже использован.",
          );
        // Older ledger records predate the applied flag and are already final.
        if (saved.applied !== false)
          return { result: saved.result, progress: profileSnapshot.data() };
        const { profile, result } = engine.apply(
          profileSnapshot.data(),
          { activity: saved.activity, result: saved.result },
        );
        profile.lastAttemptId = input.id;
        const ledgerResult = JSON.parse(JSON.stringify(result));
        transaction.update(ref, {
          ...profile,
          lastActiveAt: sdk.serverTimestamp(),
          updatedAt: sdk.serverTimestamp(),
        });
        transaction.update(attempt, {
          result: ledgerResult,
          applied: true,
          appliedAt: sdk.serverTimestamp(),
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
