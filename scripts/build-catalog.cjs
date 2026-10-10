const fs = require("node:fs");
const vm = require("node:vm");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("js/database.js", "utf8"), context);
const database = context.window.GroundDB;
const activities = {};
const versions = {};
for (const [courseKey, course] of Object.entries(database.courses)) {
  if (course.progressVersion) versions[courseKey] = course.progressVersion;
  course.lessons
    .filter((l) => !l.pending)
    .forEach((lesson, index, list) => {
      const key = `${courseKey}:${lesson.id}`;
      activities[key] = {
        key,
        courseKey,
        lessonId: lesson.id,
        title: lesson.title,
        kind: lesson.challenge ? "challenge" : "lesson",
        exam: Boolean(lesson.challenge || lesson.assessmentLabel),
        previous: index ? `${courseKey}:${list[index - 1].id}` : null,
        version: course.progressVersion || 1,
        rewardXP: lesson.rewardXP,
        rewardGenes: lesson.rewardGenes,
        questions: lesson.questions,
      };
    });
}
activities["book:chemistry"] = {
  key: "book:chemistry",
  courseKey: "book",
  lessonId: "chemistry",
  title: "Химический контекст жизни",
  kind: "book",
  exam: true,
  previous: null,
  version: 1,
  rewardXP: 40,
  rewardGenes: 8,
  questions: database.book.questions,
};
fs.writeFileSync(
  "functions/catalog.json",
  JSON.stringify({ versions, activities }, null, 2) + "\n",
);
