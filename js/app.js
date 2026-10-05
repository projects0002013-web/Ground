/* ==========================================
   GROUND — APP.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     ЭКРАНЫ
  ======================================== */

  const welcomeScreen =
    document.getElementById("welcomeScreen");

  const pathScreen =
    document.getElementById("pathScreen");

  const gradeScreen =
    document.getElementById("gradeScreen");

  const homeScreen =
    document.getElementById("homeScreen");

  const libraryScreen =
    document.getElementById("libraryScreen");

  const profileScreen =
    document.getElementById("profileScreen");

  const campbellScreen =
    document.getElementById("campbellScreen");

  const campbellTheoryScreen =
    document.getElementById("campbellTheoryScreen");

  const campbellExamScreen =
    document.getElementById("campbellExamScreen");

  const campbellResultScreen =
    document.getElementById("campbellResultScreen");

  const campbellReviewScreen =
    document.getElementById("campbellReviewScreen");


  /* ========================================
     ОСНОВНЫЕ КНОПКИ
  ======================================== */

  const startButton =
    document.getElementById("startButton");

  const pathBackButton =
    document.getElementById("pathBackButton");

  const gradeBackButton =
    document.getElementById("gradeBackButton");

  const changeGradeButton =
    document.getElementById("changeGradeButton");


  /* ========================================
     CAMPBELL — КНОПКИ
  ======================================== */

  const campbellBackButton =
    document.getElementById("campbellBackButton");

  const campbellTheoryButton =
    document.getElementById("campbellTheoryButton");

  const campbellExamButton =
    document.getElementById("campbellExamButton");

  const campbellTheoryBackButton =
    document.getElementById(
      "campbellTheoryBackButton"
    );

  const completeCampbellTheoryButton =
    document.getElementById(
      "completeCampbellTheoryButton"
    );

  const campbellExamBackButton =
    document.getElementById(
      "campbellExamBackButton"
    );

  const campbellExamNextButton =
    document.getElementById(
      "campbellExamNextButton"
    );

  const campbellContinueButton =
    document.getElementById(
      "campbellContinueButton"
    );

  const campbellReviewButton =
    document.getElementById(
      "campbellReviewButton"
    );

  const campbellRetryButton =
    document.getElementById(
      "campbellRetryButton"
    );

  const campbellReviewBackButton =
    document.getElementById(
      "campbellReviewBackButton"
    );

  const campbellReviewFinishButton =
    document.getElementById(
      "campbellReviewFinishButton"
    );


  /* ========================================
     CAMPBELL READER — НОВЫЕ ЭЛЕМЕНТЫ
  ======================================== */

  const campbellReaderImage =
    document.getElementById(
      "campbellReaderImage"
    );

  const campbellReaderLoading =
    document.getElementById(
      "campbellReaderLoading"
    );

  const campbellReaderPrevButton =
    document.getElementById(
      "campbellReaderPrevButton"
    );

  const campbellReaderNextButton =
    document.getElementById(
      "campbellReaderNextButton"
    );

  const campbellReaderPageNumber =
    document.getElementById(
      "campbellReaderPageNumber"
    );

  const campbellReaderPageTop =
    document.getElementById(
      "campbellReaderPageTop"
    );

  const campbellReaderProgressFill =
    document.getElementById(
      "campbellReaderProgressFill"
    );


  /* ========================================
     CAMPBELL — ОСНОВНЫЕ ЭЛЕМЕНТЫ
  ======================================== */

  const campbellProgressText =
    document.getElementById(
      "campbellProgressText"
    );

  const campbellProgressBar =
    document.getElementById(
      "campbellProgressBar"
    );

  const campbellExamStatus =
    document.getElementById(
      "campbellExamStatus"
    );

  const campbellReadingPercent =
    document.getElementById(
      "campbellReadingPercent"
    );

  const campbellReadingProgress =
    document.getElementById(
      "campbellReadingProgress"
    );

  const campbellExamTimer =
    document.getElementById(
      "campbellExamTimer"
    );

  const campbellExamQuestionCounter =
    document.getElementById(
      "campbellExamQuestionCounter"
    );

  const campbellExamProgressPercent =
    document.getElementById(
      "campbellExamProgressPercent"
    );

  const campbellExamProgressBar =
    document.getElementById(
      "campbellExamProgressBar"
    );

  const campbellExamQuestion =
    document.getElementById(
      "campbellExamQuestion"
    );

  const campbellExamQuestionHint =
    document.getElementById(
      "campbellExamQuestionHint"
    );

  const campbellExamAnswers =
    document.getElementById(
      "campbellExamAnswers"
    );


  /* ========================================
     CAMPBELL — РЕЗУЛЬТАТ
  ======================================== */

  const campbellResultTitle =
    document.getElementById(
      "campbellResultTitle"
    );

  const campbellResultMessage =
    document.getElementById(
      "campbellResultMessage"
    );

  const campbellResultScore =
    document.getElementById(
      "campbellResultScore"
    );

  const campbellResultPercent =
    document.getElementById(
      "campbellResultPercent"
    );

  const campbellResultTime =
    document.getElementById(
      "campbellResultTime"
    );

  const campbellResultStatus =
    document.getElementById(
      "campbellResultStatus"
    );

  const campbellResultDescription =
    document.getElementById(
      "campbellResultDescription"
    );

  const campbellRewardText =
    document.getElementById(
      "campbellRewardText"
    );


  /* ========================================
     CAMPBELL — РАЗБОР
  ======================================== */

  const campbellReviewScore =
    document.getElementById(
      "campbellReviewScore"
    );

  const campbellReviewProgress =
    document.getElementById(
      "campbellReviewProgress"
    );

  const campbellReviewQuestions =
    document.getElementById(
      "campbellReviewQuestions"
    );


  /* ========================================
     ГЛАВНАЯ
  ======================================== */

  const learningRoad =
    document.getElementById("learningRoad");

  const currentGrade =
    document.getElementById("currentGrade");

  const courseTitle =
    document.getElementById("courseTitle");

  const xpValue =
    document.getElementById("xpValue");

  const xpProgress =
    document.getElementById("xpProgress");

  const levelValue =
    document.getElementById("levelValue");

  const streakValue =
    document.getElementById("streakValue");


  /* ========================================
     БИБЛИОТЕКА
  ======================================== */

  const libraryLessons =
    document.getElementById("libraryLessons");

  const libraryGrade =
    document.getElementById("libraryGrade");

  const librarySearchInput =
    document.getElementById(
      "librarySearchInput"
    );


  /* ========================================
     ПРОФИЛЬ
  ======================================== */

  const profileGrade =
    document.getElementById("profileGrade");

  const profileLevel =
    document.getElementById("profileLevel");

  const profileGenes =
    document.getElementById("profileGenes");

  const profileStreak =
    document.getElementById("profileStreak");

  const profileXP =
    document.getElementById("profileXP");

  const profileXPProgress =
    document.getElementById(
      "profileXPProgress"
    );

  const profileLevelText =
    document.getElementById(
      "profileLevelText"
    );

  const profileCompletedLessons =
    document.getElementById(
      "profileCompletedLessons"
    );

  const achievementsContainer =
    document.getElementById(
      "achievementsContainer"
    );


  /* ========================================
     АКТИВНОСТЬ
  ======================================== */

  const activityWeek =
    document.getElementById(
      "activityWeek"
    );

  const activityStreak =
    document.getElementById(
      "activityStreak"
    );

  const activityMessage =
    document.getElementById(
      "activityMessage"
    );


  /* ========================================
     БЕЗОПАСНАЯ ПРОВЕРКА
  ======================================== */

  function elementExists(element) {
    return element !== null;
  }


  /* ========================================
     ПЕРЕХОДЫ МЕЖДУ ЭКРАНАМИ
  ======================================== */

  let changingScreen = false;

  function changeScreen(
    oldScreen,
    newScreen
  ) {

    if (
      !oldScreen ||
      !newScreen ||
      changingScreen
    ) {
      return;
    }

    changingScreen = true;

    oldScreen.classList.add(
      "screen-out"
    );

    setTimeout(() => {

      oldScreen.classList.remove(
        "active",
        "screen-out"
      );

      newScreen.classList.add(
        "active",
        "screen-in"
      );

      window.scrollTo(
        0,
        0
      );

      setTimeout(() => {

        newScreen.classList.remove(
          "screen-in"
        );

        changingScreen = false;

      }, 280);

    }, 250);

  }


  /* ========================================
     START
  ======================================== */

  if (elementExists(startButton)) {

    startButton.addEventListener(
      "click",
      () => {

        changeScreen(
          welcomeScreen,
          pathScreen
        );

      }
    );

  }


  /* ========================================
     НАЗАД
  ======================================== */

  if (elementExists(pathBackButton)) {

    pathBackButton.addEventListener(
      "click",
      () => {

        changeScreen(
          pathScreen,
          welcomeScreen
        );

      }
    );

  }


  if (elementExists(gradeBackButton)) {

    gradeBackButton.addEventListener(
      "click",
      () => {

        changeScreen(
          gradeScreen,
          pathScreen
        );

      }
    );

  }


  /* ========================================
     ВЫБОР НАПРАВЛЕНИЯ
  ======================================== */

  document
    .querySelectorAll(".path-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const path =
            card.dataset.path;

          if (path === "school") {

            localStorage.setItem(
              "groundPath",
              "school"
            );

            changeScreen(
              pathScreen,
              gradeScreen
            );

            return;
          }


          if (path === "ent") {

            alert(
              "🎯 Раздел ЕНТ скоро будет добавлен."
            );

            return;
          }


          if (path === "olympiad") {

            alert(
              "🏆 Олимпиадный раздел скоро будет добавлен."
            );

          }

        }
      );

    });


  /* ========================================
     ВЫБОР КЛАССА
  ======================================== */

  document
    .querySelectorAll(".grade-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const grade =
            card.dataset.grade;

          localStorage.setItem(
            "groundGrade",
            grade
          );

          updateUserInterface();

          changeScreen(
            gradeScreen,
            homeScreen
          );

        }
      );

    });


  if (elementExists(changeGradeButton)) {

    changeGradeButton.addEventListener(
      "click",
      () => {

        changeScreen(
          homeScreen,
          gradeScreen
        );

      }
    );

  }


  /* ========================================
     PLAYER DATA
  ======================================== */

  function getPlayerData() {

    return {

      grade:
        localStorage.getItem(
          "groundGrade"
        ) || "9",

      genes:
        Number(
          localStorage.getItem(
            "groundGenes"
          ) || 0
        ),

      xp:
        Number(
          localStorage.getItem(
            "groundXP"
          ) || 0
        ),

      level:
        Number(
          localStorage.getItem(
            "groundLevel"
          ) || 1
        ),

      streak:
        Number(
          localStorage.getItem(
            "groundStreak"
          ) || 0
        )

    };

  }


  /* ========================================
     ПРОВЕРКА УРОКОВ
  ======================================== */

  function isLessonCompleted(
    grade,
    lessonId
  ) {

    return (
      localStorage.getItem(
        `ground_${grade}_lesson_${lessonId}_complete`
      ) === "true"
    );

  }


  function isLessonUnlocked(
    grade,
    lessonId
  ) {

    lessonId =
      Number(lessonId);

    if (lessonId === 1) {
      return true;
    }

    return isLessonCompleted(
      grade,
      lessonId - 1
    );

  }


  /* ========================================
     ДОРОЖКА ОБУЧЕНИЯ
  ======================================== */

  function buildLearningRoad() {

    if (!learningRoad) {
      return;
    }

    learningRoad.innerHTML = "";

    const grade =
      localStorage.getItem(
        "groundGrade"
      ) || "9";


    if (
      typeof window.GroundDB ===
      "undefined"
    ) {

      learningRoad.innerHTML =
        "<p>Ошибка загрузки базы.</p>";

      return;

    }


    const course =
      window.GroundDB.getCourse(
        grade
      );


    if (!course) {

      learningRoad.innerHTML =
        "<p>Курс пока не добавлен.</p>";

      return;

    }


    if (courseTitle) {

      courseTitle.textContent =
        course.title;

    }


    course.lessons.forEach(
      (lesson, index) => {

        const completed =
          isLessonCompleted(
            grade,
            lesson.id
          );


        const unlocked =
          isLessonUnlocked(
            grade,
            lesson.id
          );


        const item =
          document.createElement(
            "div"
          );


        item.className =
          index % 2 === 0
            ? "road-item road-left"
            : "road-item road-right";


        const node =
          document.createElement(
            "button"
          );


        node.type =
          "button";


        node.className =
          "road-node";


        if (completed) {

          node.classList.add(
            "active-node"
          );

          node.innerHTML =
            "✓";

        }

        else if (unlocked) {

          node.classList.add(
            "active-node"
          );

          node.innerHTML =
            lesson.icon ||
            lesson.id;

        }

        else {

          node.classList.add(
            "locked-node"
          );

          node.innerHTML =
            "🔒";

        }


        const info =
          document.createElement(
            "div"
          );


        info.className =
          "road-info";


        info.innerHTML = `

          <strong>
            ${lesson.title}
          </strong>

          <small>

            ${
              completed
                ? "Пройдено ✓"
                : unlocked
                ? `+${lesson.rewardXP || 0} XP • +${lesson.rewardGenes || 0} 🧬`
                : "Заблокировано"
            }

          </small>

        `;


        node.addEventListener(
          "click",
          () => {

            if (!unlocked) {

              alert(
                "🔒 Сначала пройди предыдущий урок."
              );

              return;

            }


            if (
              typeof window.openGroundLesson ===
              "function"
            ) {

              window.openGroundLesson(
                lesson.id
              );

            }

            else {

              alert(
                "Урок пока не удалось открыть."
              );

            }

          }
        );


        item.appendChild(
          node
        );


        item.appendChild(
          info
        );


        learningRoad.appendChild(
          item
        );


        if (
          index <
          course.lessons.length - 1
        ) {

          const connector =
            document.createElement(
              "div"
            );


          connector.className =
            "auto-road-connector";


          connector.innerHTML =
            "•••••";


          learningRoad.appendChild(
            connector
          );

        }

      }
    );

  }


  /* ========================================
     БИБЛИОТЕКА
  ======================================== */

  function buildLibrary(
    searchText = ""
  ) {

    if (
      !libraryLessons ||
      !libraryGrade
    ) {
      return;
    }


    const grade =
      localStorage.getItem(
        "groundGrade"
      ) || "9";


    libraryGrade.textContent =
      `${grade} класс`;


    if (
      typeof window.GroundDB ===
      "undefined"
    ) {

      libraryLessons.innerHTML =
        "<p>Ошибка загрузки базы.</p>";

      return;

    }


    const lessons =
      window.GroundDB.getLessons(
        grade
      ) || [];


    const query =
      String(searchText)
        .trim()
        .toLowerCase();


    const filtered =
      lessons.filter(
        lesson => {

          const title =
            String(
              lesson.title || ""
            ).toLowerCase();


          const description =
            String(
              lesson.description || ""
            ).toLowerCase();


          return (
            title.includes(query) ||
            description.includes(query)
          );

        }
      );


    libraryLessons.innerHTML =
      "";


    /* ========================================
       CAMPBELL BIOLOGY — 8 КЛАСС
    ======================================== */

    const campbellSearchText =
      "campbell biology кэмпбелл химический контекст жизни глава 2 углубленная биология";


    const campbellMatchesSearch =
      query === "" ||
      campbellSearchText.includes(
        query
      );


    if (
      grade === "8" &&
      campbellMatchesSearch
    ) {

      const campbellCard =
        document.createElement(
          "button"
        );


      campbellCard.type =
        "button";


      campbellCard.className =
        "library-card campbell-library-card";


      const theoryCompleted =
        localStorage.getItem(
          "campbellChapter2TheoryCompleted"
        ) === "true";


      const examCompleted =
        localStorage.getItem(
          "campbellChapter2ExamCompleted"
        ) === "true";


      let campbellStatus =
        "НАЧАТЬ КУРС";


      if (theoryCompleted) {

        campbellStatus =
          "ПРОДОЛЖИТЬ КУРС";

      }


      if (examCompleted) {

        campbellStatus =
          "ГЛАВА ПРОЙДЕНА ✓";

      }


      campbellCard.innerHTML = `

        <div class="library-card-icon">
          🧬
        </div>

        <div class="library-card-content">

          <span class="small-label">
            УГЛУБЛЁННЫЙ КУРС
          </span>

          <h3>
            Campbell Biology
          </h3>

          <p>
            Глава 2 — Химический контекст жизни
          </p>

          <div class="library-card-status">
            ${campbellStatus}
          </div>

        </div>

        <div class="library-card-arrow">
          →
        </div>

      `;


      campbellCard.addEventListener(
        "click",
        () => {

          updateCampbellProgress();

          changeScreen(
            libraryScreen,
            campbellScreen
          );

        }
      );


      libraryLessons.appendChild(
        campbellCard
      );

    }


    /* ========================================
       ОБЫЧНЫЕ УРОКИ
    ======================================== */

    filtered.forEach(
      lesson => {

        const completed =
          isLessonCompleted(
            grade,
            lesson.id
          );


        const card =
          document.createElement(
            "button"
          );


        card.type =
          "button";


        card.className =
          "library-card";


        card.innerHTML = `

          <div class="library-card-icon">
            ${lesson.icon || "📖"}
          </div>

          <div class="library-card-content">

            <h3>
              ${lesson.title}
            </h3>

            <p>
              ${lesson.description || ""}
            </p>

            <div class="library-card-status">

              ${
                completed
                  ? "✓ ПРОЙДЕНО"
                  : `УРОК ${lesson.id}`
              }

            </div>

          </div>

          <div class="library-card-arrow">
            →
          </div>

        `;


        card.addEventListener(
          "click",
          () => {

            if (
              typeof window.openGroundLesson ===
              "function"
            ) {

              window.openGroundLesson(
                lesson.id
              );

            }

          }
        );


        libraryLessons.appendChild(
          card
        );

      }
    );


    const campbellVisible =
      grade === "8" &&
      campbellMatchesSearch;


    if (
      filtered.length === 0 &&
      !campbellVisible
    ) {

      libraryLessons.innerHTML = `

        <div class="library-empty">
          🔎 Ничего не найдено
        </div>

      `;

    }

  }


  /* ========================================
     ПОИСК ПО БИБЛИОТЕКЕ
  ======================================== */

  if (librarySearchInput) {

    librarySearchInput.addEventListener(
      "input",
      () => {

        buildLibrary(
          librarySearchInput.value
        );

      }
    );

  }
    /* ========================================
     ДАТА
  ======================================== */

  function getLocalDateString(date) {

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

      return Array.isArray(data)
        ? data
        : [];

    }

    catch (error) {

      console.error(
        "Ошибка groundActivity:",
        error
      );

      return [];

    }

  }


  /* ========================================
     КАЛЕНДАРЬ АКТИВНОСТИ
  ======================================== */

  function buildActivityWeek() {

    if (!activityWeek) {
      return;
    }

    const activity =
      getActivityHistory();

    const activitySet =
      new Set(activity);

    const today =
      new Date();

    const todayString =
      getLocalDateString(
        today
      );

    const day =
      today.getDay();

    const mondayOffset =
      day === 0
        ? -6
        : 1 - day;

    const monday =
      new Date(today);

    monday.setDate(
      today.getDate() +
      mondayOffset
    );

    const names = [
      "Пн",
      "Вт",
      "Ср",
      "Чт",
      "Пт",
      "Сб",
      "Вс"
    ];

    activityWeek.innerHTML =
      "";

    names.forEach(
      (name, index) => {

        const date =
          new Date(monday);

        date.setDate(
          monday.getDate() +
          index
        );

        const dateString =
          getLocalDateString(
            date
          );

        const active =
          activitySet.has(
            dateString
          );

        const isToday =
          dateString ===
          todayString;

        const dayElement =
          document.createElement(
            "div"
          );

        dayElement.className =
          "activity-day";

        if (active) {

          dayElement.classList.add(
            "activity-done"
          );

        }

        if (isToday) {

          dayElement.classList.add(
            "activity-today"
          );

        }

        dayElement.innerHTML = `

          <span class="activity-day-name">
            ${name}
          </span>

          <div class="activity-circle">

            ${
              active
                ? "✓"
                : date.getDate()
            }

          </div>

        `;

        activityWeek.appendChild(
          dayElement
        );

      }
    );


    const player =
      getPlayerData();

    if (activityStreak) {

      activityStreak.textContent =
        player.streak;

    }

    if (activityMessage) {

      if (
        activitySet.has(
          todayString
        )
      ) {

        activityMessage.textContent =
          "Отлично! Сегодняшний день уже засчитан 🔥";

      }

      else if (
        player.streak > 0
      ) {

        activityMessage.textContent =
          `Пройди урок сегодня, чтобы сохранить серию ${player.streak} 🔥`;

      }

      else {

        activityMessage.textContent =
          "Пройди урок сегодня и начни новую серию 🔥";

      }

    }

  }


  /* ========================================
     КОЛИЧЕСТВО ПРОЙДЕННЫХ УРОКОВ
  ======================================== */

  function getCompletedLessonsCount() {

    let total = 0;

    for (
      let i = 0;
      i < localStorage.length;
      i++
    ) {

      const key =
        localStorage.key(i);

      if (
        key &&
        key.startsWith("ground_") &&
        key.includes("_lesson_") &&
        key.endsWith("_complete") &&
        localStorage.getItem(key) ===
          "true"
      ) {

        total++;

      }

    }

    return total;

  }


  /* ========================================
     ДОСТИЖЕНИЯ
  ======================================== */

  function buildAchievements(
    player,
    completed
  ) {

    if (!achievementsContainer) {
      return;
    }

    const achievements = [

      {
        icon: "🌱",
        title: "Первый шаг",
        description:
          "Пройди первый урок",
        unlocked:
          completed >= 1,
        progress:
          `${Math.min(completed, 1)} / 1`
      },

      {
        icon: "🧬",
        title: "Исследователь",
        description:
          "Собери 25 генов",
        unlocked:
          player.genes >= 25,
        progress:
          `${Math.min(player.genes, 25)} / 25`
      },

      {
        icon: "🧠",
        title: "Биолог",
        description:
          "Пройди 5 уроков",
        unlocked:
          completed >= 5,
        progress:
          `${Math.min(completed, 5)} / 5`
      },

      {
        icon: "🔥",
        title: "В ритме",
        description:
          "Достигни серии 3 дня",
        unlocked:
          player.streak >= 3,
        progress:
          `${Math.min(player.streak, 3)} / 3`
      },

      {
        icon: "⚡",
        title: "Неделя силы",
        description:
          "Достигни серии 7 дней",
        unlocked:
          player.streak >= 7,
        progress:
          `${Math.min(player.streak, 7)} / 7`
      },

      {
        icon: "⭐",
        title: "Новый уровень",
        description:
          "Достигни 2 уровня",
        unlocked:
          player.level >= 2,
        progress:
          `${Math.min(player.level, 2)} / 2`
      }

    ];

    achievementsContainer.innerHTML =
      "";

    achievements.forEach(
      achievement => {

        const card =
          document.createElement(
            "div"
          );

        card.className =
          achievement.unlocked
            ? "achievement-card unlocked"
            : "achievement-card";

        card.innerHTML = `

          <div class="achievement-icon">
            ${achievement.icon}
          </div>

          <div class="achievement-info">

            <strong>
              ${achievement.title}
            </strong>

            <p>
              ${achievement.description}
            </p>

          </div>

          <div class="achievement-status">

            ${
              achievement.unlocked
                ? "✓"
                : achievement.progress
            }

          </div>

        `;

        achievementsContainer.appendChild(
          card
        );

      }
    );

  }


  /* ========================================
     ОБНОВЛЕНИЕ ПРОФИЛЯ
  ======================================== */

  function updateProfile() {

    const player =
      getPlayerData();

    const completed =
      getCompletedLessonsCount();

    const xp =
      player.xp % 100;


    if (profileGrade) {

      profileGrade.textContent =
        `${player.grade} класс`;

    }


    if (profileLevel) {

      profileLevel.textContent =
        player.level;

    }


    if (profileGenes) {

      profileGenes.textContent =
        player.genes;

    }


    if (profileStreak) {

      profileStreak.textContent =
        player.streak;

    }


    if (profileXP) {

      profileXP.textContent =
        xp;

    }


    if (profileXPProgress) {

      profileXPProgress.style.width =
        `${xp}%`;

    }


    if (profileLevelText) {

      profileLevelText.textContent =
        `Уровень ${player.level}`;

    }


    if (profileCompletedLessons) {

      profileCompletedLessons.textContent =
        completed;

    }


    buildActivityWeek();

    buildAchievements(
      player,
      completed
    );

  }


  /* ========================================
     ОБНОВЛЕНИЕ ВСЕГО ИНТЕРФЕЙСА
  ======================================== */

  function updateUserInterface() {

    const player =
      getPlayerData();


    if (currentGrade) {

      currentGrade.textContent =
        `${player.grade} класс`;

    }


    document
      .querySelectorAll(
        ".gene-value"
      )
      .forEach(element => {

        element.textContent =
          player.genes;

      });


    if (xpValue) {

      xpValue.textContent =
        player.xp % 100;

    }


    if (levelValue) {

      levelValue.textContent =
        player.level;

    }


    if (streakValue) {

      streakValue.textContent =
        player.streak;

    }


    if (xpProgress) {

      xpProgress.style.width =
        `${player.xp % 100}%`;

    }


    buildLearningRoad();

    updateCampbellProgress();


    if (
      profileScreen &&
      profileScreen.classList.contains(
        "active"
      )
    ) {

      updateProfile();

    }

  }


  /* ========================================
     HOME → БИБЛИОТЕКА
  ======================================== */

  const homeLibraryButton =
    document.querySelector(
      '#homeScreen [data-nav="library"]'
    );


  if (homeLibraryButton) {

    homeLibraryButton.addEventListener(
      "click",
      () => {

        if (librarySearchInput) {

          librarySearchInput.value =
            "";

        }

        buildLibrary();

        changeScreen(
          homeScreen,
          libraryScreen
        );

      }
    );

  }


  /* ========================================
     HOME → ПРОФИЛЬ
  ======================================== */

  const homeProfileButton =
    document.querySelector(
      '#homeScreen [data-nav="profile"]'
    );


  if (homeProfileButton) {

    homeProfileButton.addEventListener(
      "click",
      () => {

        updateProfile();

        changeScreen(
          homeScreen,
          profileScreen
        );

      }
    );

  }


  /* ========================================
     HOME → ДОРОЖКА
  ======================================== */

  const homeRoadButton =
    document.querySelector(
      '#homeScreen [data-nav="road"]'
    );


  if (homeRoadButton) {

    homeRoadButton.addEventListener(
      "click",
      () => {

        if (learningRoad) {

          learningRoad.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  }


  /* ========================================
     БИБЛИОТЕКА → HOME
  ======================================== */

  const libraryHomeButton =
    document.querySelector(
      ".library-home-button"
    );


  if (libraryHomeButton) {

    libraryHomeButton.addEventListener(
      "click",
      () => {

        updateUserInterface();

        changeScreen(
          libraryScreen,
          homeScreen
        );

      }
    );

  }


  /* ========================================
     БИБЛИОТЕКА → ДОРОЖКА
  ======================================== */

  const libraryRoadButton =
    document.querySelector(
      ".library-road-button"
    );


  if (libraryRoadButton) {

    libraryRoadButton.addEventListener(
      "click",
      () => {

        changeScreen(
          libraryScreen,
          homeScreen
        );

        setTimeout(
          () => {

            if (learningRoad) {

              learningRoad.scrollIntoView({
                behavior: "smooth"
              });

            }

          },
          400
        );

      }
    );

  }


  /* ========================================
     БИБЛИОТЕКА → ПРОФИЛЬ
  ======================================== */

  const libraryProfileButton =
    document.querySelector(
      ".library-profile-button"
    );


  if (libraryProfileButton) {

    libraryProfileButton.addEventListener(
      "click",
      () => {

        updateProfile();

        changeScreen(
          libraryScreen,
          profileScreen
        );

      }
    );

  }


  /* ========================================
     ПРОФИЛЬ → HOME
  ======================================== */

  const profileHomeButton =
    document.querySelector(
      ".profile-home-button"
    );


  if (profileHomeButton) {

    profileHomeButton.addEventListener(
      "click",
      () => {

        updateUserInterface();

        changeScreen(
          profileScreen,
          homeScreen
        );

      }
    );

  }


  /* ========================================
     ПРОФИЛЬ → БИБЛИОТЕКА
  ======================================== */

  const profileLibraryButton =
    document.querySelector(
      ".profile-library-button"
    );


  if (profileLibraryButton) {

    profileLibraryButton.addEventListener(
      "click",
      () => {

        if (librarySearchInput) {

          librarySearchInput.value =
            "";

        }

        buildLibrary();

        changeScreen(
          profileScreen,
          libraryScreen
        );

      }
    );

  }


  /* ========================================
     ПРОФИЛЬ → ДОРОЖКА
  ======================================== */

  const profileRoadButton =
    document.querySelector(
      ".profile-road-button"
    );


  if (profileRoadButton) {

    profileRoadButton.addEventListener(
      "click",
      () => {

        changeScreen(
          profileScreen,
          homeScreen
        );

        setTimeout(
          () => {

            if (learningRoad) {

              learningRoad.scrollIntoView({
                behavior: "smooth"
              });

            }

          },
          400
        );

      }
    );

  }


  /* ========================================
     НАСТРОЙКИ
  ======================================== */

  const settingsButton =
    document.getElementById(
      "settingsButton"
    );


  if (settingsButton) {

    settingsButton.addEventListener(
      "click",
      () => {

        alert(
          "⚙️ Настройки добавим позже."
        );

      }
    );

  }


  /* ========================================
     CAMPBELL READER
     ГЛАВА 2 — СТРАНИЦЫ ФАЙЛА 47–66
  ======================================== */

  const CAMPBELL_FIRST_PAGE = 47;
  const CAMPBELL_LAST_PAGE = 66;

  const CAMPBELL_TOTAL_PAGES =
    CAMPBELL_LAST_PAGE -
    CAMPBELL_FIRST_PAGE +
    1;


  /*
    Текущая страница сохраняется.

    Если ученик закрыл сайт на странице 54,
    при возвращении он продолжит с 54.
  */

  let campbellCurrentPage =
    Number(
      localStorage.getItem(
        "campbellChapter2CurrentPage"
      ) || CAMPBELL_FIRST_PAGE
    );


  /*
    Защита на случай повреждённого
    значения localStorage.
  */

  if (
    campbellCurrentPage <
    CAMPBELL_FIRST_PAGE ||
    campbellCurrentPage >
    CAMPBELL_LAST_PAGE
  ) {

    campbellCurrentPage =
      CAMPBELL_FIRST_PAGE;

  }


  /* ========================================
     МАКСИМАЛЬНО ПРОЧИТАННАЯ СТРАНИЦА
  ======================================== */

  let campbellMaxReadPage =
    Number(
      localStorage.getItem(
        "campbellChapter2MaxReadPage"
      ) || CAMPBELL_FIRST_PAGE
    );


  if (
    campbellMaxReadPage <
    CAMPBELL_FIRST_PAGE
  ) {

    campbellMaxReadPage =
      CAMPBELL_FIRST_PAGE;

  }


  if (
    campbellMaxReadPage >
    CAMPBELL_LAST_PAGE
  ) {

    campbellMaxReadPage =
      CAMPBELL_LAST_PAGE;

  }


  /* ========================================
     ПУТЬ К СТРАНИЦАМ КНИГИ

     Файлы должны лежать:

     assets/campbell/chapter2/page-47.jpg
     assets/campbell/chapter2/page-48.jpg
     ...
     assets/campbell/chapter2/page-66.jpg
  ======================================== */

  function getCampbellPagePath(
    page
  ) {

    return (
      `assets/campbell/chapter2/page-${page}.jpg`
    );

  }


  /* ========================================
     ПРОЦЕНТ ПРОЧТЕНИЯ
  ======================================== */

  function getCampbellReadingPercent() {

    const readPages =
      campbellMaxReadPage -
      CAMPBELL_FIRST_PAGE +
      1;

    const percent =
      Math.round(
        (
          readPages /
          CAMPBELL_TOTAL_PAGES
        ) * 100
      );

    return Math.min(
      100,
      Math.max(
        0,
        percent
      )
    );

  }


  /* ========================================
     СОХРАНИТЬ ПРОГРЕСС ЧТЕНИЯ
  ======================================== */

  function saveCampbellReadingProgress() {

    localStorage.setItem(
      "campbellChapter2CurrentPage",
      String(
        campbellCurrentPage
      )
    );


    if (
      campbellCurrentPage >
      campbellMaxReadPage
    ) {

      campbellMaxReadPage =
        campbellCurrentPage;

      localStorage.setItem(
        "campbellChapter2MaxReadPage",
        String(
          campbellMaxReadPage
        )
      );

    }


    /*
      Только достижение последней страницы
      разблокирует экзамен.
    */

    if (
      campbellMaxReadPage >=
      CAMPBELL_LAST_PAGE
    ) {

      localStorage.setItem(
        "campbellChapter2TheoryCompleted",
        "true"
      );

    }

  }


  /* ========================================
     ОБНОВИТЬ READER
  ======================================== */

  function renderCampbellReader() {

    saveCampbellReadingProgress();


    const percent =
      getCampbellReadingPercent();


    if (campbellReaderPageNumber) {

      campbellReaderPageNumber.textContent =
        `Страница ${campbellCurrentPage} из ${CAMPBELL_LAST_PAGE}`;

    }


    if (campbellReaderPageTop) {

      campbellReaderPageTop.textContent =
        `${campbellCurrentPage}`;

    }


    if (campbellReaderProgressFill) {

      campbellReaderProgressFill.style.width =
        `${percent}%`;

    }


    if (campbellReadingPercent) {

      campbellReadingPercent.textContent =
        `${percent}%`;

    }


    if (campbellReadingProgress) {

      campbellReadingProgress.style.width =
        `${percent}%`;

    }


    if (campbellReaderPrevButton) {

      campbellReaderPrevButton.disabled =
        campbellCurrentPage <=
        CAMPBELL_FIRST_PAGE;

    }


    if (campbellReaderNextButton) {

      if (
        campbellCurrentPage >=
        CAMPBELL_LAST_PAGE
      ) {

        campbellReaderNextButton.textContent =
          "Материал изучен ✓";

      }

      else {

        campbellReaderNextButton.textContent =
          "Следующая →";

      }

    }


    if (campbellReaderImage) {

      if (campbellReaderLoading) {

        campbellReaderLoading.style.display =
          "flex";

      }


      campbellReaderImage.style.opacity =
        "0";


      campbellReaderImage.onload =
        () => {

          if (campbellReaderLoading) {

            campbellReaderLoading.style.display =
              "none";

          }

          campbellReaderImage.style.opacity =
            "1";

      };


      campbellReaderImage.onerror =
        () => {

          if (campbellReaderLoading) {

            campbellReaderLoading.style.display =
              "none";

          }

          console.error(
            `Не удалось загрузить страницу ${campbellCurrentPage}`
          );

      };


      campbellReaderImage.src =
        getCampbellPagePath(
          campbellCurrentPage
        );

    }


    updateCampbellProgress();

  }


  /* ========================================
     ПРЕДЫДУЩАЯ СТРАНИЦА
  ======================================== */

  if (campbellReaderPrevButton) {

    campbellReaderPrevButton.addEventListener(
      "click",
      () => {

        if (
          campbellCurrentPage <=
          CAMPBELL_FIRST_PAGE
        ) {
          return;
        }

        campbellCurrentPage--;

        renderCampbellReader();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  }


  /* ========================================
     СЛЕДУЮЩАЯ СТРАНИЦА
  ======================================== */

  if (campbellReaderNextButton) {

    campbellReaderNextButton.addEventListener(
      "click",
      () => {

        if (
          campbellCurrentPage <
          CAMPBELL_LAST_PAGE
        ) {

          campbellCurrentPage++;

          renderCampbellReader();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

          return;

        }


        /*
          Последняя страница уже достигнута.
        */

        localStorage.setItem(
          "campbellChapter2TheoryCompleted",
          "true"
        );

        updateCampbellProgress();

        changeScreen(
          campbellTheoryScreen,
          campbellScreen
        );

      }
    );

  }


  /* ========================================
     CAMPBELL — ПРОГРЕСС КУРСА
  ======================================== */

  function updateCampbellProgress() {

    const theoryCompleted =
      localStorage.getItem(
        "campbellChapter2TheoryCompleted"
      ) === "true";


    const examCompleted =
      localStorage.getItem(
        "campbellChapter2ExamCompleted"
      ) === "true";


    const readingPercent =
      theoryCompleted
        ? 100
        : getCampbellReadingPercent();


    /*
      Чтение = половина главы.
      Экзамен = вторая половина.
    */

    let progress =
      Math.round(
        readingPercent * 0.5
      );


    if (examCompleted) {

      progress =
        100;

    }


    if (campbellProgressText) {

      campbellProgressText.textContent =
        `${progress}%`;

    }


    if (campbellProgressBar) {

      campbellProgressBar.style.width =
        `${progress}%`;

    }


    if (campbellReadingPercent) {

      campbellReadingPercent.textContent =
        `${readingPercent}%`;

    }


    if (campbellReadingProgress) {

      campbellReadingProgress.style.width =
        `${readingPercent}%`;

    }


    /* ======================================
       ТЕОРИЯ ПРОЙДЕНА
    ====================================== */

    if (theoryCompleted) {

      if (campbellExamButton) {

        campbellExamButton.classList.remove(
          "locked"
        );


        const examIcon =
          campbellExamButton.querySelector(
            ".campbell-action-icon"
          );


        if (examIcon) {

          examIcon.textContent =
            examCompleted
              ? "✅"
              : "📝";

        }

      }


      if (campbellExamStatus) {

        campbellExamStatus.textContent =
          examCompleted
            ? "Экзамен пройден ✓"
            : "Экзамен доступен";

      }

    }


    /* ======================================
       ТЕОРИЯ ЕЩЁ НЕ ПРОЙДЕНА
    ====================================== */

    else {

      if (campbellExamButton) {

        campbellExamButton.classList.add(
          "locked"
        );


        const examIcon =
          campbellExamButton.querySelector(
            ".campbell-action-icon"
          );


        if (examIcon) {

          examIcon.textContent =
            "🔒";

        }

      }


      if (campbellExamStatus) {

        campbellExamStatus.textContent =
          `Прочитано ${readingPercent}%`;

      }

    }

  }


  /* ========================================
     CAMPBELL → БИБЛИОТЕКА
  ======================================== */

  if (campbellBackButton) {

    campbellBackButton.addEventListener(
      "click",
      () => {

        if (librarySearchInput) {

          librarySearchInput.value =
            "";

        }

        buildLibrary();

        changeScreen(
          campbellScreen,
          libraryScreen
        );

      }
    );

  }


  /* ========================================
     CAMPBELL → ЧТЕНИЕ
  ======================================== */

  if (campbellTheoryButton) {

    campbellTheoryButton.addEventListener(
      "click",
      () => {

        renderCampbellReader();

        changeScreen(
          campbellScreen,
          campbellTheoryScreen
        );

      }
    );

  }


  /* ========================================
     ЧТЕНИЕ → CAMPBELL
  ======================================== */

  if (campbellTheoryBackButton) {

    campbellTheoryBackButton.addEventListener(
      "click",
      () => {

        saveCampbellReadingProgress();

        updateCampbellProgress();

        changeScreen(
          campbellTheoryScreen,
          campbellScreen
        );

      }
    );

  }


  /* ========================================
     СТАРАЯ КНОПКА "ЗАВЕРШИТЬ"

     Теперь нельзя нажать её раньше
     последней страницы.
  ======================================== */

  if (completeCampbellTheoryButton) {

    completeCampbellTheoryButton.addEventListener(
      "click",
      () => {

        if (
          campbellMaxReadPage <
          CAMPBELL_LAST_PAGE
        ) {

          alert(
            `📖 Сначала дочитай материал до страницы ${CAMPBELL_LAST_PAGE}.`
          );

          return;

        }


        localStorage.setItem(
          "campbellChapter2TheoryCompleted",
          "true"
        );


        updateCampbellProgress();


        changeScreen(
          campbellTheoryScreen,
          campbellScreen
        );

      }
    );

  }
    /* ========================================
     CAMPBELL — ВОПРОСЫ ЭКЗАМЕНА

     Пока здесь 10 рабочих вопросов.
     Потом заменим их вопросами
     из твоего файла экзамена.
  ======================================== */

  const campbellQuestions = [

    {
      question:
        "Какой элемент составляет основу органических молекул?",

      answers: [
        "Кислород",
        "Углерод",
        "Натрий",
        "Кальций"
      ],

      correct: 1,

      explanation:
        "Углерод способен образовывать четыре ковалентные связи, благодаря чему может создавать разнообразные молекулярные структуры."
    },

    {
      question:
        "Что определяет принадлежность атома к определённому химическому элементу?",

      answers: [
        "Количество нейтронов",
        "Количество электронных оболочек",
        "Количество протонов",
        "Масса атома"
      ],

      correct: 2,

      explanation:
        "Атомный номер элемента определяется числом протонов в ядре. Именно количество протонов определяет химический элемент."
    },

    {
      question:
        "Какая частица атома имеет отрицательный электрический заряд?",

      answers: [
        "Протон",
        "Нейтрон",
        "Электрон",
        "Ядро"
      ],

      correct: 2,

      explanation:
        "Электроны имеют отрицательный заряд. Протоны заряжены положительно, а нейтроны электрически нейтральны."
    },

    {
      question:
        "Где находится почти вся масса атома?",

      answers: [
        "В электронных оболочках",
        "В ядре",
        "В валентной оболочке",
        "Между электронами"
      ],

      correct: 1,

      explanation:
        "Протоны и нейтроны находятся в ядре и обладают значительно большей массой, чем электроны, поэтому почти вся масса атома сосредоточена в ядре."
    },

    {
      question:
        "Что такое изотопы одного химического элемента?",

      answers: [
        "Атомы с разным числом протонов",
        "Атомы с одинаковым числом нейтронов",
        "Атомы с одинаковым числом протонов, но разным числом нейтронов",
        "Молекулы с одинаковой массой"
      ],

      correct: 2,

      explanation:
        "Изотопы принадлежат одному элементу, поэтому имеют одинаковое количество протонов, но отличаются количеством нейтронов."
    },

    {
      question:
        "Какие электроны в основном определяют химические свойства атома?",

      answers: [
        "Электроны первой оболочки",
        "Валентные электроны",
        "Все электроны одинаково",
        "Только спаренные электроны"
      ],

      correct: 1,

      explanation:
        "В химических взаимодействиях особенно важны электроны внешней электронной оболочки — валентные электроны."
    },

    {
      question:
        "Что происходит при образовании ковалентной связи?",

      answers: [
        "Атомы совместно используют пару валентных электронов",
        "Один атом полностью теряет ядро",
        "Протоны переходят между атомами",
        "Нейтроны объединяются"
      ],

      correct: 0,

      explanation:
        "Ковалентная связь возникает, когда два атома совместно используют одну или несколько пар валентных электронов."
    },

    {
      question:
        "Что образуется, если атом теряет или приобретает электрон?",

      answers: [
        "Изотоп",
        "Ион",
        "Нейтрон",
        "Новая молекула обязательно"
      ],

      correct: 1,

      explanation:
        "Потеря или приобретение электронов изменяет электрический заряд атома. Такой заряженный атом или молекула называется ионом."
    },

    {
      question:
        "Какая связь возникает благодаря притяжению противоположно заряженных ионов?",

      answers: [
        "Ковалентная",
        "Водородная",
        "Ионная",
        "Пептидная"
      ],

      correct: 2,

      explanation:
        "Положительно и отрицательно заряженные ионы притягиваются друг к другу. Это электростатическое притяжение называют ионной связью."
    },

    {
      question:
        "Что происходит с веществом во время химической реакции?",

      answers: [
        "Атомы исчезают",
        "Создаются новые химические элементы",
        "Атомы реагентов перегруппировываются и образуют продукты",
        "Протоны превращаются в электроны"
      ],

      correct: 2,

      explanation:
        "Во время химической реакции атомы не исчезают. Связи между ними изменяются, и атомы реагентов перегруппировываются, образуя продукты реакции."
    }

  ];


  /* ========================================
     СОСТОЯНИЕ ЭКЗАМЕНА
  ======================================== */

  let campbellExamIndex = 0;

  let campbellSelectedAnswer =
    null;

  let campbellExamAnswersData =
    [];

  let campbellCorrectAnswers =
    0;

  let campbellExamSeconds =
    20 * 60;

  let campbellExamTimerId =
    null;

  let campbellExamStartedAt =
    null;

  let campbellLastResult =
    null;


  /* ========================================
     ЭЛЕМЕНТЫ НОВОГО HTML
  ======================================== */

  const campbellQuestionCounter =
    document.getElementById(
      "campbellQuestionCounter"
    );

  const campbellExamScore =
    document.getElementById(
      "campbellExamScore"
    );

  const campbellQuestionText =
    document.getElementById(
      "campbellQuestionText"
    );

  const campbellExamProgress =
    document.getElementById(
      "campbellExamProgress"
    );

  const campbellResultProgress =
    document.getElementById(
      "campbellResultProgress"
    );

  const campbellCorrectCount =
    document.getElementById(
      "campbellCorrectCount"
    );

  const campbellWrongCount =
    document.getElementById(
      "campbellWrongCount"
    );

  const campbellTotalCount =
    document.getElementById(
      "campbellTotalCount"
    );

  const campbellResultIcon =
    document.getElementById(
      "campbellResultIcon"
    );


  /* ========================================
     ФОРМАТ ВРЕМЕНИ
  ======================================== */

  function formatCampbellTime(
    seconds
  ) {

    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return (
      String(minutes)
        .padStart(2, "0") +
      ":" +
      String(remainingSeconds)
        .padStart(2, "0")
    );

  }


  /* ========================================
     ОБНОВИТЬ ТАЙМЕР
  ======================================== */

  function updateCampbellTimer() {

    if (!campbellExamTimer) {
      return;
    }


    campbellExamTimer.textContent =
      `⏱️ ${formatCampbellTime(
        campbellExamSeconds
      )}`;


    campbellExamTimer.classList.remove(
      "warning",
      "danger"
    );


    if (
      campbellExamSeconds <= 60
    ) {

      campbellExamTimer.classList.add(
        "danger"
      );

    }

    else if (
      campbellExamSeconds <= 300
    ) {

      campbellExamTimer.classList.add(
        "warning"
      );

    }

  }


  /* ========================================
     ОСТАНОВИТЬ ТАЙМЕР
  ======================================== */

  function stopCampbellTimer() {

    if (
      campbellExamTimerId !==
      null
    ) {

      clearInterval(
        campbellExamTimerId
      );

      campbellExamTimerId =
        null;

    }

  }


  /* ========================================
     ЗАПУСТИТЬ ТАЙМЕР
  ======================================== */

  function startCampbellTimer() {

    stopCampbellTimer();

    updateCampbellTimer();


    campbellExamTimerId =
      setInterval(
        () => {

          campbellExamSeconds--;


          if (
            campbellExamSeconds <= 0
          ) {

            campbellExamSeconds =
              0;

            updateCampbellTimer();

            stopCampbellTimer();

            finishCampbellExam(
              true
            );

            return;

          }


          updateCampbellTimer();

        },
        1000
      );

  }


  /* ========================================
     ЗАПУСТИТЬ ЭКЗАМЕН
  ======================================== */

  function startCampbellExam() {

    const theoryCompleted =
      localStorage.getItem(
        "campbellChapter2TheoryCompleted"
      ) === "true";


    if (!theoryCompleted) {

      alert(
        "🔒 Сначала изучи весь материал главы 2."
      );

      return false;

    }


    stopCampbellTimer();


    campbellExamIndex =
      0;

    campbellSelectedAnswer =
      null;

    campbellExamAnswersData =
      [];

    campbellCorrectAnswers =
      0;

    campbellExamSeconds =
      20 * 60;

    campbellExamStartedAt =
      Date.now();


    renderCampbellQuestion();

    startCampbellTimer();


    return true;

  }


  /* ========================================
     ОТКРЫТЬ ЭКЗАМЕН
  ======================================== */

  if (campbellExamButton) {

    campbellExamButton.addEventListener(
      "click",
      () => {

        const theoryCompleted =
          localStorage.getItem(
            "campbellChapter2TheoryCompleted"
          ) === "true";


        if (!theoryCompleted) {

          alert(
            "🔒 Сначала изучи материал главы 2."
          );

          return;

        }


        const started =
          startCampbellExam();


        if (!started) {
          return;
        }


        changeScreen(
          campbellScreen,
          campbellExamScreen
        );

      }
    );

  }


  /* ========================================
     ПОКАЗАТЬ ВОПРОС
  ======================================== */

  function renderCampbellQuestion() {

    const question =
      campbellQuestions[
        campbellExamIndex
      ];


    if (!question) {

      finishCampbellExam(
        false
      );

      return;

    }


    campbellSelectedAnswer =
      null;


    if (campbellExamNextButton) {

      campbellExamNextButton.disabled =
        true;

      campbellExamNextButton.textContent =
        campbellExamIndex ===
        campbellQuestions.length - 1
          ? "Завершить экзамен"
          : "Ответить";

    }


    /* ======================================
       СЧЁТЧИК
    ====================================== */

    if (campbellQuestionCounter) {

      campbellQuestionCounter.textContent =
        `Вопрос ${
          campbellExamIndex + 1
        } из ${
          campbellQuestions.length
        }`;

    }


    /*
      Поддержка старого HTML.
    */

    if (campbellExamQuestionCounter) {

      campbellExamQuestionCounter.textContent =
        `Вопрос ${
          campbellExamIndex + 1
        } из ${
          campbellQuestions.length
        }`;

    }


    /* ======================================
       ТЕКУЩИЙ СЧЁТ
    ====================================== */

    if (campbellExamScore) {

      campbellExamScore.textContent =
        `${campbellCorrectAnswers} правильных`;

    }


    /* ======================================
       ПРОГРЕСС
    ====================================== */

    const progress =
      Math.round(
        (
          campbellExamIndex /
          campbellQuestions.length
        ) * 100
      );


    if (campbellExamProgress) {

      campbellExamProgress.style.width =
        `${progress}%`;

    }


    if (campbellExamProgressBar) {

      campbellExamProgressBar.style.width =
        `${progress}%`;

    }


    if (campbellExamProgressPercent) {

      campbellExamProgressPercent.textContent =
        `${progress}%`;

    }


    /* ======================================
       ТЕКСТ ВОПРОСА
    ====================================== */

    if (campbellQuestionText) {

      campbellQuestionText.textContent =
        question.question;

    }


    if (campbellExamQuestion) {

      campbellExamQuestion.textContent =
        question.question;

    }


    if (campbellExamQuestionHint) {

      campbellExamQuestionHint.textContent =
        "Выбери один правильный ответ.";

    }


    /* ======================================
       ОТВЕТЫ
    ====================================== */

    if (!campbellExamAnswers) {
      return;
    }


    campbellExamAnswers.innerHTML =
      "";


    const letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F"
    ];


    question.answers.forEach(
      (answer, index) => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "answer-option";


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

            selectCampbellAnswer(
              index,
              button
            );

          }
        );


        campbellExamAnswers.appendChild(
          button
        );

      }
    );

  }


  /* ========================================
     ВЫБРАТЬ ОТВЕТ
  ======================================== */

  function selectCampbellAnswer(
    answerIndex,
    button
  ) {

    campbellSelectedAnswer =
      answerIndex;


    if (campbellExamAnswers) {

      campbellExamAnswers
        .querySelectorAll(
          ".answer-option"
        )
        .forEach(
          option => {

            option.classList.remove(
              "selected"
            );

          }
        );

    }


    button.classList.add(
      "selected"
    );


    if (campbellExamNextButton) {

      campbellExamNextButton.disabled =
        false;

    }

  }


  /* ========================================
     ПОДТВЕРДИТЬ ОТВЕТ
  ======================================== */

  function submitCampbellAnswer() {

    if (
      campbellSelectedAnswer ===
      null
    ) {
      return;
    }


    const question =
      campbellQuestions[
        campbellExamIndex
      ];


    if (!question) {
      return;
    }


    const isCorrect =
      campbellSelectedAnswer ===
      question.correct;


    if (isCorrect) {

      campbellCorrectAnswers++;

    }


    campbellExamAnswersData.push({

      question:
        question.question,

      answers:
        [...question.answers],

      selected:
        campbellSelectedAnswer,

      correct:
        question.correct,

      isCorrect:
        isCorrect,

      explanation:
        question.explanation

    });


    campbellExamIndex++;


    if (
      campbellExamIndex >=
      campbellQuestions.length
    ) {

      finishCampbellExam(
        false
      );

      return;

    }


    renderCampbellQuestion();

  }


  /* ========================================
     КНОПКА ОТВЕТИТЬ
  ======================================== */

  if (campbellExamNextButton) {

    campbellExamNextButton.addEventListener(
      "click",
      () => {

        submitCampbellAnswer();

      }
    );

  }


  /* ========================================
     ВЫХОД ИЗ ЭКЗАМЕНА
  ======================================== */

  if (campbellExamBackButton) {

    campbellExamBackButton.addEventListener(
      "click",
      () => {

        const exit =
          confirm(
            "Выйти из экзамена? Текущий результат не сохранится."
          );


        if (!exit) {
          return;
        }


        stopCampbellTimer();


        changeScreen(
          campbellExamScreen,
          campbellScreen
        );

      }
    );

  }


  /* ========================================
     ЗАВЕРШИТЬ ЭКЗАМЕН
  ======================================== */

  function finishCampbellExam(
    timeExpired = false
  ) {

    stopCampbellTimer();


    /*
      Если время закончилось,
      текущий выбранный ответ
      тоже сохраняем.
    */

    if (
      timeExpired &&
      campbellSelectedAnswer !==
        null &&
      campbellExamIndex <
        campbellQuestions.length
    ) {

      const question =
        campbellQuestions[
          campbellExamIndex
        ];


      const isCorrect =
        campbellSelectedAnswer ===
        question.correct;


      if (isCorrect) {

        campbellCorrectAnswers++;

      }


      campbellExamAnswersData.push({

        question:
          question.question,

        answers:
          [...question.answers],

        selected:
          campbellSelectedAnswer,

        correct:
          question.correct,

        isCorrect:
          isCorrect,

        explanation:
          question.explanation

      });

    }


    /*
      Если пользователь не успел
      ответить на оставшиеся вопросы,
      добавляем их как "Нет ответа".
    */

    const answeredIndexes =
      campbellExamAnswersData.length;


    for (
      let index =
        answeredIndexes;
      index <
        campbellQuestions.length;
      index++
    ) {

      const question =
        campbellQuestions[index];


      campbellExamAnswersData.push({

        question:
          question.question,

        answers:
          [...question.answers],

        selected:
          null,

        correct:
          question.correct,

        isCorrect:
          false,

        explanation:
          question.explanation

      });

    }


    const total =
      campbellQuestions.length;


    const correct =
      campbellCorrectAnswers;


    const wrong =
      total - correct;


    const percent =
      Math.round(
        (
          correct /
          total
        ) * 100
      );


    const usedSeconds =
      campbellExamStartedAt
        ? Math.min(
            20 * 60,
            Math.floor(
              (
                Date.now() -
                campbellExamStartedAt
              ) / 1000
            )
          )
        : 0;


    campbellLastResult = {

      correct:
        correct,

      wrong:
        wrong,

      total:
        total,

      percent:
        percent,

      time:
        usedSeconds,

      timeExpired:
        timeExpired,

      answers:
        campbellExamAnswersData

    };


    /* ======================================
       СОХРАНЕНИЕ РЕЗУЛЬТАТА
    ====================================== */

    localStorage.setItem(
      "campbellChapter2LastResult",
      JSON.stringify(
        campbellLastResult
      )
    );


    localStorage.setItem(
      "campbellChapter2ExamCompleted",
      "true"
    );


    localStorage.setItem(
      "campbellChapter2BestScore",
      String(
        Math.max(
          percent,
          Number(
            localStorage.getItem(
              "campbellChapter2BestScore"
            ) || 0
          )
        )
      )
    );


    /* ======================================
       НАГРАДА

       Даём один раз за первое
       завершение экзамена.
    ====================================== */

    const rewardAlreadyGiven =
      localStorage.getItem(
        "campbellChapter2RewardGiven"
      ) === "true";


    let rewardGenes =
      0;


    if (!rewardAlreadyGiven) {

      if (percent >= 90) {

        rewardGenes =
          25;

      }

      else if (percent >= 70) {

        rewardGenes =
          20;

      }

      else if (percent >= 50) {

        rewardGenes =
          15;

      }

      else {

        rewardGenes =
          10;

      }


      const oldGenes =
        Number(
          localStorage.getItem(
            "groundGenes"
          ) || 0
        );


      localStorage.setItem(
        "groundGenes",
        String(
          oldGenes +
          rewardGenes
        )
      );


      localStorage.setItem(
        "campbellChapter2RewardGiven",
        "true"
      );

    }


    campbellLastResult.rewardGenes =
      rewardGenes;


    /*
      Сохраняем ещё раз,
      уже вместе с наградой.
    */

    localStorage.setItem(
      "campbellChapter2LastResult",
      JSON.stringify(
        campbellLastResult
      )
    );


    showCampbellResult();


    updateCampbellProgress();

    updateUserInterface();


    changeScreen(
      campbellExamScreen,
      campbellResultScreen
    );

  }


  /* ========================================
     ПОКАЗАТЬ РЕЗУЛЬТАТ
  ======================================== */

  function showCampbellResult() {

    if (!campbellLastResult) {

      const savedResult =
        localStorage.getItem(
          "campbellChapter2LastResult"
        );


      if (savedResult) {

        try {

          campbellLastResult =
            JSON.parse(
              savedResult
            );

        }

        catch (error) {

          console.error(
            "Ошибка результата Campbell:",
            error
          );

          return;

        }

      }

    }


    if (!campbellLastResult) {
      return;
    }


    const result =
      campbellLastResult;


    /* ======================================
       ЗАГОЛОВОК
    ====================================== */

    let title =
      "Продолжай!";

    let message =
      "Разбор поможет понять ошибки.";

    let icon =
      "🧬";


    if (
      result.percent >= 90
    ) {

      title =
        "Отличный результат!";

      message =
        "Ты очень хорошо разобрался в главе 2.";

      icon =
        "🏆";

    }

    else if (
      result.percent >= 70
    ) {

      title =
        "Хорошая работа!";

      message =
        "Основные идеи главы уже усвоены.";

      icon =
        "🔥";

    }

    else if (
      result.percent >= 50
    ) {

      title =
        "Неплохо!";

      message =
        "Есть несколько тем, которые стоит повторить.";

      icon =
        "🧠";

    }


    if (
      result.timeExpired
    ) {

      message =
        "Время закончилось. Посмотри разбор и попробуй ещё раз.";

    }


    if (campbellResultTitle) {

      campbellResultTitle.textContent =
        title;

    }


    if (campbellResultMessage) {

      campbellResultMessage.textContent =
        message;

    }


    if (campbellResultIcon) {

      campbellResultIcon.textContent =
        icon;

    }


    /* ======================================
       ПРОЦЕНТ
    ====================================== */

    if (campbellResultPercent) {

      campbellResultPercent.textContent =
        `${result.percent}%`;

    }


    if (campbellResultProgress) {

      campbellResultProgress.style.width =
        `${result.percent}%`;

    }


    /* ======================================
       СЧЁТ
    ====================================== */

    if (campbellCorrectCount) {

      campbellCorrectCount.textContent =
        result.correct;

    }


    if (campbellWrongCount) {

      campbellWrongCount.textContent =
        result.wrong;

    }


    if (campbellTotalCount) {

      campbellTotalCount.textContent =
        result.total;

    }


    /*
      Поддержка старого HTML.
    */

    if (campbellResultScore) {

      campbellResultScore.textContent =
        `${result.correct}/${result.total}`;

    }


    if (campbellResultTime) {

      campbellResultTime.textContent =
        formatCampbellTime(
          result.time
        );

    }


    if (campbellResultStatus) {

      campbellResultStatus.textContent =
        `${result.percent}%`;

    }


    if (campbellResultDescription) {

      campbellResultDescription.textContent =
        message;

    }


    /* ======================================
       НАГРАДА
    ====================================== */

    if (campbellRewardText) {

      if (
        result.rewardGenes > 0
      ) {

        campbellRewardText.textContent =
          `+${result.rewardGenes} генов`;

      }

      else {

        campbellRewardText.textContent =
          "Награда уже получена ✓";

      }

    }

  }
    /* ========================================
     CAMPBELL — ПРОДОЛЖИТЬ ПОСЛЕ РЕЗУЛЬТАТА
  ======================================== */

  if (campbellContinueButton) {

    campbellContinueButton.addEventListener(
      "click",
      () => {

        updateCampbellProgress();

        buildLibrary();

        changeScreen(
          campbellResultScreen,
          campbellScreen
        );

      }
    );

  }


  /* ========================================
     CAMPBELL — ПОВТОРИТЬ ЭКЗАМЕН
  ======================================== */

  if (campbellRetryButton) {

    campbellRetryButton.addEventListener(
      "click",
      () => {

        const started =
          startCampbellExam();

        if (!started) {
          return;
        }

        changeScreen(
          campbellResultScreen,
          campbellExamScreen
        );

      }
    );

  }


  /* ========================================
     CAMPBELL — ОТКРЫТЬ РАЗБОР
  ======================================== */

  if (campbellReviewButton) {

    campbellReviewButton.addEventListener(
      "click",
      () => {

        loadCampbellLastResult();

        if (!campbellLastResult) {

          alert(
            "Сначала пройди экзамен."
          );

          return;

        }

        renderCampbellReview();

        changeScreen(
          campbellResultScreen,
          campbellReviewScreen
        );

      }
    );

  }


  /* ========================================
     ЗАГРУЗИТЬ ПОСЛЕДНИЙ РЕЗУЛЬТАТ
  ======================================== */

  function loadCampbellLastResult() {

    const saved =
      localStorage.getItem(
        "campbellChapter2LastResult"
      );

    if (!saved) {

      campbellLastResult =
        null;

      return null;

    }

    try {

      campbellLastResult =
        JSON.parse(saved);

      return campbellLastResult;

    }

    catch (error) {

      console.error(
        "Не удалось загрузить результат Campbell:",
        error
      );

      campbellLastResult =
        null;

      return null;

    }

  }


  /* ========================================
     CAMPBELL — РАЗБОР ЭКЗАМЕНА
  ======================================== */

  function renderCampbellReview() {

    if (!campbellLastResult) {

      loadCampbellLastResult();

    }

    if (
      !campbellLastResult ||
      !Array.isArray(
        campbellLastResult.answers
      )
    ) {

      if (campbellReviewQuestions) {

        campbellReviewQuestions.innerHTML = `

          <div class="campbell-theory-block">

            <h2>
              Результат не найден
            </h2>

            <div class="campbell-note">

              <span>ℹ️</span>

              <p>
                Сначала пройди экзамен,
                после этого здесь появится
                полный разбор вопросов.
              </p>

            </div>

          </div>

        `;

      }

      return;

    }


    const result =
      campbellLastResult;


    /* ======================================
       МИНИ-СЧЁТ
    ====================================== */

    if (campbellReviewScore) {

      campbellReviewScore.textContent =
        `${result.correct}/${result.total}`;

    }


    /* ======================================
       ПРОГРЕСС
    ====================================== */

    if (campbellReviewProgress) {

      campbellReviewProgress.style.width =
        "100%";

    }


    if (!campbellReviewQuestions) {
      return;
    }


    campbellReviewQuestions.innerHTML =
      "";


    const letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F"
    ];


    /* ======================================
       КАЖДЫЙ ВОПРОС
    ====================================== */

    result.answers.forEach(
      (answerData, index) => {

        const block =
          document.createElement(
            "div"
          );


        block.className =
          "campbell-theory-block";


        const userAnswer =
          answerData.selected !== null &&
          answerData.selected !== undefined
            ? answerData.answers[
                answerData.selected
              ]
            : "Нет ответа";


        const correctAnswer =
          answerData.answers[
            answerData.correct
          ];


        const userLetter =
          answerData.selected !== null &&
          answerData.selected !== undefined
            ? letters[
                answerData.selected
              ] || ""
            : "";


        const correctLetter =
          letters[
            answerData.correct
          ] || "";


        const statusIcon =
          answerData.isCorrect
            ? "✅"
            : "❌";


        const statusText =
          answerData.isCorrect
            ? "Правильно"
            : "Ошибка";


        block.innerHTML = `

          <span class="small-label">
            ВОПРОС ${index + 1}
            • ${statusIcon}
            ${statusText}
          </span>

          <h2>
            ${answerData.question}
          </h2>


          <div
            class="
              campbell-review-answer
              ${
                answerData.isCorrect
                  ? "correct"
                  : "wrong"
              }
            "
          >

            <strong>
              ТВОЙ ОТВЕТ
            </strong>

            <p>

              ${
                userLetter
                  ? `${userLetter}. `
                  : ""
              }

              ${userAnswer}

            </p>

          </div>


          ${
            !answerData.isCorrect
              ? `

                <div
                  class="campbell-review-correct"
                >

                  <strong>
                    ПРАВИЛЬНЫЙ ОТВЕТ
                  </strong>

                  <p>
                    ${correctLetter}.
                    ${correctAnswer}
                  </p>

                </div>

              `
              : ""
          }


          <div class="campbell-note">

            <span>💡</span>

            <p>
              ${answerData.explanation}
            </p>

          </div>

        `;


        campbellReviewQuestions.appendChild(
          block
        );

      }
    );

  }


  /* ========================================
     РАЗБОР → РЕЗУЛЬТАТ
  ======================================== */

  if (campbellReviewBackButton) {

    campbellReviewBackButton.addEventListener(
      "click",
      () => {

        showCampbellResult();

        changeScreen(
          campbellReviewScreen,
          campbellResultScreen
        );

      }
    );

  }


  /* ========================================
     ЗАВЕРШИТЬ РАЗБОР
  ======================================== */

  if (campbellReviewFinishButton) {

    campbellReviewFinishButton.addEventListener(
      "click",
      () => {

        updateCampbellProgress();

        changeScreen(
          campbellReviewScreen,
          campbellScreen
        );

      }
    );

  }


  /* ========================================
     ВОССТАНОВИТЬ CAMPBELL
     ПОСЛЕ ПЕРЕЗАГРУЗКИ
  ======================================== */

  function restoreCampbellState() {

    /*
      Загружаем последний результат,
      если экзамен уже проходили.
    */

    loadCampbellLastResult();


    /*
      Если пользователь уже дошёл
      до последней страницы,
      теория считается завершённой.
    */

    if (
      campbellMaxReadPage >=
      CAMPBELL_LAST_PAGE
    ) {

      localStorage.setItem(
        "campbellChapter2TheoryCompleted",
        "true"
      );

    }


    /*
      Проверяем сохранённую страницу.
    */

    const savedPage =
      Number(
        localStorage.getItem(
          "campbellChapter2CurrentPage"
        )
      );


    if (
      Number.isFinite(savedPage) &&
      savedPage >=
        CAMPBELL_FIRST_PAGE &&
      savedPage <=
        CAMPBELL_LAST_PAGE
    ) {

      campbellCurrentPage =
        savedPage;

    }


    updateCampbellProgress();

  }


  /* ========================================
     ВОССТАНОВИТЬ РЕЗУЛЬТАТ
  ======================================== */

  function restoreCampbellResult() {

    const result =
      loadCampbellLastResult();


    if (!result) {
      return;
    }


    /*
      Если сохранён старый результат,
      где каких-то полей ещё не было,
      аккуратно добавляем значения.
    */

    if (
      typeof result.correct !==
      "number"
    ) {

      result.correct =
        0;

    }


    if (
      typeof result.total !==
      "number"
    ) {

      result.total =
        campbellQuestions.length;

    }


    if (
      typeof result.wrong !==
      "number"
    ) {

      result.wrong =
        result.total -
        result.correct;

    }


    if (
      typeof result.percent !==
      "number"
    ) {

      result.percent =
        result.total > 0
          ? Math.round(
              (
                result.correct /
                result.total
              ) * 100
            )
          : 0;

    }


    if (
      typeof result.time !==
      "number"
    ) {

      result.time =
        0;

    }


    if (
      typeof result.rewardGenes !==
      "number"
    ) {

      result.rewardGenes =
        0;

    }


    campbellLastResult =
      result;

  }


  /* ========================================
     БЕЗОПАСНОЕ СОХРАНЕНИЕ CAMPBELL
     ПРИ ЗАКРЫТИИ СТРАНИЦЫ
  ======================================== */

  window.addEventListener(
    "beforeunload",
    () => {

      localStorage.setItem(
        "campbellChapter2CurrentPage",
        String(
          campbellCurrentPage
        )
      );


      localStorage.setItem(
        "campbellChapter2MaxReadPage",
        String(
          campbellMaxReadPage
        )
      );

    }
  );


  /* ========================================
     ВИДИМОСТЬ СТРАНИЦЫ
  ======================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      /*
        Если пользователь свернул вкладку
        во время чтения — прогресс сохраняем.
      */

      if (document.hidden) {

        localStorage.setItem(
          "campbellChapter2CurrentPage",
          String(
            campbellCurrentPage
          )
        );


        localStorage.setItem(
          "campbellChapter2MaxReadPage",
          String(
            campbellMaxReadPage
          )
        );

      }

    }
  );


  /* ========================================
     КЛАВИАТУРА CAMPBELL READER

     ← предыдущая
     → следующая
  ======================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        !campbellTheoryScreen ||
        !campbellTheoryScreen.classList.contains(
          "active"
        )
      ) {

        return;

      }


      if (
        event.key ===
        "ArrowLeft"
      ) {

        if (
          campbellCurrentPage >
          CAMPBELL_FIRST_PAGE
        ) {

          campbellCurrentPage--;

          renderCampbellReader();

        }

      }


      if (
        event.key ===
        "ArrowRight"
      ) {

        if (
          campbellCurrentPage <
          CAMPBELL_LAST_PAGE
        ) {

          campbellCurrentPage++;

          renderCampbellReader();

        }

      }

    }
  );


  /* ========================================
     СВАЙП НА ТЕЛЕФОНЕ
  ======================================== */

  let campbellTouchStartX =
    null;

  let campbellTouchEndX =
    null;


  if (campbellTheoryScreen) {

    campbellTheoryScreen.addEventListener(
      "touchstart",
      event => {

        if (
          !event.changedTouches ||
          !event.changedTouches[0]
        ) {
          return;
        }


        campbellTouchStartX =
          event.changedTouches[0]
            .screenX;

      },
      {
        passive: true
      }
    );


    campbellTheoryScreen.addEventListener(
      "touchend",
      event => {

        if (
          campbellTouchStartX ===
          null
        ) {
          return;
        }


        if (
          !event.changedTouches ||
          !event.changedTouches[0]
        ) {
          return;
        }


        campbellTouchEndX =
          event.changedTouches[0]
            .screenX;


        handleCampbellSwipe();


        campbellTouchStartX =
          null;

        campbellTouchEndX =
          null;

      },
      {
        passive: true
      }
    );

  }


  /* ========================================
     ОБРАБОТКА СВАЙПА
  ======================================== */

  function handleCampbellSwipe() {

    if (
      campbellTouchStartX ===
        null ||
      campbellTouchEndX ===
        null
    ) {
      return;
    }


    const distance =
      campbellTouchEndX -
      campbellTouchStartX;


    /*
      Маленькие движения игнорируем.
    */

    if (
      Math.abs(distance) <
      70
    ) {

      return;

    }


    /*
      Свайп вправо:
      предыдущая страница.
    */

    if (
      distance > 0 &&
      campbellCurrentPage >
        CAMPBELL_FIRST_PAGE
    ) {

      campbellCurrentPage--;

      renderCampbellReader();

      return;

    }


    /*
      Свайп влево:
      следующая страница.
    */

    if (
      distance < 0 &&
      campbellCurrentPage <
        CAMPBELL_LAST_PAGE
    ) {

      campbellCurrentPage++;

      renderCampbellReader();

    }

  }


  /* ========================================
     ОБНОВИТЬ КНОПКУ ЗАВЕРШЕНИЯ ЧТЕНИЯ
  ======================================== */

  function updateCampbellCompleteButton() {

    if (
      !completeCampbellTheoryButton
    ) {
      return;
    }


    const completed =
      campbellMaxReadPage >=
      CAMPBELL_LAST_PAGE;


    completeCampbellTheoryButton.disabled =
      !completed;


    completeCampbellTheoryButton.textContent =
      completed
        ? "Завершить изучение ✓"
        : `Дочитай до страницы ${CAMPBELL_LAST_PAGE}`;

  }


  /* ========================================
     ДОПОЛНЯЕМ ОБНОВЛЕНИЕ READER
  ======================================== */

  const originalRenderCampbellReader =
    renderCampbellReader;


  renderCampbellReader =
    function () {

      originalRenderCampbellReader();

      updateCampbellCompleteButton();

    };


  /* ========================================
     ПРОВЕРКА CAMPBELL ПРИ СТАРТЕ
  ======================================== */

  restoreCampbellState();

  restoreCampbellResult();

  updateCampbellCompleteButton();


  /* ========================================
     ПЕРВИЧНЫЙ ЗАПУСК GROUND
  ======================================== */

  const savedGrade =
    localStorage.getItem(
      "groundGrade"
    );


  if (savedGrade) {

    /*
      Пользователь уже выбирал класс.
      Данные просто подготавливаем.
    */

    updateUserInterface();

  }

  else {

    /*
      Первый запуск.
    */

    if (currentGrade) {

      currentGrade.textContent =
        "Класс не выбран";

    }

  }


  /* ========================================
     ПЕРВИЧНАЯ БИБЛИОТЕКА
  ======================================== */

  buildLibrary();


  /* ========================================
     CAMPBELL — ФИНАЛЬНОЕ ОБНОВЛЕНИЕ
  ======================================== */

  updateCampbellProgress();


  /* ========================================
     GROUND READY
  ======================================== */

  console.log(
    "🧬 Ground loaded"
  );

  console.log(
    `📖 Campbell Chapter 2: pages ${CAMPBELL_FIRST_PAGE}-${CAMPBELL_LAST_PAGE}`
  );

  console.log(
    `📚 Current Campbell page: ${campbellCurrentPage}`
  );


});
