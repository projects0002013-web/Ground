"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const topicNames = {
    "population-genetics": "Генетика популяций",
    "linkage": "Сцепление генов",
    "statistics": "Биостатистика",
    "plant-physiology": "Физиология растений",
    "electrophysiology": "Электрофизиология",
    "biochemistry": "Биохимия",
    "molecular-biology": "Молекулярная биология",
    "genetics": "Генетика",
  };
  const difficultyNames = { basic: "Базовый", intermediate: "Средний", advanced: "Продвинутый" };
  let bank = [], selected = [], index = 0, answers = new Map();
  const button = $("next");

  function reset() {
    selected = bank.filter(q => $("topic").value === "all" || q.topic === $("topic").value);
    answers = new Map();
    index = 0;
    $("summary").hidden = true;
    $("exercise").hidden = false;
    show();
  }
  function show() {
    if (index >= selected.length) {
      $("exercise").hidden = true;
      $("summary").hidden = false;
      $("score").textContent = answers.size
        ? `${[...answers.values()].filter(x => x.correct).length} / ${selected.length}`
        : "0";
      button.disabled = true;
      button.hidden = true;
      $("count").textContent = `${selected.length} из ${selected.length}`;
      $("progress").style.width = "100%";
      document.querySelector(".q-bar").setAttribute("aria-valuenow", "100");
      return;
    }
    const q = selected[index];
    $("exercise").hidden = false;
    $("summary").hidden = true;
    $("solution").hidden = true;
    $("question").textContent = q.question;
    $("difficulty").textContent = difficultyNames[q.difficulty] || q.difficulty;
    $("category").textContent = topicNames[q.topic] || q.topic;
    $("options").replaceChildren();
    $("count").textContent = `${index + 1} из ${selected.length}`;
    const percent = Math.round(index / selected.length * 100);
    $("progress").style.width = percent + "%";
    document.querySelector(".q-bar").setAttribute("aria-valuenow", String(percent));
    button.hidden = false;
    button.textContent = index === selected.length - 1 ? "Показать результат →" : "Следующая задача →";
    button.disabled = true;
    q.answers.forEach((option, answerIndex) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "q-answer";
      el.textContent = String.fromCharCode(65 + answerIndex) + ". " + option;
      el.addEventListener("click", () => choose(answerIndex));
      $("options").append(el);
    });
  }
  function choose(answerIndex) {
    const q = selected[index];
    if (answers.has(q.id)) return;
    answers.set(q.id, { selected: answerIndex, correct: answerIndex === q.correct });
    [...$("options").children].forEach((el, optionIndex) => {
      el.disabled = true;
      if (optionIndex === q.correct) el.classList.add("correct");
      if (optionIndex === answerIndex && optionIndex !== q.correct) el.classList.add("incorrect");
    });
    $("feedback").textContent = answerIndex === q.correct ? "✓ Верно! Разберём решение." : "Правильный ответ: " + q.answers[q.correct];
    $("formula").textContent = q.formula;
    $("steps").replaceChildren();
    q.steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      $("steps").append(li);
    });
    $("explanation").textContent = q.explanation;
    $("solution").hidden = false;
    button.disabled = false;
  }
  button.addEventListener("click", () => {
    if (!answers.has(selected[index]?.id)) return;
    index++;
    show();
  });
  $("restart").addEventListener("click", reset);
  $("topic").addEventListener("change", reset);

  fetch("materials/olympiad/quantitative-bank.v1.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(data => {
      if (data.version !== 1 || !Array.isArray(data.questions) || !data.questions.length)
        throw new Error("Неизвестный формат банка");
      for (const q of data.questions) {
        if (!Array.isArray(q.answers) || q.answers.length < 2 || !Number.isInteger(q.correct)
          || q.correct < 0 || q.correct >= q.answers.length || !Array.isArray(q.steps))
          throw new Error("Повреждён формат задачи");
      }
      bank = data.questions;
      [...new Set(bank.map(q => q.topic))].forEach(topic => {
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topicNames[topic] || topic;
        $("topic").append(option);
      });
      $("load").hidden = true;
      $("trainer").hidden = false;
      reset();
    })
    .catch(() => {
      $("load").textContent = "Банк задач недоступен. Проверь интернет и обнови страницу. Прогресс основных уроков не затронут.";
    });
})();
