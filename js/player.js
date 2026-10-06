/* ==========================================
   GROUND — PLAYER.JS
   Lesson Player
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     DOM
  ======================================== */

  const homeScreen =
    document.getElementById("homeScreen");

  const lessonScreen =
    document.getElementById("lessonScreen");

  const closeLessonButton =
    document.getElementById("closeLessonButton");

  const questionTitle =
    document.getElementById("questionTitle");

  const questionHint =
    document.getElementById("questionHint");

  const answerContainer =
    document.getElementById("answerContainer");

  const checkAnswerButton =
    document.getElementById("checkAnswerButton");

  const explanation =
    document.getElementById("answerExplanation");

  const progressBar =
    document.getElementById("lessonProgressBar");

  const lessonGenes =
    document.getElementById("lessonGenes");

  const lessonCategory =
    document.querySelector(".lesson-category");


  /* ========================================
     СОСТОЯНИЕ УРОКА
  ======================================== */

  let currentLesson = null;

  let currentQuestion = 0;

  let selectedAnswer = null;

  let answerChecked = false;

  let correctAnswers = 0;

  let currentLessonId = 1;


  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  ];


  /* ========================================
     ВЫБРАННЫЙ КЛАСС
  ======================================== */

  function getCurrentGrade() {

    return (
      localStorage.getItem(
        "groundSelectedGrade"
      ) ||
      localStorage.getItem(
        "groundGrade"
      ) ||
      "9"
    );

  }


  /* ========================================
     ДАТА
  ======================================== */

  function getLocalDateString(
    date = new Date()
  ) {

    return (
      date.getFullYear() +
      "-" +
      String(
        date.getMonth() + 1
      ).padStart(2, "0") +
      "-" +
      String(
        date.getDate()
      ).padStart(2, "0")
    );

  }


  /* ========================================
     ИСТОРИЯ АКТИВНОСТИ
  ======================================== */

  function getActivityHistory() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(
            "groundActivity"
          ) || "[]"
        );

      if (
        Array.isArray(data)
      ) {

        return data;

      }

      return [];

    }

    catch (error) {

      return [];

    }

  }


  function saveActivityToday() {

    const today =
      getLocalDateString();

    const activity =
      getActivityHistory();


    if (
      !activity.includes(today)
    ) {

      activity.push(today);

    }


    const cleaned =
      activity
        .sort()
        .slice(-365);


    localStorage.setItem(
      "groundActivity",
      JSON.stringify(cleaned)
    );

  }


  /* ========================================
     🔥 STREAK
  ======================================== */

  function updateStreak() {

    const today =
      getLocalDateString();


    const lastDate =
      localStorage.getItem(
        "groundLastLessonDate"
      );


    let streak =
      Number(
        localStorage.getItem(
          "groundStreak"
        ) || 0
      );


    saveActivityToday();


    if (!lastDate) {

      streak = 1;

    }

    else if (
      lastDate === today
    ) {

      return streak;

    }

    else {

      const previous =
        new Date(
          lastDate +
          "T12:00:00"
        );


      const current =
        new Date(
          today +
          "T12:00:00"
        );


      const difference =
        Math.round(
          (
            current -
            previous
          ) /
          86400000
        );


      if (
        difference === 1
      ) {

        streak++;

      }

      else if (
        difference > 1
      ) {

        streak = 1;

      }

      else {

        return streak;

      }

    }


    localStorage.setItem(
      "groundStreak",
      streak
    );


    localStorage.setItem(
      "groundLastLessonDate",
      today
    );


    return streak;

  }


  /* ========================================
     🧬 ГЕНЫ
  ======================================== */

  function updateLessonGenes() {

    if (!lessonGenes) {
      return;
    }


    const genes =
      Number(
        localStorage.getItem(
          "groundGenes"
        ) || 0
      );


    lessonGenes.textContent =
      genes;

  }


  /* ========================================
     ОТКРЫТЬ УРОК
  ======================================== */

  window.openGroundLesson =
    function (lessonId = 1) {

      const grade =
        getCurrentGrade();


      if (
        typeof window.GroundDB ===
        "undefined"
      ) {

        alert(
          "Ошибка: database.js не подключён."
        );

        return;

      }


      const numericLessonId =
        Number(lessonId);


      const lesson =
        window.GroundDB.getLesson(
          grade,
          numericLessonId
        );


      if (!lesson) {

        alert(
          "Этот урок пока не добавлен."
        );

        return;

      }


      currentLesson =
        lesson;

      currentLessonId =
        numericLessonId;

      currentQuestion =
        0;

      selectedAnswer =
        null;

      answerChecked =
        false;

      correctAnswers =
        0;


      if (lessonCategory) {

        lessonCategory.textContent =
          `УРОК ${lesson.id} • ${lesson.title.toUpperCase()}`;

      }


      updateLessonGenes();


      document
        .querySelectorAll(
          ".screen"
        )
        .forEach(screen => {

          screen.classList.remove(
            "active"
          );

        });


      if (!lessonScreen) {

        alert(
          "Ошибка: экран урока не найден."
        );

        return;

      }


      lessonScreen.classList.add(
        "active"
      );


      window.scrollTo(
        0,
        0
      );


      renderQuestion();

    };


  /* ========================================
     ПОКАЗАТЬ ВОПРОС
  ======================================== */

  function renderQuestion() {

    if (
      !currentLesson ||
      !Array.isArray(
        currentLesson.questions
      )
    ) {

      return;

    }


    const data =
      currentLesson.questions[
        currentQuestion
      ];


    if (!data) {
      return;
    }


    selectedAnswer =
      null;

    answerChecked =
      false;


    if (checkAnswerButton) {

      checkAnswerButton.disabled =
        true;

      checkAnswerButton.textContent =
        "Проверить";

    }


    if (explanation) {

      explanation.className =
        "answer-explanation";

      explanation.innerHTML =
        "";

    }


    if (questionTitle) {

      questionTitle.textContent =
        data.question;

    }


    if (questionHint) {

      questionHint.textContent =
        `Вопрос ${currentQuestion + 1} из ${currentLesson.questions.length} • Выбери один правильный ответ`;

    }


    if (!answerContainer) {
      return;
    }


    answerContainer.innerHTML =
      "";


    data.answers.forEach(
      (answer, index) => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";

        button.className =
          "answer-button";


        button.innerHTML = `
          <span class="answer-letter">
            ${letters[index] || index + 1}
          </span>

          <span class="answer-text">
            ${answer}
          </span>
        `;


        button.addEventListener(
          "click",
          () => {

            selectAnswer(
              index,
              button
            );

          }
        );


        answerContainer.appendChild(
          button
        );

      }
    );


    updateProgress();

  }
    /* ========================================
     ВЫБОР ОТВЕТА
  ======================================== */

  function selectAnswer(
    index,
    button
  ) {

    if (answerChecked) {
      return;
    }


    selectedAnswer =
      index;


    if (answerContainer) {

      answerContainer
        .querySelectorAll(
          ".answer-button"
        )
        .forEach(item => {

          item.classList.remove(
            "selected"
          );

        });

    }


    button.classList.add(
      "selected"
    );


    if (checkAnswerButton) {

      checkAnswerButton.disabled =
        false;

    }

  }


  /* ========================================
     ПРОВЕРКА ОТВЕТА
  ======================================== */

  function checkAnswer() {

    if (
      !currentLesson ||
      selectedAnswer === null
    ) {

      return;

    }


    const data =
      currentLesson.questions[
        currentQuestion
      ];


    if (!data) {
      return;
    }


    answerChecked =
      true;


    const buttons =
      answerContainer
        ? answerContainer.querySelectorAll(
            ".answer-button"
          )
        : [];


    buttons.forEach(
      (button, index) => {

        button.classList.remove(
          "selected"
        );


        if (
          index === data.correct
        ) {

          button.classList.add(
            "correct"
          );

        }


        if (
          index === selectedAnswer &&
          selectedAnswer !== data.correct
        ) {

          button.classList.add(
            "wrong"
          );

        }


        button.disabled =
          true;

      }
    );


    /* ======================================
       ПРАВИЛЬНЫЙ ОТВЕТ
    ====================================== */

    if (
      selectedAnswer ===
      data.correct
    ) {

      correctAnswers++;


      if (explanation) {

        explanation.className =
          "answer-explanation correct-message";


        explanation.innerHTML = `
          <strong>
            Правильно! 🎉
          </strong>

          <br>

          ${data.explanation || ""}
        `;

      }

    }


    /* ======================================
       НЕПРАВИЛЬНЫЙ ОТВЕТ
    ====================================== */

    else {

      if (explanation) {

        explanation.className =
          "answer-explanation wrong-message";


        explanation.innerHTML = `
          <strong>
            Не совсем
          </strong>

          <br>

          ${data.explanation || ""}
        `;

      }

    }


    /* ======================================
       МЕНЯЕМ КНОПКУ
    ====================================== */

    if (checkAnswerButton) {

      checkAnswerButton.disabled =
        false;


      if (
        currentQuestion ===
        currentLesson.questions.length - 1
      ) {

        checkAnswerButton.textContent =
          "Завершить урок";

      }

      else {

        checkAnswerButton.textContent =
          "Продолжить";

      }

    }

  }


  /* ========================================
     ГЛАВНАЯ КНОПКА УРОКА
  ======================================== */

  if (checkAnswerButton) {

    checkAnswerButton.addEventListener(
      "click",
      () => {

        /* Ничего не выбрано */

        if (
          selectedAnswer === null &&
          !answerChecked
        ) {

          return;

        }


        /* Первый клик:
           проверяем ответ */

        if (!answerChecked) {

          checkAnswer();

          return;

        }


        /* Второй клик:
           следующий вопрос */

        nextQuestion();

      }
    );

  }


  /* ========================================
     СЛЕДУЮЩИЙ ВОПРОС
  ======================================== */

  function nextQuestion() {

    if (!currentLesson) {
      return;
    }


    if (
      currentQuestion <
      currentLesson.questions.length - 1
    ) {

      currentQuestion++;


      renderQuestion();


      window.scrollTo(
        0,
        0
      );


      return;

    }


    /* Последний вопрос */

    finishLesson();

  }


  /* ========================================
     ПРОГРЕСС УРОКА
  ======================================== */

  function updateProgress() {

    if (
      !progressBar ||
      !currentLesson
    ) {

      return;

    }


    const total =
      currentLesson.questions.length;


    if (total <= 0) {

      progressBar.style.width =
        "0%";

      return;

    }


    const progress =
      (
        currentQuestion /
        total
      ) * 100;


    progressBar.style.width =
      `${progress}%`;

  }


  /* ========================================
     ПРОГРЕСС ДОРОЖКИ
  ======================================== */

  function getCompletedRoadLessons() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(
            "groundCompletedRoadLessons"
          ) || "[]"
        );


      return Array.isArray(data)
        ? data
        : [];

    }

    catch (error) {

      return [];

    }

  }


  function completeRoadLesson() {

    const grade =
      getCurrentGrade();


    const roadLessonId =
      `${grade}-${currentLessonId}`;


    const completed =
      getCompletedRoadLessons();


    if (
      !completed.includes(
        roadLessonId
      )
    ) {

      completed.push(
        roadLessonId
      );


      localStorage.setItem(
        "groundCompletedRoadLessons",
        JSON.stringify(
          completed
        )
      );

    }

  }
    /* ========================================
     ЗАВЕРШИТЬ УРОК
  ======================================== */

  function finishLesson() {

    if (!currentLesson) {
      return;
    }


    /* Полная полоска прогресса */

    if (progressBar) {

      progressBar.style.width =
        "100%";

    }


    const grade =
      getCurrentGrade();


    const completionKey =
      `ground_${grade}_lesson_${currentLessonId}_complete`;


    const alreadyCompleted =
      localStorage.getItem(
        completionKey
      ) === "true";


    let xp =
      Number(
        localStorage.getItem(
          "groundXP"
        ) || 0
      );


    let genes =
      Number(
        localStorage.getItem(
          "groundGenes"
        ) || 0
      );


    /* ======================================
       НАГРАДА
       Даём только за первое прохождение
    ====================================== */

    if (!alreadyCompleted) {

      xp +=
        Number(
          currentLesson.rewardXP || 0
        );


      genes +=
        Number(
          currentLesson.rewardGenes || 0
        );


      localStorage.setItem(
        "groundXP",
        xp
      );


      localStorage.setItem(
        "groundGenes",
        genes
      );


      localStorage.setItem(
        completionKey,
        "true"
      );

    }


    /* ======================================
       ОТМЕЧАЕМ УРОК НА ДОРОЖКЕ
    ====================================== */

    completeRoadLesson();


    /* ======================================
       🔥 СЕРИЯ
    ====================================== */

    const streak =
      updateStreak();


    /* ======================================
       ⭐ УРОВЕНЬ
    ====================================== */

    const level =
      Math.floor(
        xp / 100
      ) + 1;


    localStorage.setItem(
      "groundLevel",
      level
    );


    updateLessonGenes();


    /* ======================================
       РЕЗУЛЬТАТ
    ====================================== */

    if (!alreadyCompleted) {

      alert(
        "🎉 Урок завершён!\n\n" +

        `Правильных ответов: ${correctAnswers}/${currentLesson.questions.length}\n\n` +

        `+${currentLesson.rewardXP || 0} XP\n` +

        `+${currentLesson.rewardGenes || 0} 🧬\n\n` +

        `🔥 Серия: ${streak} дн.\n\n` +

        "🔓 Следующий уровень открыт!"
      );

    }

    else {

      alert(
        "✅ Урок пройден ещё раз!\n\n" +

        `Правильных ответов: ${correctAnswers}/${currentLesson.questions.length}\n\n` +

        `🔥 Серия: ${streak} дн.`
      );

    }


    /* Возвращаемся назад */

    closeLesson();


    /* Обновляем весь интерфейс Ground */

    if (
      typeof window.updateGroundUI ===
      "function"
    ) {

      window.updateGroundUI();

    }

  }


  /* ========================================
     ЗАКРЫТЬ УРОК
  ======================================== */

  function closeLesson() {

    /* Сбрасываем состояние */

    selectedAnswer =
      null;

    answerChecked =
      false;


    /* Убираем экран урока */

    if (lessonScreen) {

      lessonScreen.classList.remove(
        "active"
      );

    }


    /* Убираем active со всех экранов,
       кроме главной */

    document
      .querySelectorAll(".screen")
      .forEach(screen => {

        if (
          screen !== homeScreen
        ) {

          screen.classList.remove(
            "active"
          );

        }

      });


    /* Возвращаем главную */

    if (homeScreen) {

      homeScreen.classList.add(
        "active"
      );

    }


    window.scrollTo(
      0,
      0
    );


    /* Обновляем интерфейс */

    if (
      typeof window.updateGroundUI ===
      "function"
    ) {

      window.updateGroundUI();

    }

  }


  /* ========================================
     ✕ КНОПКА ВЫХОДА
  ======================================== */

  if (closeLessonButton) {

    closeLessonButton.addEventListener(
      "click",
      () => {

        closeLesson();

      }
    );

  }


  /* ========================================
     ESC — ВЫХОД ИЗ УРОКА
  ======================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        lessonScreen &&
        lessonScreen.classList.contains(
          "active"
        )
      ) {

        closeLesson();

      }

    }
  );


  /* ========================================
     ГОТОВО
  ======================================== */

  updateLessonGenes();

});
