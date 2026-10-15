/* Pure learning and progress rules shared by the UI and tests. */
(function (root) {
  "use strict";
  const Player = {
    dayKey(date = new Date()) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Qyzylorda",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    },
    steps(lesson, practice = false) {
      const steps = [];
      const theory = practice ? [] : lesson.theory || [];
      const questions = lesson.questions || [];
      if (lesson.theoryFirst && !practice) {
        return [
          ...theory.map((card) => ({
            ...card,
            type: "theory",
            icon: lesson.icon,
          })),
          ...questions.map((question, index) => ({
            ...question,
            type: "question",
            index,
          })),
        ];
      }
      questions.forEach((question, index) => {
        theory.forEach((card, cardIndex) => {
          if (
            Math.floor((cardIndex * questions.length) / theory.length) === index
          ) {
            steps.push({ type: "theory", ...card, icon: lesson.icon });
          }
        });
        steps.push({ ...question, type: "question", index });
      });
      return steps;
    },
    score(answers, total) {
      const correct = answers.filter((a) => a.selected === a.correct).length;
      return {
        correct,
        total,
        percent: total ? Math.round((correct / total) * 100) : 0,
        passed: total > 0 && correct / total >= 0.7,
      };
    },
    unlocked(course, lessonId, completed, courseKey) {
      const index = course.lessons.findIndex((l) => l.id === lessonId);
      return (
        index >= 0 &&
        !course.lessons[index].pending &&
        (index === 0 ||
          Boolean(completed[`${courseKey}:${course.lessons[index - 1].id}`]))
      );
    },
    streak(days, now = new Date()) {
      const set = new Set(days);
      const cursor = new Date(Player.dayKey(now) + "T12:00:00Z");
      if (!set.has(Player.dayKey(cursor)))
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      let count = 0;
      while (set.has(Player.dayKey(cursor))) {
        count++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      return count;
    },
    complete(state, session, now = new Date()) {
      const questions = session.steps.filter((s) => s.type === "question");
      const result = {
        ...Player.score(session.answers, questions.length),
        title: session.title,
        courseKey: session.courseKey,
        lessonId: session.lessonId,
        kind: session.kind,
        answers: session.answers.slice(),
        completedAt: now.toISOString(),
        day: Player.dayKey(now),
        rewardXP: 0,
        rewardGenes: 0,
        key: session.key,
        durationSeconds: Math.max(
          0,
          Math.round((now.getTime() - session.startedAt) / 1000),
        ),
      };
      if (
        result.passed &&
        session.kind !== "practice" &&
        !state.completed[session.key]
      ) {
        result.rewardXP = session.rewardXP || 0;
        result.rewardGenes = session.rewardGenes || 0;
        state.xp += result.rewardXP;
        state.genes += result.rewardGenes;
        state.completed[session.key] = {
          percent: result.percent,
          at: result.completedAt,
        };
      } else if (result.passed && state.completed[session.key]) {
        state.completed[session.key].percent = Math.max(
          state.completed[session.key].percent,
          result.percent,
        );
      }
      if (session.answers.length && !state.days.includes(result.day))
        state.days.push(result.day);
      state.history.unshift(result);
      state.history = state.history.slice(0, 50);
      state.lastResult = result;
      state.session = null;
      return result;
    },
  };
  root.GroundPlayer = Player;
  if (typeof module !== "undefined") module.exports = Player;
})(typeof window !== "undefined" ? window : globalThis);
