/* Personal study grading runs in the browser. Firestore transactions prevent
   duplicate rewards; this is not trusted examination grading. */
(function (root) {
  "use strict";
  const catalog = (
    typeof module !== "undefined"
      ? require("./cloud-catalog.js")
      : root.GroundCloudCatalog
  ).buildCatalog(root.GroundDB);
  class ProgressError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }
  const fail = (code, message) => {
    throw new ProgressError(code, message);
  };
  const player =
    typeof module !== "undefined" ? require("./player.js") : root.GroundPlayer;
  const dayKey = (now) => player.dayKey(now);
  const streak = (days, now) => player.streak(days, now);
  const achievementNames = [
    "first-lesson",
    "five-lessons",
    "three-day-streak",
    "challenge-passed",
  ];
  function achievementIDs(profile) {
    const earned = new Set(
      (Array.isArray(profile.achievements) ? profile.achievements : []).filter(
        (id) => achievementNames.includes(id),
      ),
    );
    const keys = Object.keys(profile.completed || {});
    if (keys.length >= 1) earned.add("first-lesson");
    if (keys.length >= 5) earned.add("five-lessons");
    let run = 0,
      previous = null;
    for (const day of [...new Set(profile.days || [])].sort()) {
      const value = Date.parse(day + "T12:00:00Z");
      run = value - previous === 86400000 ? run + 1 : 1;
      if (run >= 3) earned.add("three-day-streak");
      previous = value;
    }
    if (
      keys.some((key) => catalog.activities[key]?.kind === "challenge") ||
      profile.activityHistory?.some((h) => h?.kind === "challenge" && h.passed)
    )
      earned.add("challenge-passed");
    return achievementNames.filter((id) => earned.has(id));
  }
  function emptyProfile(uid, identity = {}) {
    return {
      uid,
      displayName: String(identity.name || "Биолог").slice(0, 200),
      email: String(identity.email || "").slice(0, 320),
      photoURL: String(identity.picture || "").slice(0, 2048),
      achievements: [],
      nickname: "",
      selectedGrade: "8",
      layout: "auto",
      onboarded: true,
      bookRead: [],
      bookPage: 0,
      scanPage: 47,
      xp: 0,
      genes: 0,
      level: 1,
      streak: 0,
      lastLessonDate: null,
      completed: {},
      completedLessons: [],
      completedRoadLessons: Object.values(catalog.activities)
        .filter((a) => a.kind !== "book" && !a.previous)
        .map((a) => a.key),
      completedExams: [],
      activityHistory: [],
      days: [],
      courseVersions: catalog.versions,
      revision: 0,
    };
  }
  function currentProfile(profile) {
    const next = {
      ...profile,
      completed: { ...profile.completed },
      courseVersions: { ...catalog.versions },
    };
    for (const key of Object.keys(next.completed)) {
      const activity = catalog.activities[key];
      if (
        !activity ||
        (catalog.versions[activity.courseKey] &&
          profile.courseVersions?.[activity.courseKey] !==
            catalog.versions[activity.courseKey])
      )
        delete next.completed[key];
    }
    next.completedLessons = Object.keys(next.completed);
    next.completedExams = next.completedLessons.filter(
      (key) => catalog.activities[key]?.exam,
    );
    next.completedRoadLessons = Object.values(catalog.activities)
      .filter(
        (a) => a.kind !== "book" && (!a.previous || next.completed[a.previous]),
      )
      .map((a) => a.key);
    return next;
  }
  function evaluate(input, now = new Date()) {
    if (
      !input ||
      Object.keys(input).some(
        (k) =>
          !["id", "key", "version", "answers", "mode", "completedAt"].includes(
            k,
          ),
      )
    )
      fail("invalid-argument", "Неверный формат попытки.");
    if (
      typeof input.id !== "string" ||
      !/^[a-zA-Z0-9_-]{16,100}$/.test(input.id)
    )
      fail("invalid-argument", "Неверный номер попытки.");
    const completed =
      input.completedAt == null ? now : new Date(input.completedAt);
    if (
      (input.completedAt != null && typeof input.completedAt !== "string") ||
      !Number.isFinite(completed.getTime()) ||
      completed.getTime() < Date.UTC(2000, 0, 1) ||
      completed.getTime() > now.getTime() + 300000
    )
      fail("invalid-argument", "Неверная дата попытки.");
    const practice = /^(7|8|9|10|11|ent|olympiad):practice$/.test(
      input.key || "",
    );
    const activity = practice
      ? {
          key: input.key,
          kind: "practice",
          courseKey: input.key.split(":")[0],
          lessonId: "practice",
          title:
            input.mode === "errors"
              ? "Работа над ошибками"
              : "Тренировка по курсу",
          rewardXP: 0,
          rewardGenes: 0,
          version: 1,
        }
      : catalog.activities[input.key];
    if (!activity) fail("invalid-argument", "Урок не найден.");
    if (input.version !== activity.version)
      fail(
        "failed-precondition",
        "Материал урока обновлён. Начни новую попытку.",
      );
    if (
      !Array.isArray(input.answers) ||
      input.answers.length > (practice ? 12 : activity.questions.length)
    )
      fail("invalid-argument", "Неверное число ответов.");
    const used = new Set();
    const answers = input.answers.map((item) => {
      if (
        !item ||
        Object.keys(item).some((k) => !["index", "selected", "ref"].includes(k))
      )
        fail("invalid-argument", "Неверный ответ.");
      let question, ref;
      if (practice) {
        if (typeof item.ref !== "string")
          fail("invalid-argument", "Не указан вопрос.");
        const split = item.ref.lastIndexOf(":");
        const source = catalog.activities[item.ref.slice(0, split)],
          index = Number(item.ref.slice(split + 1));
        question = source?.questions[index];
        ref = item.ref;
      } else {
        question = activity.questions[item.index];
        ref = String(item.index);
        if (!Number.isInteger(item.index))
          fail("invalid-argument", "Неверный номер вопроса.");
      }
      if (
        !question ||
        !Number.isInteger(item.selected) ||
        item.selected < 0 ||
        item.selected >= question.answers.length ||
        used.has(ref)
      )
        fail("invalid-argument", "Неверный или повторный ответ.");
      used.add(ref);
      return {
        question: question.question,
        options: question.answers,
        selected: item.selected,
        correct: question.correct,
        explanation: question.explanation,
        ...(question.table ? { table: question.table } : {}),
      };
    });
    const total = practice ? answers.length : activity.questions.length,
      correct = answers.filter((a) => a.selected === a.correct).length;
    return {
      activity,
      result: {
        attemptId: input.id,
        key: activity.key,
        courseKey: activity.courseKey,
        lessonId: activity.lessonId,
        kind: activity.kind,
        title: activity.title,
        correct,
        total,
        percent: total ? Math.round((correct / total) * 100) : 0,
        passed: total > 0 && correct / total >= 0.7,
        answers,
        completedAt: completed.toISOString(),
        day: dayKey(completed),
        rewardXP: 0,
        rewardGenes: 0,
        durationSeconds: 0,
        courseVersion: activity.version,
      },
    };
  }
  function apply(profile, evaluation, now = new Date()) {
    const next = currentProfile(profile),
      { activity } = evaluation,
      result = { ...evaluation.result };
    if (
      activity.kind !== "practice" &&
      activity.previous &&
      !next.completed[activity.previous]
    )
      fail("failed-precondition", "Сначала пройди предыдущий урок.");
    if (activity.kind === "book" && next.bookRead?.length !== 4)
      fail("failed-precondition", "Сначала открой все разделы конспекта.");
    if (result.passed && activity.kind !== "practice") {
      if (!next.completed[activity.key]) {
        result.rewardXP = activity.rewardXP;
        result.rewardGenes = activity.rewardGenes;
        next.xp += result.rewardXP;
        next.genes += result.rewardGenes;
      }
      next.completed[activity.key] = {
        percent: Math.max(
          next.completed[activity.key]?.percent || 0,
          result.percent,
        ),
        at: result.completedAt,
      };
    }
    next.level = Math.floor(next.xp / 100) + 1;
    next.days = [
      ...new Set([
        ...(next.days || []),
        ...(result.answers.length ? [result.day] : []),
      ]),
    ].sort();
    next.streak = streak(next.days, now);
    next.lastLessonDate = next.days.at(-1) || null;
    next.completedLessons = Object.keys(next.completed);
    next.completedExams = next.completedLessons.filter(
      (key) => catalog.activities[key]?.exam,
    );
    next.completedRoadLessons = Object.values(catalog.activities)
      .filter(
        (a) => a.kind !== "book" && (!a.previous || next.completed[a.previous]),
      )
      .map((a) => a.key);
    const { answers, ...summary } = result;
    next.activityHistory = [summary, ...(next.activityHistory || [])].slice(
      0,
      50,
    );
    next.achievements = achievementIDs(next);
    next.revision = (next.revision || 0) + 1;
    return { profile: next, result };
  }
  const api = {
    catalog,
    ProgressError,
    achievementIDs,
    emptyProfile,
    currentProfile,
    evaluate,
    apply,
    dayKey,
    streak,
  };

  root.GroundProgressEngine = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
