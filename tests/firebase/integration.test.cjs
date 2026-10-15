const { test, before, after } = require("node:test");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { initializeApp, deleteApp } = require("firebase/app");
const {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  connectAuthEmulator,
} = require("firebase/auth");
const {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} = require("firebase/firestore");
const sdk = require("firebase/firestore");
const storage = require("../../js/firestore-progress.js");
const engine = require("../../js/progress-engine.js");
const PROJECT = "demo-ground";
let rulesEnv,
  apps = [];
async function device(name, subject = "alice") {
  const app = initializeApp(
    {
      apiKey: "demo-emulator-only",
      authDomain: `${PROJECT}.firebaseapp.com`,
      projectId: PROJECT,
      appId: "demo-emulator-only",
    },
    name,
  );
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const token = JSON.stringify({
    sub: subject,
    email: `${subject}@example.test`,
    email_verified: true,
    name: `Student ${subject}`,
  });
  await signInWithCredential(auth, GoogleAuthProvider.credential(token));
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const adapter = storage.create(sdk, db);
  return {
    app,
    auth,
    db,
    uid: auth.currentUser.uid,
    ensure: () => adapter.ensureProfile(auth.currentUser),
    record: async (input) => ({
      data: await adapter.recordAttempt(auth.currentUser.uid, input),
    }),
  };
}
function attempt(key, id) {
  const a = engine.catalog.activities[key];
  return {
    id,
    key,
    version: a.version,
    answers: a.questions.map((q, index) => ({ index, selected: q.correct })),
  };
}
before(async () => {
  rulesEnv = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
  await rulesEnv.clearFirestore();
});
after(async () => {
  await Promise.all(apps.map(deleteApp));
  await rulesEnv.cleanup();
});
test("real SDK + Auth/Firestore emulators: concurrency, replay, isolation and protected rewards", async () => {
  const laptop = await device("laptop"),
    phone = await device("phone"),
    bob = await device("bob", "bob");
  assert.equal(laptop.uid, phone.uid);
  assert.notEqual(laptop.uid, bob.uid);
  await Promise.all([laptop.ensure({}), phone.ensure({}), bob.ensure({})]);
  const own = doc(laptop.db, "users", laptop.uid);
  let profile = (await getDoc(own)).data();
  assert.equal(profile.xp, 0);
  assert.ok(profile.createdAt.toDate());
  const a = attempt("8:1", "device-laptop-attempt-0001"),
    b = attempt("8:1", "device-phone-attempt-00002");
  const responses = await Promise.all([laptop.record(a), phone.record(b)]);
  assert.equal(
    responses.reduce((n, r) => n + r.data.result.rewardXP, 0),
    30,
  );
  profile = (await getDoc(doc(phone.db, "users", phone.uid))).data();
  assert.equal(profile.xp, 30);
  assert.equal(profile.genes, 5);
  assert.equal(profile.level, 1);
  assert.ok(profile.completed["8:1"]);
  await Promise.all([laptop.record(a), phone.record(a), laptop.ensure({})]);
  assert.equal((await getDoc(own)).data().xp, 30);
  await assertFails(
    updateDoc(own, { xp: 9999, genes: 9999, updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(own, {
      completed: { "8:2": { percent: 100 } },
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(laptop.db, "users", laptop.uid, "attempts", "fake-result"), {
      result: { passed: true },
    }),
  );
  await assertFails(getDoc(doc(laptop.db, "users", bob.uid)));
  await assertFails(
    updateDoc(doc(laptop.db, "users", bob.uid), {
      nickname: "Stolen",
      updatedAt: serverTimestamp(),
    }),
  );
  const anon = rulesEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, "users", laptop.uid)));
  await assertSucceeds(
    updateDoc(own, {
      selectedGrade: "7",
      layout: "phone",
      nickname: "Исследователь",
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(own, { layout: "forged", updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(own, { bookRead: [99], updatedAt: serverTimestamp() }),
  );
  await assert.rejects(
    laptop.record({
      ...attempt("8:2", "forged-reward-attempt-0003"),
      rewardXP: 100000,
    }),
  );
  await assert.rejects(
    bob.record(attempt("8:2", "locked-attempt-number-0001")),
  );
  const failed = attempt("7:1", "failed-ecosystem-attempt-001");
  failed.answers = failed.answers.slice(0, 27);
  const failure = (await laptop.record(failed)).data.result;
  assert.equal(failure.passed, false);
  assert.equal(failure.total, 40);
  assert.equal((await getDoc(own)).data().xp, 30);
  await laptop.record(attempt("8:2", "second-lesson-attempt-0001"));
  await laptop.ensure({});
  profile = (await getDoc(own)).data();
  assert.equal(profile.xp, 60);
  assert.equal(profile.genes, 10);
  assert.equal(profile.nickname, "Исследователь");
  assert.equal((await getDoc(doc(bob.db, "users", bob.uid))).data().xp, 0);
  const ledger = await getDoc(
    doc(laptop.db, "users", laptop.uid, "attempts", a.id),
  );
  assert.equal(ledger.data().result.correct, 40);
  const attacker = {
    ...attempt("8:3", "spoof-other-user-attempt-01"),
    uid: bob.uid,
  };
  await assert.rejects(laptop.record(attacker));
});
test("rules allow a balance-preserving catalog migration and reject deleting current lessons or forging XP", async () => {
  const learner = await device("migration", "migration");
  const own = doc(learner.db, "users", learner.uid);
  const old = {
    ...engine.emptyProfile(learner.uid),
    xp: 90,
    genes: 15,
    revision: 7,
    layout: "phone",
    courseVersions: { 7: 2 },
    completed: {
      "7:1": { percent: 100, at: "2026-10-10" },
      "8:1": { percent: 100, at: "2026-10-10" },
      "9:1": { percent: 100, at: "2026-10-10" },
      "ent:1": { percent: 100, at: "2026-10-10" },
    },
    completedLessons: ["7:1", "8:1", "9:1", "ent:1"],
    lastAttemptId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await rulesEnv.withSecurityRulesDisabled(async (context) =>
    setDoc(doc(context.firestore(), "users", learner.uid), old),
  );
  const next = engine.currentProfile(old);
  const patch = Object.fromEntries(
    [
      "completed",
      "completedLessons",
      "completedExams",
      "completedRoadLessons",
      "courseVersions",
    ].map((k) => [k, next[k]]),
  );
  patch.revision = 8;
  patch.updatedAt = serverTimestamp();
  await assertFails(updateDoc(own, { ...patch, xp: 1000, level: 11 }));
  await assertFails(
    updateDoc(own, {
      ...patch,
      completed: { "ent:1": next.completed["ent:1"] },
      completedLessons: ["ent:1"],
    }),
  );
  await assertSucceeds(learner.ensure());
  const profile = (await getDoc(own)).data();
  assert.equal(profile.xp, 90);
  assert.equal(profile.genes, 15);
  assert.equal(profile.layout, "phone");
  assert.deepEqual(Object.keys(profile.completed).sort(), ["7:1", "ent:1"]);
  assert.deepEqual(profile.courseVersions, engine.catalog.versions);
  await assertFails(
    updateDoc(own, {
      completed: {},
      completedLessons: [],
      courseVersions: { 7: 2 },
      revision: 9,
      updatedAt: serverTimestamp(),
    }),
  );
  await learner.record(attempt("8:1", "new-curriculum-attempt-0001"));
  assert.equal((await getDoc(own)).data().xp, 120);
});
test("legacy metadata upgrades preserve balances and dates; unknown achievements and forged activity writes are denied", async () => {
  const learner = await device("metadata-upgrade", "metadata-upgrade");
  const own = doc(learner.db, "users", learner.uid);
  const old = {
    ...engine.emptyProfile(learner.uid),
    xp: 150,
    genes: 25,
    level: 2,
    days: ["2026-10-01", "2026-10-02", "2026-10-03"],
    lastAttemptId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  delete old.achievements;
  await rulesEnv.withSecurityRulesDisabled((context) =>
    setDoc(doc(context.firestore(), "users", learner.uid), old),
  );
  const previous = (await getDoc(own)).data();
  await learner.ensure();
  const next = (await getDoc(own)).data();
  assert.equal(next.xp, 150);
  assert.equal(next.genes, 25);
  assert.deepEqual(next.days, old.days);
  assert.ok(next.achievements.includes("three-day-streak"));
  assert.ok(next.lastActiveAt.isEqual(previous.updatedAt));
  await assertFails(
    updateDoc(own, {
      achievements: ["unknown-badge"],
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(own, { achievements: [], updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(own, {
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
});
