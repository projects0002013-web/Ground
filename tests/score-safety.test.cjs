const test = require("node:test");
const assert = require("node:assert/strict");
const Player = require("../js/player.js");

test("missing fields never count as correct answers", () => {
  const result = Player.score(
    [{}, { selected: undefined, correct: undefined }, null, { selected: 1, correct: 1 }],
    4,
  );
  assert.equal(result.correct, 1);
  assert.equal(result.percent, 25);
  assert.equal(result.passed, false);
});

test("surplus answers cannot increase the grade past 100%", () => {
  const result = Player.score(
    [{ selected: 0, correct: 0 }, { selected: 1, correct: 1 }],
    1,
  );
  assert.deepEqual(result, { correct: 1, total: 1, percent: 100, passed: true });
});

test("unanswered, invalid, and malformed sessions do not pass", () => {
  for (const answers of [
    [],
    null,
    [{ selected: -1, correct: -1 }],
    [{ selected: "1", correct: "1" }],
    [{ selected: 0, correct: undefined }],
  ]) {
    const result = Player.score(answers, 1);
    assert.equal(result.correct, 0);
    assert.equal(result.passed, false);
  }
  assert.deepEqual(Player.score([], -3), {
    correct: 0, total: 0, percent: 0, passed: false,
  });
});

test("valid 70% threshold and ordinary scores remain unchanged", () => {
  const answers = Array.from({ length: 10 }, (_, i) => ({
    selected: i < 7 ? 0 : 1,
    correct: 0,
  }));
  assert.deepEqual(Player.score(answers, 10), {
    correct: 7, total: 10, percent: 70, passed: true,
  });
});
