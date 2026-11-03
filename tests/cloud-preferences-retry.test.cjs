"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const GroundCloudProgress = require("../js/cloud-progress.js");

test("transient Firestore preference failures retry without pending lesson attempts", async () => {
  const timers = new Map();
  let nextTimer = 1;
  let authListener;
  let updates = 0;
  const profile = { uid: "alice", revision: 0, xp: 0, genes: 0, completed: {}, days: [] };
  const sdk = {
    initializeFirestore: () => ({}),
    memoryLocalCache: () => ({}),
    doc: (_db, ...segments) => ({ segments }),
    collection: () => ({}),
    orderBy: () => ({}),
    limit: () => ({}),
    query: () => ({ type: "query" }),
    serverTimestamp: () => "SERVER_TIME",
    onSnapshot: (ref, callback) => {
      queueMicrotask(() => {
        if (ref.type === "query") callback({ docs: [] });
        else callback({ exists: () => true, data: () => profile });
      });
      return () => {};
    },
    updateDoc: async () => {
      updates++;
      if (updates === 1) throw { code: "unavailable" };
    },
  };
  const storage = new Map();
  const window = {
    GroundCloudProgress,
    GroundDB: {},
    GroundFirebaseConfig: { emulators: false },
    GroundAuth: {
      subscribe: (fn) => { authListener = fn; },
      start: () => {},
      context: () => ({ sdk, app: {} }),
    },
    GroundFirestoreProgress: {
      create: () => ({
        ensureProfile: async () => {},
        recordAttempt: async () => { throw new Error("not expected"); },
      }),
    },
    addEventListener: () => {},
  };
  const context = {
    window,
    navigator: { onLine: true },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    setTimeout: (fn, delay) => {
      const id = nextTimer++;
      timers.set(id, { fn, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    console,
  };
  const source = fs.readFileSync(path.join(__dirname, "../js/cloud-database.js"), "utf8");
  vm.runInNewContext(source, context, { filename: "cloud-database.js" });
  window.GroundCloud.start();
  authListener({ user: { uid: "alice" }, phase: "authenticated", busy: false });
  for (let i = 0; i < 8; i++) await new Promise(setImmediate);
  assert.equal(window.GroundCloud.current().phase, "synced");

  const initial = {
    course: "8", layout: "auto", name: "Original", onboarded: true,
    bookRead: [], bookPage: 0, scanPage: 47,
  };
  window.GroundCloud.setBaseline(initial);
  window.GroundCloud.preferences({ ...initial, name: "Updated" });

  const runTimer = async (delay) => {
    const entry = [...timers.entries()].find(([, value]) => value.delay === delay);
    assert.ok(entry, "Expected " + delay + "ms timer");
    timers.delete(entry[0]);
    entry[1].fn();
    for (let i = 0; i < 8; i++) await new Promise(setImmediate);
  };
  await runTimer(500);
  assert.equal(updates, 1);
  assert.equal(window.GroundCloud.current().phase, "error");
  assert.equal(window.GroundCloud.current().pending, 1);
  assert.equal(window.GroundCloud.current().queue.length, 0);

  await runTimer(15000);
  assert.equal(updates, 2);
  assert.equal(window.GroundCloud.current().pending, 0);
  assert.equal(window.GroundCloud.current().phase, "synced");
});
