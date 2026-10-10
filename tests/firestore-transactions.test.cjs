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
