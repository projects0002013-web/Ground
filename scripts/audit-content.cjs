"use strict";
// Read-only curriculum audit. It does not modify learner progress or course IDs.
global.window = {};
require("../js/database.js");
const { courses } = window.GroundDB;
const findings = [];
const stats = [];
function clean(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
for (const [courseKey, course] of Object.entries(courses)) {
  const seenQuestions = new Map();
  let questions = 0;
  let theoryCards = 0;
  for (const lesson of course.lessons || []) {
    theoryCards += (lesson.theory || []).length;
    if (lesson.pending) continue;
    for (const [index, question] of (lesson.questions || []).entries()) {
      questions++;
      const label = `${courseKey} / lesson ${lesson.id} / question ${index + 1}`;
      const stem = clean(question.question);
      if (!stem) findings.push({ severity: "error", label, message: "Empty question stem" });
      if (!Array.isArray(question.answers) || question.answers.length < 2)
        findings.push({ severity: "error", label, message: "Fewer than 2 answer options" });
      else {
        const answers = question.answers.map(clean);
        if (answers.some(a => !a)) findings.push({ severity: "error", label, message: "Blank answer option" });
        if (new Set(answers.map(a => a.toLocaleLowerCase("ru"))).size !== answers.length)
          findings.push({ severity: "review", label, message: "Duplicate answer options" });
        if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= answers.length)
          findings.push({ severity: "error", label, message: "Invalid correct-option index" });
      }
      if (!clean(question.explanation))
        findings.push({ severity: "error", label, message: "Missing answer explanation" });
      if (stem) {
        const normalized = stem.toLocaleLowerCase("ru");
        const first = seenQuestions.get(normalized);
        if (first)
          findings.push({ severity: "review", label, message: `Repeated question text (also ${first})` });
        else seenQuestions.set(normalized, label);
      }
    }
  }
  stats.push({ course: courseKey, lessons: course.lessons?.length || 0, theoryCards, questions });
}
const summary = {
  generatedAt: new Date().toISOString(),
  courses: stats,
  totals: stats.reduce((a, s) => ({ lessons: a.lessons + s.lessons, theoryCards: a.theoryCards + s.theoryCards, questions: a.questions + s.questions }), { lessons: 0, theoryCards: 0, questions: 0 }),
  findings,
};
if (process.argv.includes("--json")) console.log(JSON.stringify(summary, null, 2));
else {
  console.log("GROUND curriculum content audit");
  console.table(stats);
  console.log("Total:", summary.totals);
  console.log("Findings:", findings.length, "(errors:", findings.filter(f => f.severity === "error").length, "; review:", findings.filter(f => f.severity === "review").length, ")");
  for (const finding of findings.slice(0, 30))
    console.log(`[${finding.severity}] ${finding.label}: ${finding.message}`);
  if (findings.length > 30) console.log(`... ${findings.length - 30} additional findings (use --json)`);
}
if (findings.some(f => f.severity === "error")) process.exitCode = 1;
