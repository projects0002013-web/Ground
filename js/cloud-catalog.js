/* Same lesson metadata for the browser and generated Firestore reward limits. */
(function (root) {
  "use strict";
  function buildCatalog(database) {
    if (!database && typeof module !== "undefined") {
      const context = { window: {} };
      require("node:vm").runInNewContext(
        require("node:fs").readFileSync(
          require("node:path").join(__dirname, "database.js"),
          "utf8",
        ),
        context,
      );
      database = context.window.GroundDB;
    }
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
    return { versions, activities };
  }
  const api = { buildCatalog };
  root.GroundCloudCatalog = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
