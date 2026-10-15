/* Exercises the real free-plan transaction adapter with an in-memory SDK.
   Firestore Rules are checked separately by the official emulator tests. */
const test = require("node:test"),
  assert = require("node:assert/strict");
const engine = require("../js/progress-engine.js"),
  storage = require("../js/firestore-progress.js");
function backend() {
  const documents = new Map(),
    versions = new Map();
  let writes = 0,
    conflicts = 0;
  const sdk = {
    doc: (_db, ...path) => ({ path: path.join("/") }),
    serverTimestamp: () => ({ serverTimestamp: true }),
    async runTransaction(_db, fn) {
      for (let retry = 0; retry < 10; retry++) {
        const reads = new Map(),
          pending = [];
        const tx = {
          get: async (ref) => {
            const value = structuredClone(documents.get(ref.path));
            reads.set(ref.path, versions.get(ref.path) || 0);
            await new Promise((resolve) => setImmediate(resolve));
            return {
              exists: () => value !== undefined,
              data: () => structuredClone(value),
            };
          },
          update: (ref, value) =>
            pending.push([ref, { ...documents.get(ref.path), ...value }]),
          set: (ref, value) => pending.push([ref, value]),
        };
        const result = await fn(tx);
        if (
          [...reads].some(
            ([path, version]) => (versions.get(path) || 0) !== version,
          )
        ) {
          conflicts++;
          continue;
        }
        for (const [ref, value] of pending) {
          documents.set(ref.path, structuredClone(value));
          versions.set(ref.path, (versions.get(ref.path) || 0) + 1);
          writes++;
        }
        return result;
      }
      throw Error("transaction retries exhausted");
    },
  };
  return {
    ...storage.create(sdk, {}),
    documents,
    writes: () => writes,
    conflicts: () => conflicts,
  };
}
const user = (uid) => ({
  uid,
  displayName: `Student ${uid}`,
  email: `${uid}@example.test`,
  photoURL: "",
});
function attempt(id, key = "8:1") {
  const a = engine.catalog.activities[key];
  return {
    id,
    key,
    version: a.version,
    answers: a.questions.map((q, index) => ({ index, selected: q.correct })),
  };
}
test("free Firestore transactions create profiles, award once across devices and preserve accounts on login", async () => {
  const b = backend();
  await Promise.all([
    b.ensureProfile(user("alice")),
    b.ensureProfile(user("alice")),
    b.ensureProfile(user("bob")),
  ]);
  const initialWrites = b.writes();
  await b.ensureProfile(user("alice"));
  assert.equal(b.writes(), initialWrites);
  const beforeRace = b.conflicts();
  const first = attempt("laptop-attempt-0001"),
    second = attempt("phone-attempt-00002");
  const results = await Promise.all([
    b.recordAttempt("alice", first),
    b.recordAttempt("alice", second),
  ]);
  assert.equal(
    results.reduce((sum, r) => sum + r.result.rewardXP, 0),
    30,
  );
  assert.ok(
    b.conflicts() > beforeRace,
    "conflicting transactions retry using the new balance",
  );
  const replay = await b.recordAttempt("alice", first);
  assert.equal(replay.progress.xp, 30);
  assert.equal(b.writes(), initialWrites + 4);
  await b.ensureProfile(user("alice"));
  assert.equal(b.documents.get("users/alice").xp, 30);
  assert.equal(b.documents.get("users/alice").genes, 5);
  assert.equal(b.documents.get("users/bob").xp, 0);
  assert.equal(
    [...b.documents.keys()].filter((k) => k.includes("/attempts/")).length,
    2,
  );
});
test("browser adapter rejects malformed submissions and locked lessons and updates identity without resetting rewards", async () => {
  const b = backend();
  await b.ensureProfile(user("alice"));
  await assert.rejects(
    b.recordAttempt("alice", { ...attempt("forged-attempt-0001"), xp: 9999 }),
    { code: "invalid-argument" },
  );
  await assert.rejects(
    b.recordAttempt("alice", attempt("locked-attempt-0001", "8:2")),
    { code: "failed-precondition" },
  );
  await b.recordAttempt("alice", attempt("valid-attempt-number-0001"));
  await b.ensureProfile({ ...user("alice"), displayName: "New Google name" });
  assert.equal(b.documents.get("users/alice").xp, 30);
  assert.equal(b.documents.get("users/alice").displayName, "New Google name");
});
test("catalog migration preserves balances and current courses, resets obsolete content once, then rewards the new lesson", async () => {
  const b = backend();
  await b.ensureProfile(user("alice"));
  const old = b.documents.get("users/alice");
  Object.assign(old, {
    xp: 90,
    genes: 15,
    level: 1,
    revision: 8,
    layout: "phone",
    days: ["2026-10-10"],
    streak: 1,
    courseVersions: { 7: 2 },
    completed: {
      "7:1": { percent: 100, at: "2026-10-10" },
      "8:1": { percent: 100, at: "2026-10-10" },
      "8:4": { percent: 100, at: "2026-10-10" },
      "9:1": { percent: 100, at: "2026-10-10" },
      "10:1": { percent: 100, at: "2026-10-10" },
      "11:1": { percent: 100, at: "2026-10-10" },
      "ent:1": { percent: 100, at: "2026-10-10" },
    },
  });
  await b.ensureProfile(user("alice"));
  const migrated = b.documents.get("users/alice");
  assert.equal(migrated.xp, 90);
  assert.equal(migrated.genes, 15);
  assert.equal(migrated.layout, "phone");
  assert.deepEqual(migrated.days, ["2026-10-10"]);
  assert.equal(migrated.streak, 1);
  assert.equal(migrated.revision, 9);
  assert.deepEqual(Object.keys(migrated.completed), ["7:1", "ent:1"]);
  assert.deepEqual(migrated.courseVersions, engine.catalog.versions);
  assert.ok(migrated.completedRoadLessons.includes("8:1"));
  assert.ok(!migrated.completedRoadLessons.includes("8:2"));
  const writes = b.writes();
  await b.ensureProfile(user("alice"));
  assert.equal(b.writes(), writes);
  await b.recordAttempt("alice", attempt("new-content-attempt-00001"));
  assert.equal(b.documents.get("users/alice").xp, 120);
  assert.equal(b.documents.get("users/alice").genes, 20);
});
test("existing profiles gain achievements and activity metadata once without resetting history or balances", async () => {
  const b = backend();
  await b.ensureProfile(user("alice"));
  const old = b.documents.get("users/alice");
  delete old.achievements;
  delete old.lastActiveAt;
  old.xp = 150;
  old.genes = 25;
  old.level = 2;
  old.days = ["2026-10-01", "2026-10-02", "2026-10-03"];
  old.completed = {
    "8:1": { percent: 100 },
    "8:2": { percent: 100 },
    "8:3": { percent: 100 },
    "8:4": { percent: 100 },
    "8:5": { percent: 100 },
  };
  old.activityHistory = [{ kind: "challenge", passed: true }];
  const history = structuredClone(old.activityHistory),
    revision = old.revision;
  await b.ensureProfile(user("alice"));
  const next = b.documents.get("users/alice");
  assert.deepEqual(next.achievements, [
    "first-lesson",
    "five-lessons",
    "three-day-streak",
    "challenge-passed",
  ]);
  assert.equal(next.xp, 150);
  assert.equal(next.genes, 25);
  assert.equal(next.revision, revision);
  assert.deepEqual(next.activityHistory, history);
  assert.ok(next.lastActiveAt);
  const writes = b.writes();
  await b.ensureProfile(user("alice"));
  assert.equal(b.writes(), writes);
});
