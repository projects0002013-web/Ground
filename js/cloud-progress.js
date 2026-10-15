/* Shared client answer mapping and per-account cache reconciliation. */
(function (root) {
  "use strict";
  const accountKey = (uid) => `ground.v2.user.${uid}`;
  const queueKey = (uid) => `ground.cloud.queue.${uid}`;
  const preferences = (state) => ({
    selectedGrade: state.course,
    layout: state.layout,
    nickname: state.name,
    onboarded: state.onboarded,
    bookRead: state.bookRead.slice(),
    bookPage: state.bookPage,
    scanPage: state.scanPage,
  });
  function activity(DB, key) {
    if (key === "book:chemistry")
      return { questions: DB.book.questions, version: 1 };
    const [course, id] = key.split(":");
    const c = DB.courses[course],
      l = c?.lessons.find((l) => l.id === Number(id) && !l.pending);
    return l
      ? { questions: l.questions, version: c.progressVersion || 1 }
      : null;
  }
  function findRef(DB, answer) {
    const equal = (q) =>
      q.question === answer.question &&
      q.answers.length === answer.options.length &&
      q.answers.every((s) => answer.options.includes(s));
    for (const [course, c] of Object.entries(DB.courses))
      for (const l of c.lessons) {
        const i = l.questions.findIndex(equal);
        if (i >= 0) return `${course}:${l.id}:${i}`;
      }
    const i = DB.book.questions.findIndex(equal);
    return i < 0 ? null : `book:chemistry:${i}`;
  }
  function submission(DB, result, id) {
    const practice = result.kind === "practice",
      source = practice ? null : activity(DB, result.key);
    if (
      !practice &&
      (!source ||
        (result.courseVersion && result.courseVersion !== source.version))
    )
      throw new Error("Материал этой попытки отличается от текущего урока.");
    const used = new Set();
    const answers = result.answers.map((answer) => {
      let ref, index, q;
      if (practice) {
        ref = findRef(DB, answer);
        if (!ref) throw new Error("Вопрос этой попытки не найден.");
        const split = ref.lastIndexOf(":");
        index = Number(ref.slice(split + 1));
        q = activity(DB, ref.slice(0, split)).questions[index];
      } else {
        index = source.questions.findIndex(
          (item) =>
            item.question === answer.question &&
            item.answers.length === answer.options.length &&
            item.answers.every((s) => answer.options.includes(s)),
        );
        q = source.questions[index];
      }
      if (!q || used.has(practice ? ref : index))
        throw new Error("Ответы этой попытки не соответствуют уроку.");
      used.add(practice ? ref : index);
      const selected = q.answers.indexOf(answer.options[answer.selected]);
      if (selected < 0) throw new Error("Не найден выбранный ответ.");
      return practice ? { ref, selected } : { index, selected };
    });
    return {
      id,
      key: result.key,
      version: practice ? 1 : source.version,
      completedAt: result.completedAt,
      answers,
      ...(practice
        ? { mode: result.title === "Работа над ошибками" ? "errors" : "course" }
        : {}),
    };
  }
  function merge(profile, local, queue, history) {
    const completed = { ...(profile.completed || {}) };
    // Pending successful attempts may unlock the next lesson locally while offline.
    // No currency is awarded until Firestore confirms the transaction.
    for (const entry of queue)
      if (
        entry.result.passed &&
        entry.result.kind !== "practice" &&
        (!profile.courseVersions?.[entry.result.courseKey] ||
          (entry.result.courseVersion || 1) ===
            profile.courseVersions[entry.result.courseKey]) &&
        !entry.error
      )
        completed[entry.result.key] = {
          percent: entry.result.percent,
          at: entry.result.completedAt,
        };
    const results = [
      ...history.map((result) => {
        const cached = local.history?.find(
          (r) => r.attemptId === result.attemptId,
        );
        return cached
          ? {
              ...result,
              durationSeconds: cached.durationSeconds || 0,
              expired: !!cached.expired,
            }
          : result;
      }),
      ...queue.map((q) => ({
        ...q.result,
        cloudPending: true,
        cloudError: q.error || "",
      })),
    ];
    const seen = new Set();
    const merged = results
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .filter((r) => {
        const id = r.attemptId;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .slice(0, 50);
    const pendingDays = queue
      .filter((q) => q.result.answers.length && !q.error)
      .map((q) => q.result.day);
    return {
      ...local,
      xp: profile.xp,
      genes: profile.genes,
      achievements: profile.achievements || [],
      completed,
      courseVersions: profile.courseVersions,
      days: [...new Set([...(profile.days || []), ...pendingDays])].sort(),
      history: merged,
      lastResult:
        merged.find((r) => r.attemptId === local.lastResult?.attemptId) ||
        local.lastResult,
    };
  }
  const api = {
    accountKey,
    queueKey,
    preferences,
    activity,
    submission,
    merge,
  };
  root.GroundCloudProgress = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
