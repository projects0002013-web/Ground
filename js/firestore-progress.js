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
            lastAttemptResult: null,
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
      const pendingAnswers = JSON.parse(JSON.stringify(evaluation.result.answers));
      const pendingResult = JSON.parse(JSON.stringify(evaluation.result));
      delete pendingResult.answers;
      const pendingActivity = {
        key: evaluation.activity.key,
        kind: evaluation.activity.kind,
        courseKey: evaluation.activity.courseKey,
        previous: evaluation.activity.previous || null,
        rewardXP: evaluation.activity.rewardXP,
        rewardGenes: evaluation.activity.rewardGenes,
        version: evaluation.activity.version,
      };
      await sdk.runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(attempt);
        if (!snapshot.exists())
          transaction.set(attempt, {
            key: input.key,
            activity: pendingActivity,
            result: pendingResult,
            answers: pendingAnswers,
            createdAt: sdk.serverTimestamp(),
            applied: false,
          });
      });
      const committed = await sdk.runTransaction(db, async (transaction) => {
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
        const saved = attemptSnapshot.data(),
          current = profileSnapshot.data();
        if (saved.key !== input.key || saved.result?.attemptId !== input.id)
          throw new engine.ProgressError(
            "already-exists",
            "Номер попытки уже использован.",
          );
        if (saved.applied === true)
          return { result: { ...saved.result, answers: saved.answers || saved.result.answers || [] }, progress: current };
        if (current.lastAttemptId === input.id && current.lastAttemptResult)
          return { result: { ...current.lastAttemptResult, answers: saved.answers || [] }, progress: current };
        const { profile, result } = engine.apply(
          current,
          { activity: saved.activity, result: { ...saved.result, answers: saved.answers || [] } },
        );
        profile.lastAttemptId = input.id;
        const ledgerResult = JSON.parse(JSON.stringify(result));
        const ledgerAnswers = ledgerResult.answers;
        delete ledgerResult.answers;
        profile.lastAttemptResult = ledgerResult;
        transaction.update(ref, {
          ...profile,
          lastActiveAt: sdk.serverTimestamp(),
          updatedAt: sdk.serverTimestamp(),
        });
        return { result, progress: profile, ledgerResult, ledgerAnswers };
      });
      // The profile transaction is the source of truth for XP and genes.
      // This separate ledger write only finalizes history.
      if (committed.ledgerResult) {
        try {
          await sdk.runTransaction(db, async (transaction) => {
            const snapshot = await transaction.get(attempt);
            if (snapshot.exists() && snapshot.data().applied === false)
              transaction.update(attempt, {
                result: committed.ledgerResult,
                answers: committed.ledgerAnswers,
                applied: true,
                appliedAt: sdk.serverTimestamp(),
              });
          });
        } catch {
          // A saved profile remains valid even if history finalization retries later.
        }
      }
      return { result: committed.result, progress: committed.progress };
    }
    return { ensureProfile, recordAttempt };
  }
  const api = { create };
  root.GroundFirestoreProgress = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
