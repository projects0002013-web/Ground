const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/player.js");
global.window = {};
require("../js/database.js");
const DB = window.GroundDB;
const state = () => ({
  xp: 0,
  genes: 0,
  completed: {},
  days: [],
  history: [],
  session: null,
});
const now = new Date(2026, 9, 10, 12);
function session(overrides = {}) {
  return {
    key: "8:1",
    courseKey: "8",
    lessonId: 1,
    title: "Test",
    kind: "lesson",
    steps: [{ type: "question" }, { type: "question" }, { type: "question" }],
    answers: [
      { selected: 0, correct: 0 },
      { selected: 1, correct: 1 },
      { selected: 1, correct: 0 },
    ],
    rewardXP: 30,
    rewardGenes: 5,
    startedAt: now.getTime() - 10000,
    ...overrides,
  };
}
test("all courses have sequential IDs, valid questions and a final challenge", () => {
  for (const c of Object.values(DB.courses)) {
    assert.equal(c.lessons.at(-1).challenge, true);
    c.lessons.forEach((l, i) => {
      assert.equal(l.id, i + 1);
      assert.ok(l.questions.length);
      if (!l.challenge) assert.ok(l.theory.length);
      for (const q of l.questions) {
        assert.ok(q.answers.length >= 2);
        assert.ok(Number.isInteger(q.correct));
        assert.ok(q.correct >= 0 && q.correct < q.answers.length);
        assert.ok(q.explanation);
      }
    });
  }
  assert.equal(DB.courses["8"].lessons[0].questions.length, 12);
});
test("mixed lessons preserve questions and distribute theory between them", () => {
  const lesson = DB.courses["8"].lessons[0];
  const steps = P.steps(lesson);
  assert.equal(steps[0].type, "theory");
  assert.equal(steps.filter((s) => s.type === "question").length, 12);
  assert.ok(steps.findIndex((s, i) => s.type === "theory" && i > 1) > 1);
  assert.equal(P.steps(lesson, true).length, 12);
});
test("70% threshold uses unrounded scores and unanswered questions count", () => {
  assert.equal(P.score([{ selected: 1, correct: 1 }], 2).passed, false);
  assert.equal(
    P.score(
      Array.from({ length: 7 }, () => ({ selected: 1, correct: 1 })),
      10,
    ).passed,
    true,
  );
  assert.equal(
    P.score(
      Array.from({ length: 16 }, () => ({ selected: 1, correct: 1 })),
      23,
    ).passed,
    false,
  );
  assert.equal(P.score([], 0).passed, false);
});
test("completion awards once, opens the next lesson and records duration", () => {
  const s = state();
  const attempt = session({
    answers: [
      { selected: 0, correct: 0 },
      { selected: 1, correct: 1 },
      { selected: 0, correct: 0 },
    ],
  });
  const first = P.complete(s, attempt, now);
  assert.equal(first.rewardXP, 30);
  assert.equal(first.durationSeconds, 10);
  assert.equal(s.genes, 5);
  assert.equal(P.unlocked(DB.courses["8"], 2, s.completed, "8"), true);
  const repeat = P.complete(s, attempt, now);
  assert.equal(repeat.rewardXP, 0);
  assert.equal(repeat.rewardGenes, 0);
  assert.equal(s.xp, 30);
  assert.equal(s.genes, 5);
  assert.equal(s.days.length, 1);
});
test("failed attempts and practice never unlock lessons or award currency", () => {
  for (const attempt of [
    session(),
    session({
      kind: "practice",
      answers: [
        { selected: 0, correct: 0 },
        { selected: 1, correct: 1 },
        { selected: 0, correct: 0 },
      ],
    }),
  ]) {
    const s = state();
    const r = P.complete(s, attempt, now);
    assert.equal(s.xp, 0);
    assert.equal(s.genes, 0);
    assert.deepEqual(s.completed, {});
    assert.equal(s.history.length, 1);
  }
});
test("course and book rewards have distinct keys", () => {
  const s = state();
  const answers = [
    { selected: 0, correct: 0 },
    { selected: 0, correct: 0 },
    { selected: 0, correct: 0 },
  ];
  P.complete(s, session({ answers }), now);
  P.complete(s, session({ answers, key: "7:1", courseKey: "7" }), now);
  P.complete(s, session({ answers, key: "book:chemistry", kind: "book" }), now);
  assert.equal(s.xp, 90);
  assert.equal(Object.keys(s.completed).length, 3);
  assert.equal(P.unlocked(DB.courses["9"], 2, s.completed, "9"), false);
});
test("streak survives until next day, handles gaps and month boundaries", () => {
  assert.equal(P.streak(["2026-10-09"], now), 1);
  assert.equal(P.streak(["2026-10-08"], now), 0);
  assert.equal(P.streak(["2026-10-08", "2026-10-09", "2026-10-10"], now), 3);
  assert.equal(P.streak(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1)), 2);
});
test("history is bounded and best completion score never decreases", () => {
  const s = state();
  const good = session({
    answers: [
      { selected: 0, correct: 0 },
      { selected: 1, correct: 1 },
      { selected: 0, correct: 0 },
    ],
  });
  for (let i = 0; i < 60; i++) P.complete(s, good, now);
  assert.equal(s.history.length, 50);
  assert.equal(s.completed["8:1"].percent, 100);
  assert.equal(s.xp, 30);
});
