/* Exercises the actual callable handlers with an in-memory transaction adapter.
   This does not replace the Firestore Rules / real emulator suite. */
const test = require("node:test"),
  assert = require("node:assert/strict"),
  vm = require("node:vm"),
  fs = require("node:fs");
const engine = require("../functions/progress.cjs");
function backend() {
  const documents = new Map();
  let tail = Promise.resolve();
  const ref = (path) => ({
    path,
    collection: (name) => ({ doc: (id) => ref(`${path}/${name}/${id}`) }),
  });
  const snapshot = (r) => ({
    exists: documents.has(r.path),
    data: () => structuredClone(documents.get(r.path)),
  });
  const db = {
    doc: ref,
    runTransaction(fn) {
      const work = tail.then(async () => {
        const writes = [];
        const tx = {
          get: async (r) => snapshot(r),
          getAll: async (...refs) => refs.map(snapshot),
          create: (r, v) => {
            if (documents.has(r.path)) throw Error("exists");
            writes.push([r, v]);
          },
          update: (r, v) =>
            writes.push([r, { ...documents.get(r.path), ...v }]),
          set: (r, v) => writes.push([r, v]),
        };
        const result = await fn(tx);
        for (const [r, v] of writes) documents.set(r.path, structuredClone(v));
        return result;
      });
      tail = work.catch(() => {});
      return work;
    },
  };
  class HttpsError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }
  const exports = {};
  const dependencies = {
    "firebase-admin/app": { initializeApp() {} },
    "firebase-admin/firestore": {
      getFirestore: () => db,
      FieldValue: { serverTimestamp: () => ({ serverTimestamp: true }) },
    },
    "firebase-functions/v2/https": {
      onCall: (_options, handler) => handler,
      HttpsError,
    },
    "./progress.cjs": engine,
  };
  vm.runInNewContext(fs.readFileSync("functions/index.cjs", "utf8"), {
    require: (name) => dependencies[name],
    exports,
  });
  return { ...exports, documents };
}
const auth = (uid) => ({
  uid,
  token: { name: `Student ${uid}`, email: `${uid}@example.test` },
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
test("callable transactions create profiles once, award once across devices, replay and isolate accounts", async () => {
  const b = backend(),
    alice = auth("alice");
  await Promise.all([
    b.ensureProfile({ auth: alice }),
    b.ensureProfile({ auth: alice }),
    b.ensureProfile({ auth: auth("bob") }),
  ]);
  const first = attempt("laptop-attempt-0001"),
    second = attempt("phone-attempt-00002");
  const results = await Promise.all([
    b.recordAttempt({ auth: alice, data: first }),
    b.recordAttempt({ auth: alice, data: second }),
  ]);
  assert.equal(
    results.reduce((sum, r) => sum + r.result.rewardXP, 0),
    30,
  );
  const replay = await b.recordAttempt({ auth: alice, data: first });
  assert.equal(replay.progress.xp, 30);
  assert.equal(replay.result.rewardXP, results[0].result.rewardXP);
  await b.ensureProfile({ auth: alice });
  assert.equal(b.documents.get("users/alice").xp, 30);
  assert.equal(b.documents.get("users/alice").genes, 5);
  assert.equal(b.documents.get("users/bob").xp, 0);
  assert.equal(
    [...b.documents.keys()].filter((k) => k.includes("/attempts/")).length,
    2,
  );
});
test("callables require authentication and reject forged rewards, identity and locked lessons", async () => {
  const b = backend();
  await assert.rejects(b.ensureProfile({}), { code: "unauthenticated" });
  await b.ensureProfile({ auth: auth("alice") });
  await assert.rejects(
    b.recordAttempt({
      auth: auth("alice"),
      data: { ...attempt("forged-attempt-0001"), xp: 9999 },
    }),
    { code: "invalid-argument" },
  );
  await assert.rejects(
    b.recordAttempt({
      auth: auth("alice"),
      data: { ...attempt("forged-attempt-0002"), uid: "bob" },
    }),
    { code: "invalid-argument" },
  );
  await assert.rejects(
    b.recordAttempt({
      auth: auth("alice"),
      data: attempt("locked-attempt-0001", "8:2"),
    }),
    { code: "failed-precondition" },
  );
  assert.equal(b.documents.get("users/alice").xp, 0);
  assert.equal(b.documents.size, 1);
});
