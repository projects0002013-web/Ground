const test = require("node:test"),
  assert = require("node:assert/strict");
const C = require("../js/cloud-progress.js");
const S = require("../js/progress-engine.js");
global.window = {};
require("../js/database.js");
const DB = window.GroundDB;
const source = DB.courses["8"].lessons[0];
const now = new Date("2026-10-10T10:00:00Z");
function result() {
  return {
    key: "8:1",
    courseVersion: DB.courses["8"].progressVersion,
    kind: "lesson",
    courseKey: "8",
    lessonId: 1,
    title: source.title,
    completedAt: now.toISOString(),
    day: "2026-10-10",
    passed: true,
    answers: source.questions.map((q) => {
      const options = q.answers.slice().reverse();
      return {
        question: q.question,
        options,
        selected: options.indexOf(q.answers[q.correct]),
        correct: options.indexOf(q.answers[q.correct]),
        explanation: q.explanation,
      };
    }),
  };
}
function input(key = "8:1", id = "00000000-0000-4000-8000-000000000001") {
  const a = S.catalog.activities[key];
  return {
    id,
    key,
    version: a.version,
    answers: a.questions.map((q, index) => ({ index, selected: q.correct })),
  };
}
test("shuffled browser answers map to canonical server choices without trusting reward fields", () => {
  const r = result();
  r.xp = 100000;
  r.rewardXP = 99999;
  const mapped = C.submission(DB, r, "00000000-0000-4000-8000-000000000001");
  assert.deepEqual(
    mapped.answers,
    source.questions.map((q, index) => ({ index, selected: q.correct })),
  );
  assert.equal(Object.hasOwn(mapped, "xp"), false);
  assert.equal(S.evaluate(mapped, now).result.correct, 40);
  const replay = S.apply(S.emptyProfile("alice"), S.evaluate(mapped, now), now);
  assert.equal(replay.profile.xp, 30);
  assert.equal(replay.profile.genes, 5);
  assert.equal(
    S.apply(replay.profile, S.evaluate(mapped, now), now).result.rewardXP,
    0,
  );
});
test("browser scoring rejects forged rewards, answers, duplicate questions and out-of-order lessons", () => {
  assert.throws(() => S.evaluate({ ...input(), rewardXP: 9999 }), /формат/);
  assert.throws(
    () => S.evaluate({ ...input(), answers: [{ index: 0, selected: 999 }] }),
    /ответ/,
  );
  assert.throws(
    () =>
      S.evaluate({
        ...input(),
        answers: [
          { index: 0, selected: 0 },
          { index: 0, selected: 0 },
        ],
      }),
    /повторный/,
  );
  assert.throws(() => S.evaluate({ ...input("7:1"), version: 1 }), /обновлён/);
  assert.throws(
    () => S.apply(S.emptyProfile("alice"), S.evaluate(input("8:2"), now), now),
    /предыдущий/,
  );
  assert.throws(
    () =>
      S.apply(
        S.emptyProfile("alice"),
        S.evaluate(input("book:chemistry"), now),
        now,
      ),
    /разделы/,
  );
});
test("40-question pass threshold includes unanswered questions; failure cannot award or unlock", () => {
  const attempt = input("7:1");
  attempt.answers = attempt.answers.slice(0, 27);
  const failed = S.apply(
    S.emptyProfile("alice"),
    S.evaluate(attempt, now),
    now,
  );
  assert.equal(failed.result.total, 40);
  assert.equal(failed.result.passed, false);
  assert.equal(failed.profile.xp, 0);
  assert.deepEqual(failed.profile.completed, {});
  attempt.answers = input("7:1").answers.slice(0, 28);
  assert.equal(
    S.apply(failed.profile, S.evaluate(attempt, now), now).profile.xp,
    30,
  );
});
test("practice is checked against catalog without earning currency", () => {
  const attempt = {
    id: "00000000-0000-4000-8000-000000000001",
    key: "8:practice",
    version: 1,
    answers: [{ ref: "8:1:0", selected: source.questions[0].correct }],
  };
  const done = S.apply(S.emptyProfile("alice"), S.evaluate(attempt, now), now);
  assert.equal(done.result.correct, 1);
  assert.equal(done.profile.xp, 0);
  assert.equal(done.profile.genes, 0);
});
test("pending offline completion opens the road locally, keeping authoritative currency and account separation", () => {
  const local = {
    xp: 100000,
    genes: 20000,
    completed: { "8:3": { percent: 100 } },
    history: [],
    session: { key: "8:2" },
    lastResult: null,
  };
  const pending = {
    result: { ...result(), attemptId: "offline-attempt-0001", rewardXP: 9999 },
    error: "",
  };
  const merged = C.merge(
    { ...S.emptyProfile("alice"), xp: 30, genes: 5 },
    local,
    [pending],
    [],
  );
  assert.equal(merged.xp, 30);
  assert.equal(merged.genes, 5);
  assert.ok(merged.completed["8:1"]);
  assert.equal(merged.completed["8:3"], undefined);
  assert.equal(merged.session.key, "8:2");
  assert.notEqual(C.accountKey("alice"), C.accountKey("bob"));
  assert.notEqual(C.queueKey("alice"), C.queueKey("bob"));
  assert.deepEqual(
    C.merge(
      S.emptyProfile("alice"),
      local,
      [{ ...pending, error: "rejected" }],
      [],
    ).completed,
    {},
  );
});
test("study days use Kazakhstan timezone and preserve cumulative currency across course versions", () => {
  assert.equal(S.dayKey(new Date("2026-10-10T20:00:00Z")), "2026-10-11");
  assert.equal(S.streak(["2026-10-09", "2026-10-10"], now), 2);
  const legacy = {
    ...S.emptyProfile("alice"),
    xp: 90,
    genes: 15,
    courseVersions: { ...S.catalog.versions, 7: 1 },
    completed: { "7:1": { percent: 100 }, "8:1": { percent: 70 } },
  };
  const compatible = S.currentProfile(legacy);
  assert.equal(compatible.xp, 90);
  assert.equal(compatible.completed["7:1"], undefined);
  assert.ok(compatible.completed["8:1"]);
});
test("obsolete offline attempts cannot unlock replacement course content", () => {
  const stale = { result: { ...result(), courseVersion: 1 }, error: "" };
  const merged = C.merge(
    S.emptyProfile("alice"),
    { history: [], lastResult: null },
    [stale],
    [],
  );
  assert.equal(merged.completed["8:1"], undefined);
  assert.equal(merged.xp, 0);
  assert.equal(merged.history.length, 1);
});
test("offline and guest attempts preserve original study days and earned achievements", () => {
  const profile = S.emptyProfile("alice");
  let current = profile;
  for (const [index, day] of [
    "2026-10-01",
    "2026-10-02",
    "2026-10-03",
  ].entries()) {
    const data = {
      ...input("8:1", `original-day-attempt-${index}-0001`),
      completedAt: day + "T10:00:00Z",
    };
    const evaluated = S.evaluate(data, new Date("2026-10-04T10:00:00Z"));
    assert.equal(evaluated.result.day, day);
    current = S.apply(
      current,
      evaluated,
      new Date("2026-10-04T10:00:00Z"),
    ).profile;
  }
  assert.equal(current.xp, 30);
  assert.equal(current.genes, 5);
  assert.equal(current.streak, 3);
  assert.deepEqual(current.days, ["2026-10-01", "2026-10-02", "2026-10-03"]);
  assert.ok(current.achievements.includes("three-day-streak"));
  assert.ok(
    S.achievementIDs({ ...current, days: [] }).includes("three-day-streak"),
  );
  const r = result();
  r.completedAt = "2026-10-01T10:00:00Z";
  assert.equal(
    C.submission(DB, r, "import-history-date-0001").completedAt,
    r.completedAt,
  );
  for (const value of [
    "not-a-date",
    "1999-12-31T23:59:59Z",
    "2026-11-01T00:00:00Z",
    123,
  ])
    assert.throws(() => S.evaluate({ ...input(), completedAt: value }, now), {
      code: "invalid-argument",
    });
});
