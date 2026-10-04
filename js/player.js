/* ==========================================
   GROUND — PLAYER.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

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
     ДАТА
  ======================================== */

  function getLocalDateString(date = new Date()) {

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


      if (Array.isArray(data)) {
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


    /*
      Храним последние 365
      активных дат.
    */

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


    /* записываем активность */

    saveActivityToday();


    /* первый день */

    if (!lastDate) {

      streak = 1;

    }


    /* сегодня уже занимались */

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


      /* вчера */

      if (
        difference === 1
      ) {

        streak++;

      }


      /* пропущен день */

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
     ОТКРЫТЬ УРОК
  ======================================== */

  window.openGroundLesson =
    function (lessonId = 1) {

      const grade =
        localStorage.getItem(
          "groundGrade"
        ) || "9";


      if (
        typeof window.GroundDB ===
        "undefined"
      ) {

        alert(
          "Ошибка: database.js не подключён."
        );

        return;

      }


      const lesson =
        window.GroundDB.getLesson(
          grade,
          lessonId
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
        Number(lessonId);

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
        .querySelectorAll(".screen")
        .forEach(screen => {

          screen.classList.remove(
            "active"
          );

        });


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
     ВОПРОС
  ======================================== */

  function renderQuestion() {

    if (!currentLesson) {
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


    checkAnswerButton.disabled =
      true;


    checkAnswerButton.textContent =
      "Проверить";


    explanation.className =
      "answer-explanation";


    explanation.innerHTML =
      "";


    questionTitle.textContent =
      data.question;


    if (questionHint) {

      questionHint.textContent =
        `Вопрос ${currentQuestion + 1} из ${currentLesson.questions.length} • Выбери один правильный ответ`;

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
     ВЫБОР
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


    answerContainer
      .querySelectorAll(
        ".answer-button"
      )
      .forEach(item => {

        item.classList.remove(
          "selected"
        );

      });


    button.classList.add(
      "selected"
    );


    checkAnswerButton.disabled =
      false;

  }


  /* ========================================
     ПРОВЕРКА
  ======================================== */

  function checkAnswer() {

    const data =
      currentLesson.questions[
        currentQuestion
      ];


    answerChecked =
      true;


    const buttons =
      answerContainer.querySelectorAll(
        ".answer-button"
      );


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

      }
    );


    if (
      selectedAnswer ===
      data.correct
    ) {

      correctAnswers++;


      explanation.className =
        "answer-explanation correct-message";


      explanation.innerHTML = `

        <strong>
          Правильно! 🎉
        </strong>

        <br>

        ${data.explanation}

      `;

    }

    else {

      explanation.className =
        "answer-explanation wrong-message";


      explanation.innerHTML = `

        <strong>
          Не совсем
        </strong>

        <br>

        ${data.explanation}

      `;

    }


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


  /* ========================================
     КНОПКА
  ======================================== */

  checkAnswerButton.addEventListener(
    "click",
    () => {

      if (
        selectedAnswer === null
      ) {

        return;

      }


      if (!answerChecked) {

        checkAnswer();

      }

      else {

        nextQuestion();

      }

    }
  );


  /* ========================================
     ДАЛЬШЕ
  ======================================== */

  function nextQuestion() {

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

    }

    else {

      finishLesson();

    }

  }


  /* ========================================
     ПРОГРЕСС
  ======================================== */

  function updateProgress() {

    const progress =
      (
        currentQuestion /
        currentLesson.questions.length
      ) * 100;


    progressBar.style.width =
      `${progress}%`;

  }


  /* ========================================
     ГЕНЫ
  ======================================== */

  function updateLessonGenes() {

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
     ЗАВЕРШИТЬ УРОК
  ======================================== */

  function finishLesson() {

    if (!currentLesson) {
      return;
    }


    progressBar.style.width =
      "100%";


    const grade =
      localStorage.getItem(
        "groundGrade"
      ) || "9";


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


    /* награда только один раз */

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


    /* 🔥 серия */

    const streak =
      updateStreak();


    /* ⭐ уровень */

    const level =
      Math.floor(
        xp / 100
      ) + 1;


    localStorage.setItem(
      "groundLevel",
      level
    );


    updateLessonGenes();


    if (!alreadyCompleted) {

      alert(

        "🎉 Урок завершён!\n\n" +

        `Правильных ответов: ${correctAnswers}/${currentLesson.questions.length}\n\n` +

        `+${currentLesson.rewardXP || 0} XP\n` +

        `+${currentLesson.rewardGenes || 0} 🧬\n\n` +

        `🔥 Серия: ${streak} дн.\n\n` +

        "🔓 Следующий урок открыт!"

      );

    }

    else {

      alert(

        "✅ Урок пройден ещё раз!\n\n" +

        `Правильных ответов: ${correctAnswers}/${currentLesson.questions.length}\n\n` +

        `🔥 Серия: ${streak} дн.`

      );

    }


    closeLesson();


    if (
      typeof window.updateGroundUI ===
      "function"
    ) {

      window.updateGroundUI();

    }

  }


  /* ========================================
     ЗАКРЫТЬ
  ======================================== */

  function closeLesson() {

    lessonScreen.classList.remove(
      "active"
    );


    homeScreen.classList.add(
      "active"
    );


    window.scrollTo(
      0,
      0
    );

  }


  closeLessonButton.addEventListener(
    "click",
    closeLesson
  );

});