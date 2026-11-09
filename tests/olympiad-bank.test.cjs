"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const bank = require(path.join("..", "materials", "olympiad", "quantitative-bank.v1.json"));

test("olympiad quantitative bank has stable IDs and original provenance", () => {
  assert.equal(bank.version, 1);
  assert.match(bank.provenance, /not official/i);
  assert.equal(bank.scoring.passPercent, 70);
  assert.equal(bank.questions.length, 12);
  assert.equal(new Set(bank.questions.map((q) => q.id)).size, 12);
  for (const [index, q] of bank.questions.entries()) {
    assert.match(q.id, /^olq-\d{3}$/);
    assert.equal(q.id, `olq-${String(index + 1).padStart(3, "0")}`);
    assert.equal(q.sourceType, "original");
  }
});

test("every problem has a valid keyed answer and complete step-by-step solution", () => {
  for (const q of bank.questions) {
    assert.ok(q.topic && q.difficulty && q.question, q.id);
    assert.ok(["basic", "intermediate", "advanced"].includes(q.difficulty), q.id);
    assert.equal(q.answers.length, 4, q.id);
    assert.equal(new Set(q.answers.map((a) => a.toLowerCase())).size, 4, q.id);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, q.id);
    assert.ok(q.formula.length > 10, q.id);
    assert.ok(q.steps.length >= 3, q.id);
    for (const step of q.steps) assert.ok(step.length > 15, q.id);
    assert.ok(q.explanation.length > 35, q.id);
  }
});

test("numerical answer keys agree with the calculations", () => {
  const byId = Object.fromEntries(bank.questions.map((q) => [q.id, q]));
  const checks = {
    "olq-001": 2 * 0.7 * Math.sqrt(0.09) * 100,
    "olq-002": (2 * 100 + 200) / (2 * 400),
    "olq-003": (1 - 0.2) * 0.9 + 0.2 * 0.4,
    "olq-004": 18 / 200 * 100,
    "olq-005": (78 - 75) ** 2 / 75 + (22 - 25) ** 2 / 25,
    "olq-006": Math.sqrt((4 + 0 + 4) / (3 - 1)),
    "olq-007": -0.2 * 0.008314 * 300,
    "olq-009": 59.2 * Math.log10(10),
    "olq-011": 2 ** 10,
    "olq-012": 0.5 * 0.5,
  };
  const expected = {
    "olq-001": 42,
    "olq-002": 0.5,
    "olq-003": 0.8,
    "olq-004": 9,
    "olq-005": 0.48,
    "olq-006": 2,
    "olq-007": -0.49884,
    "olq-009": 59.2,
    "olq-011": 1024,
    "olq-012": 0.25,
  };
  for (const [id, actual] of Object.entries(checks)) {
    assert.ok(Math.abs(actual - expected[id]) < 0.00001, id);
    assert.ok(byId[id].answers[byId[id].correct], id);
  }
});

test("keyed answer text matches the reviewed numerical results", () => {
  const expectedOptions = {
    "olq-001": "42%",
    "olq-002": "0,50",
    "olq-003": "0,80",
    "olq-004": "9 cM",
    "olq-005": "0,48",
    "olq-006": "2",
    "olq-007": "−0,499 МПа",
    "olq-008": "Из −0,25 к −0,80 МПа",
    "olq-009": "+59 мВ",
    "olq-010": "Vmax неизменна, Km увеличивается",
    "olq-011": "1024",
    "olq-012": "1/4",
  };
  for (const q of bank.questions)
    assert.equal(q.answers[q.correct], expectedOptions[q.id], q.id);
});
