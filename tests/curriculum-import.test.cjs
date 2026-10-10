const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const engine = require("../js/progress-engine.js");
const Player = require("../js/player.js");
const vm = require("node:vm");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("js/database.js", "utf8"), context);
const DB = context.window.GroundDB;
const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");
for (const [grade, count] of [
  ["8", 14],
  ["9", 16],
  ["10", 13],
  ["11", 16],
]) {
  test(`grade ${grade} preserves ${count} circles, PDFs, source assignments and keyed assessments`, () => {
    const course = DB.courses[grade];
    const manifest = JSON.parse(
      fs.readFileSync(`tests/fixtures/grade${grade}_sources.json`),
    );
    assert.equal(course.lessons.length, count);
    assert.equal(course.totalSlots, count);
    assert.equal(course.progressVersion, 2);
    assert.equal(Object.keys(manifest).length, count);
    for (const [i, l] of course.lessons.entries()) {
      const expected = manifest[l.id];
      assert.equal(l.id, i + 1);
      assert.equal(l.title, expected.title);
      assert.equal(l.source, expected.source);
      assert.equal(sha(fs.readFileSync(l.source)), expected.pdfSha256);
      assert.equal(l.assessmentOrigin, expected.assessmentOrigin);
      assert.equal(
        sha(
          JSON.stringify(
            l.questions.map(({ question, answers, correct }) => ({
              question,
              answers,
              correct,
            })),
          ),
        ),
        expected.assessmentSha256,
      );
      assert.equal(l.theory.length, expected.theoryCount);
      assert.equal(
        l.theory.reduce((s, t) => s + (t.selfCheck?.length || 0), 0),
        expected.selfCheckCount,
      );
      const written = l.theory.flatMap((t) => t.sourceTasks || []);
      assert.equal(written.length, expected.sourceTasksCount);
      assert.equal(sha(JSON.stringify(written)), expected.sourceTasksSha256);
      assert.equal(
        new Set(l.questions.map((q) => q.question)).size,
        l.questions.length,
      );
      for (const q of l.questions) {
        assert.equal(q.answers.length, 4);
        assert.equal(new Set(q.answers).size, 4);
        assert.ok(
          q.question.trim().length > 0 && q.explanation.trim().length > 0,
        );
        assert.ok(
          Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4,
        );
      }
      const steps = Player.steps(l);
      assert.equal(
        steps.filter((s) => s.type === "question").length,
        l.questions.length,
      );
      if (!l.challenge) {
        assert.ok(l.theoryFirst);
        const first = steps.findIndex((s) => s.type === "question");
        assert.equal(first, l.theory.length);
        assert.ok(l.theory.every((t) => t.text.length > 80));
      }
      assert.equal(Player.unlocked(course, l.id, {}, grade), i === 0);
    }
  });
}
test("imported courses enforce pass thresholds, order and one reward for every lesson", () => {
  let profile = engine.emptyProfile("learner");
  const now = new Date("2026-10-11T10:00:00Z");
  for (const grade of ["8", "9", "10", "11"]) {
    for (const l of DB.courses[grade].lessons) {
      const key = `${grade}:${l.id}`;
      const input = {
        id: `test-${grade}-${l.id}-attempt-00001`,
        key,
        version: 2,
        answers: l.questions.map((q, index) => ({
          index,
          selected: q.correct,
        })),
      };
      const needed = Math.ceil(l.questions.length * 0.7);
      const failure = engine.apply(
        profile,
        engine.evaluate(
          { ...input, answers: input.answers.slice(0, needed - 1) },
          now,
        ),
        now,
      );
      assert.equal(failure.result.passed, false);
      assert.equal(failure.result.rewardXP, 0);
      assert.equal(failure.profile.completed[key], undefined);
      const pass = engine.apply(
        profile,
        engine.evaluate(
          { ...input, answers: input.answers.slice(0, needed) },
          now,
        ),
        now,
      );
      assert.equal(pass.result.passed, true);
      assert.equal(pass.result.rewardXP, l.rewardXP);
      profile = pass.profile;
      const repeat = engine.apply(profile, engine.evaluate(input, now), now);
      assert.equal(repeat.result.rewardXP, 0);
      assert.equal(repeat.profile.xp, profile.xp);
      profile = repeat.profile;
    }
  }
  assert.equal(Object.keys(profile.completed).length, 59);
  assert.equal(profile.xp, 1800);
  assert.equal(profile.genes, 300);
});
test("grade 11 retains fifteen six-question modules and the sixty-minute forty-question final", () => {
  const lessons = DB.courses["11"].lessons;
  assert.ok(
    lessons.slice(0, 15).every((l) => !l.challenge && l.questions.length === 6),
  );
  assert.equal(lessons[15].challenge, true);
  assert.equal(lessons[15].durationMinutes, 60);
  assert.equal(lessons[15].questions.length, 40);
});
