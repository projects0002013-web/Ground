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
test("courses have stable IDs, pending slots and valid published questions", () => {
  for (const c of Object.values(DB.courses)) {
    if (!c.totalSlots) assert.equal(c.lessons.at(-1).challenge, true);
    c.lessons.forEach((l, i) => {
      assert.equal(l.id, i + 1);
      if (l.pending) {
        assert.equal(l.questions.length, 0);
        assert.equal(P.unlocked(c, l.id, {}, "7"), false);
        return;
      }
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
  assert.equal(DB.courses["8"].lessons[0].questions.length, 40);
});
test("mixed lessons preserve questions and distribute theory between them", () => {
  const lesson = DB.courses["ent"].lessons[1];
  const steps = P.steps(lesson);
  assert.equal(steps[0].type, "theory");
  assert.equal(steps.filter((s) => s.type === "question").length, 3);
  assert.ok(steps.findIndex((s, i) => s.type === "theory" && i > 1) > 1);
  assert.equal(P.steps(lesson, true).length, 3);
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

test("grade 7 has 13 circles and preserves the uploaded ecosystem exam", () => {
  const course = DB.courses["7"];
  assert.equal(course.lessons.length, 13);
  assert.equal(course.lessons.filter((l) => l.challenge).length, 0);
  const lesson = course.lessons[0];
  assert.equal(lesson.title, "Экосистемы");
  assert.equal(lesson.questions.length, 40);
  assert.equal(
    lesson.theory.reduce((n, t) => n + (t.selfCheck?.length || 0), 0),
    25,
  );
  const steps = P.steps(lesson);
  assert.equal(
    steps.slice(0, 7).every((s) => s.type === "theory"),
    true,
  );
  assert.equal(
    steps.slice(7).every((s) => s.type === "question"),
    true,
  );
  assert.equal(
    P.score(
      Array.from({ length: 28 }, () => ({ selected: 0, correct: 0 })),
      40,
    ).passed,
    true,
  );
  assert.equal(
    P.score(
      Array.from({ length: 27 }, () => ({ selected: 0, correct: 0 })),
      40,
    ).passed,
    false,
  );
  assert.equal(P.unlocked(course, 2, { "7:1": { percent: 100 } }, "7"), true);
  const key = [
    0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 2, 0, 0, 1, 0, 1, 0, 1, 2, 1, 1, 1,
  ];
  assert.deepEqual(
    lesson.questions.map((q) => q.correct),
    key,
  );
});

test("classification fills circle 2 without resetting ecosystem progress", () => {
  const course = DB.courses["7"];
  assert.equal(course.progressVersion, 2);
  const lesson = course.lessons[1];
  assert.equal(lesson.title, "Классификация живых организмов");
  assert.equal(lesson.source, "materials/grade7/lesson-02-classification.pdf");
  assert.equal(lesson.questions.length, 40);
  assert.equal(
    lesson.theory.reduce((n, t) => n + (t.selfCheck?.length || 0), 0),
    20,
  );
  assert.equal(
    P.steps(lesson)
      .slice(0, 6)
      .every((s) => s.type === "theory"),
    true,
  );
  assert.equal(
    P.steps(lesson)
      .slice(6)
      .every((s) => s.type === "question"),
    true,
  );
  assert.deepEqual(
    lesson.questions.map((q) => q.correct),
    [
      1, 0, 1, 2, 1, 1, 1, 0, 0, 1, 3, 1, 0, 2, 0, 1, 2, 0, 1, 1, 1, 2, 1, 0, 2,
      0, 1, 2, 0, 0, 1, 2, 0, 1, 1, 0, 0, 2, 1, 1,
    ],
  );
  assert.equal(P.unlocked(course, 2, {}, "7"), false);
  assert.equal(P.unlocked(course, 2, { "7:1": { percent: 70 } }, "7"), true);
  assert.equal(
    P.unlocked(
      course,
      3,
      { "7:1": { percent: 100 }, "7:2": { percent: 100 } },
      "7",
    ),
    true,
  );
  assert.equal(
    course.lessons
      .slice(2)
      .every((l) => !l.pending && l.theory.length && l.questions.length === 40),
    true,
  );
});

test("all thirteen PDF lessons preserve exams, ungraded prompts and sequential rewards", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const { createHash } = require("node:crypto");
  const sources = require("./fixtures/grade7_sources.json");
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  const course = DB.courses["7"];
  const profile = state();
  assert.equal(course.totalSlots, 13);
  assert.equal(course.progressVersion, 2);
  assert.equal(
    course.lessons.filter((l) => l.pending || l.challenge).length,
    0,
  );
  assert.equal(
    course.lessons.reduce((n, l) => n + l.questions.length, 0),
    520,
  );
  assert.equal(
    course.lessons.reduce(
      (n, l) =>
        n + l.theory.reduce((m, t) => m + (t.selfCheck?.length || 0), 0),
      0,
    ),
    300,
  );
  for (const lesson of course.lessons) {
    const key = `7:${lesson.id}`;
    assert.equal(P.unlocked(course, lesson.id, profile.completed, "7"), true);
    if (lesson.id < 13)
      assert.equal(
        P.unlocked(course, lesson.id + 1, profile.completed, "7"),
        false,
      );
    const expected = sources[lesson.id];
    if (expected) {
      assert.equal(lesson.title, expected.title);
      assert.equal(lesson.source, expected.source);
      const pdf = fs.readFileSync(path.join(__dirname, "..", lesson.source));
      assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
      assert.equal(hash(pdf), expected.pdfSha256);
      const assessment = lesson.questions.map(
        ({ question, answers, correct }) => ({ question, answers, correct }),
      );
      assert.equal(hash(JSON.stringify(assessment)), expected.assessmentSha256);
      assert.equal(lesson.theory.length, expected.theoryCount);
      assert.equal(
        lesson.theory.reduce((n, t) => n + (t.selfCheck?.length || 0), 0),
        expected.selfCheckCount,
      );
      assert.equal(
        lesson.theory.every(
          (t) => t.source === lesson.source && t.text.length > 0,
        ),
        true,
      );
    }
    const steps = P.steps(lesson);
    assert.equal(
      steps.slice(0, lesson.theory.length).every((s) => s.type === "theory"),
      true,
    );
    assert.equal(
      steps.slice(lesson.theory.length).every((s) => s.type === "question"),
      true,
    );
    const attempt = session({
      key,
      courseKey: "7",
      lessonId: lesson.id,
      steps,
      answers: Array.from({ length: 28 }, () => ({ selected: 0, correct: 0 })),
    });
    assert.equal(P.complete(profile, attempt, now).passed, true);
    assert.equal(P.complete(profile, attempt, now).rewardXP, 0);
  }
  assert.equal(profile.xp, 390);
  assert.equal(profile.genes, 65);
  assert.equal(Object.keys(profile.completed).length, 13);
});
test("guest and cloud streaks use one study day across device timezones and midnight", () => {
  const { execFileSync } = require("node:child_process");
  const code = `const P=require('./js/player.js'),S=require('./js/progress-engine.js');const now=new Date('2026-10-10T20:00:00Z');const days=['2026-10-09','2026-10-10'];process.stdout.write(JSON.stringify([P.dayKey(now),S.dayKey(now),P.streak(days,now),S.streak(days,now)]));`;
  for (const TZ of [
    "UTC",
    "Europe/Moscow",
    "Pacific/Honolulu",
    "Pacific/Kiritimati",
  ]) {
    const values = JSON.parse(
      execFileSync(process.execPath, ["-e", code], {
        cwd: require("node:path").join(__dirname, ".."),
        env: { ...process.env, TZ },
        encoding: "utf8",
      }),
    );
    assert.deepEqual(values, ["2026-10-11", "2026-10-11", 2, 2], TZ);
  }
  assert.equal(
    P.streak(["2026-12-30", "2026-12-31"], new Date("2026-12-31T20:00:00Z")),
    2,
  );
});
