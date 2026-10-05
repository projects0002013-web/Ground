/* =========================================================
   GROUND — APP.JS
   PART 1
   CORE + SCREENS + NAVIGATION + PROFILE FIX
========================================================= */

"use strict";


/* =========================================================
   1. HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) =>
  Array.from(document.querySelectorAll(selector));


function getById(id) {
  return document.getElementById(id);
}


/* =========================================================
   2. SCREENS
========================================================= */

const welcomeScreen =
  getById("welcomeScreen");

const pathScreen =
  getById("pathScreen");

const gradeScreen =
  getById("gradeScreen");

const homeScreen =
  getById("homeScreen");

const libraryScreen =
  getById("libraryScreen");

const profileScreen =
  getById("profileScreen");

const lessonScreen =
  getById("lessonScreen");

const lessonCompleteScreen =
  getById("lessonCompleteScreen");

const campbellScreen =
  getById("campbellScreen");

const campbellTheoryScreen =
  getById("campbellTheoryScreen");

const campbellTheoryCompleteScreen =
  getById("campbellTheoryCompleteScreen");

const campbellExamScreen =
  getById("campbellExamScreen");

const campbellResultScreen =
  getById("campbellResultScreen");

const campbellReviewScreen =
  getById("campbellReviewScreen");


const allScreens = $$(".screen");


/* =========================================================
   3. SCREEN SWITCHER

   Именно эта функция включает анимацию CSS:
   .screen.active
========================================================= */

function changeScreen(fromScreen, toScreen) {

  if (!toScreen) {
    console.error(
      "GROUND: экран для перехода не найден."
    );

    return;
  }


  allScreens.forEach((screen) => {

    screen.classList.remove("active");

  });


  /*
     Перезапускаем CSS-анимацию
     при каждом открытии экрана.
  */

  void toScreen.offsetWidth;


  toScreen.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  updateBottomNavigation(toScreen);

}


/* =========================================================
   4. SAFE CLICK

   Если какой-то элемент пока отсутствует,
   весь app.js из-за этого НЕ ломается.
========================================================= */

function onClick(element, callback) {

  if (!element) {
    return;
  }

  element.addEventListener(
    "click",
    callback
  );

}


/* =========================================================
   5. LOCAL STORAGE
========================================================= */

function getNumber(key, fallback = 0) {

  const value =
    Number(localStorage.getItem(key));

  return Number.isFinite(value)
    ? value
    : fallback;

}


function getText(key, fallback = "") {

  const value =
    localStorage.getItem(key);

  return value ?? fallback;

}


/* =========================================================
   6. PLAYER STATE
========================================================= */

const groundState = {

  grade:
    getText(
      "groundSelectedGrade",
      "9"
    ),

  genes:
    getNumber(
      "groundGenes",
      0
    ),

  xp:
    getNumber(
      "groundXP",
      0
    ),

  level:
    getNumber(
      "groundLevel",
      1
    ),

  streak:
    getNumber(
      "groundStreak",
      0
    ),

  completedLessons:
    getNumber(
      "groundCompletedLessons",
      0
    )

};


/* =========================================================
   7. SAVE STATE
========================================================= */

function saveGroundState() {

  localStorage.setItem(
    "groundSelectedGrade",
    groundState.grade
  );

  localStorage.setItem(
    "groundGenes",
    String(groundState.genes)
  );

  localStorage.setItem(
    "groundXP",
    String(groundState.xp)
  );

  localStorage.setItem(
    "groundLevel",
    String(groundState.level)
  );

  localStorage.setItem(
    "groundStreak",
    String(groundState.streak)
  );

  localStorage.setItem(
    "groundCompletedLessons",
    String(
      groundState.completedLessons
    )
  );

}


/* =========================================================
   8. SET TEXT SAFELY
========================================================= */

function setText(id, value) {

  const element =
    getById(id);

  if (!element) {
    return;
  }

  element.textContent = value;

}


/* =========================================================
   9. SET WIDTH SAFELY
========================================================= */

function setProgress(id, percent) {

  const element =
    getById(id);

  if (!element) {
    return;
  }


  const safePercent =
    Math.max(
      0,
      Math.min(100, percent)
    );


  element.style.width =
    `${safePercent}%`;

}


/* =========================================================
   10. UPDATE GLOBAL STATS
========================================================= */

function updateGlobalStats() {

  /*
     ГЕНЫ
  */

  $$(
    ".gene-value"
  ).forEach((element) => {

    element.textContent =
      groundState.genes;

  });


  /*
     Элементы с конкретными ID,
     если они есть в HTML.
  */

  setText(
    "homeGenes",
    groundState.genes
  );

  setText(
    "profileGenes",
    groundState.genes
  );


  /*
     LEVEL
  */

  setText(
    "levelValue",
    groundState.level
  );

  setText(
    "profileLevel",
    groundState.level
  );


  /*
     STREAK
  */

  setText(
    "homeStreak",
    groundState.streak
  );

  setText(
    "profileStreak",
    groundState.streak
  );


  /*
     COMPLETED LESSONS
  */

  setText(
    "profileCompletedLessons",
    groundState.completedLessons
  );


  /*
     XP

     Сейчас:
     каждый уровень = 100 XP.
  */

  const xpInLevel =
    groundState.xp % 100;

  setText(
    "xpValue",
    xpInLevel
  );

  setText(
    "profileXPText",
    `${xpInLevel} / 100 XP`
  );


  setProgress(
    "xpProgress",
    xpInLevel
  );

  setProgress(
    "profileXPProgress",
    xpInLevel
  );


  /*
     КЛАСС
  */

  setText(
    "currentGrade",
    `${groundState.grade} класс`
  );

  setText(
    "profileGrade",
    `${groundState.grade} класс`
  );

}


/* =========================================================
   11. LEVEL CALCULATION
========================================================= */

function recalculateLevel() {

  groundState.level =
    Math.floor(
      groundState.xp / 100
    ) + 1;

}


/* =========================================================
   12. ADD XP
========================================================= */

function addXP(amount) {

  groundState.xp += amount;

  recalculateLevel();

  saveGroundState();

  updateGlobalStats();

}


/* =========================================================
   13. ADD GENES
========================================================= */

function addGenes(amount) {

  groundState.genes += amount;

  saveGroundState();

  updateGlobalStats();

}


/* =========================================================
   14. TOAST
========================================================= */

let groundToastTimer = null;


function showGroundToast(
  title,
  text,
  icon = "🌱"
) {

  const toast =
    getById("groundToast");

  if (!toast) {
    return;
  }


  setText(
    "groundToastTitle",
    title
  );

  setText(
    "groundToastText",
    text
  );

  setText(
    "groundToastIcon",
    icon
  );


  toast.hidden = false;


  clearTimeout(
    groundToastTimer
  );


  groundToastTimer =
    setTimeout(() => {

      toast.hidden = true;

    }, 2600);

}


/* =========================================================
   15. BOTTOM NAVIGATION
========================================================= */

const navItems =
  $$(".nav-item");


function updateBottomNavigation(
  activeScreen
) {

  let activeNav = "";


  if (
    activeScreen === homeScreen
  ) {

    activeNav = "home";

  }


  else if (
    activeScreen === libraryScreen ||
    activeScreen === campbellScreen
  ) {

    activeNav = "library";

  }


  else if (
    activeScreen === profileScreen
  ) {

    activeNav = "profile";

  }


  else if (
    activeScreen === lessonScreen
  ) {

    activeNav = "road";

  }


  navItems.forEach((button) => {

    const nav =
      button.dataset.nav;


    button.classList.toggle(
      "active",
      nav === activeNav
    );

    button.classList.toggle(
      "nav-active",
      nav === activeNav
    );

  });

}


/* =========================================================
   16. NAVIGATION CLICK

   ИСПРАВЛЯЕТ ПРОФИЛЬ
========================================================= */

navItems.forEach((button) => {

  button.addEventListener(
    "click",
    () => {

      const nav =
        button.dataset.nav;


      /* -------------------------
         HOME
      ------------------------- */

      if (nav === "home") {

        changeScreen(
          null,
          homeScreen
        );

        return;

      }


      /* -------------------------
         ROAD
      ------------------------- */

      if (nav === "road") {

        changeScreen(
          null,
          homeScreen
        );


        /*
           После открытия главной
           прокручиваем к дорожке.
        */

        setTimeout(() => {

          const road =
            $(".learning-road");


          if (road) {

            road.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

          }

        }, 170);


        return;

      }


      /* -------------------------
         LIBRARY
      ------------------------- */

      if (nav === "library") {

        if (
          typeof buildLibrary ===
          "function"
        ) {

          buildLibrary();

        }


        changeScreen(
          null,
          libraryScreen
        );

        return;

      }


      /* -------------------------
         PROFILE

         ВОТ ЭТО ИСПРАВЛЯЕТ
         НЕРАБОТАЮЩИЙ ПРОФИЛЬ.
      ------------------------- */

      if (nav === "profile") {

        updateProfile();

        changeScreen(
          null,
          profileScreen
        );

        return;

      }

    }
  );

});


/* =========================================================
   17. PROFILE
========================================================= */

function updateProfile() {

  updateGlobalStats();


  /*
     В будущем сюда добавим:
     - достижения
     - активность
     - серию дней
     - историю уроков
  */

}


/* =========================================================
   18. SETTINGS BUTTON
========================================================= */

const settingsButton =
  getById("settingsButton");


onClick(
  settingsButton,
  () => {

    showGroundToast(
      "Настройки",
      "Настройки профиля добавим позже.",
      "⚙️"
    );

  }
);


/* =========================================================
   19. WELCOME BUTTON
========================================================= */

const startButton =
  getById("startButton");


onClick(
  startButton,
  () => {

    changeScreen(
      welcomeScreen,
      pathScreen
    );

  }
);


/* =========================================================
   20. PATH BACK
========================================================= */

const pathBackButton =
  getById("pathBackButton");


onClick(
  pathBackButton,
  () => {

    changeScreen(
      pathScreen,
      welcomeScreen
    );

  }
);


/* =========================================================
   21. PATH CARDS
========================================================= */

$$(
  ".path-card"
).forEach((card) => {

  card.addEventListener(
    "click",
    () => {

      const path =
        card.dataset.path;


      /*
         SCHOOL
      */

      if (
        path === "school"
      ) {

        changeScreen(
          pathScreen,
          gradeScreen
        );

        return;

      }


      /*
         ENT / OLYMPIAD

         Пока интерфейс подготовлен,
         контент добавим позже.
      */

      if (
        path === "ent"
      ) {

        showGroundToast(
          "ЕНТ",
          "Курс подготовки к ЕНТ скоро появится.",
          "🎯"
        );

        return;

      }


      if (
        path === "olympiad"
      ) {

        showGroundToast(
          "Олимпиада",
          "Олимпиадный курс скоро появится.",
          "🏆"
        );

      }

    }
  );

});


/* =========================================================
   22. GRADE BACK
========================================================= */

const gradeBackButton =
  getById("gradeBackButton");


onClick(
  gradeBackButton,
  () => {

    changeScreen(
      gradeScreen,
      pathScreen
    );

  }
);


/* =========================================================
   23. GRADE CARDS
========================================================= */

$$(
  ".grade-card"
).forEach((card) => {

  card.addEventListener(
    "click",
    () => {

      const grade =
        card.dataset.grade;


      if (!grade) {
        return;
      }


      groundState.grade =
        grade;


      saveGroundState();

      updateGlobalStats();


      if (
        typeof buildRoad ===
        "function"
      ) {

        buildRoad();

      }


      changeScreen(
        gradeScreen,
        homeScreen
      );


      showGroundToast(
        `${grade} класс`,
        "Курс выбран. Начинаем!",
        "🧬"
      );

    }
  );

});


/* =========================================================
   24. CHANGE GRADE
========================================================= */

const changeGradeButton =
  getById("changeGradeButton");


onClick(
  changeGradeButton,
  () => {

    changeScreen(
      homeScreen,
      gradeScreen
    );

  }
);


/* =========================================================
   25. MASCOT INTERACTION
========================================================= */

const groundMascot =
  $(".ground-mascot");


if (groundMascot) {

  groundMascot.addEventListener(
    "click",
    () => {

      groundMascot.classList.remove(
        "pet"
      );


      /*
         Перезапуск анимации сердечек
      */

      void groundMascot.offsetWidth;


      groundMascot.classList.add(
        "pet"
      );


      setTimeout(() => {

        groundMascot.classList.remove(
          "pet"
        );

      }, 1000);

    }
  );

}


/* =========================================================
   26. INITIAL APP UPDATE
========================================================= */

updateGlobalStats();


/* =========================================================
   END PART 1
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 2
   ROAD + LIBRARY + CAMPBELL OPENING
========================================================= */


/* =========================================================
   27. ROAD DATA

   Пока базовая дорожка.
   Позже данные уроков будем брать из database.js.
========================================================= */

const defaultRoadLessons = [

  {
    id: "lesson-1",
    number: 1,
    title: "Основы биологии",
    description: "Первый шаг",
    icon: "🧬"
  },

  {
    id: "lesson-2",
    number: 2,
    title: "Клетка",
    description: "Строение клетки",
    icon: "🔬"
  },

  {
    id: "lesson-3",
    number: 3,
    title: "Химия жизни",
    description: "Молекулы живых систем",
    icon: "⚗️"
  },

  {
    id: "lesson-4",
    number: 4,
    title: "Контрольный уровень",
    description: "Проверь свои знания",
    icon: "🏆",
    boss: true
  }

];


/* =========================================================
   28. GET ROAD CONTAINER
========================================================= */

function getRoadContainer() {

  return (
    getById("learningRoad") ||
    $(".learning-road")
  );

}


/* =========================================================
   29. BUILD ROAD
========================================================= */

function buildRoad() {

  const road =
    getRoadContainer();


  if (!road) {
    return;
  }


  road.innerHTML = "";


  const completed =
    groundState.completedLessons;


  defaultRoadLessons.forEach(
    (lesson, index) => {

      /* -------------------------
         ITEM
      ------------------------- */

      const item =
        document.createElement("div");


      item.className =
        index % 2 === 0
          ? "road-item road-left"
          : "road-item road-right";


      /* -------------------------
         NODE
      ------------------------- */

      const node =
        document.createElement("button");


      node.type = "button";

      node.className =
        "road-node";


      /*
         Состояние уровня:

         completed
         active
         locked
      */

      if (
        index < completed
      ) {

        node.classList.add(
          "completed"
        );

        node.textContent =
          "✓";

      }

      else if (
        index === completed
      ) {

        node.classList.add(
          "active"
        );

        node.textContent =
          lesson.icon;

      }

      else {

        node.classList.add(
          "locked"
        );

        node.textContent =
          "🔒";

      }


      /*
         Boss
      */

      if (lesson.boss) {

        node.classList.add(
          "boss"
        );

      }


      /* -------------------------
         INFO
      ------------------------- */

      const info =
        document.createElement("div");


      info.className =
        "road-info";


      const title =
        document.createElement("strong");


      title.textContent =
        lesson.title;


      const description =
        document.createElement("small");


      if (
        index < completed
      ) {

        description.textContent =
          "Пройдено ✓";

      }

      else if (
        index === completed
      ) {

        description.textContent =
          lesson.description;

      }

      else {

        description.textContent =
          "Сначала пройди предыдущий уровень";

      }


      info.append(
        title,
        description
      );


      /* -------------------------
         CLICK
      ------------------------- */

      node.addEventListener(
        "click",
        () => {

          if (
            index > groundState.completedLessons
          ) {

            showGroundToast(
              "Уровень закрыт",
              "Сначала пройди предыдущий урок.",
              "🔒"
            );

            return;

          }


          /*
             Пока открытие обычного урока
             передадим player.js.

             Если функция существует —
             запускаем её.
          */

          if (
            typeof window.startLesson ===
            "function"
          ) {

            window.startLesson(
              lesson.id
            );

            return;

          }


          showGroundToast(
            lesson.title,
            "Урок подключим через player.js.",
            "📚"
          );

        }
      );


      item.append(
        node,
        info
      );


      road.appendChild(
        item
      );


      /* -------------------------
         CONNECTOR
      ------------------------- */

      if (
        index <
        defaultRoadLessons.length - 1
      ) {

        const connector =
          document.createElement("div");


        connector.className =
          "auto-road-connector";


        connector.textContent =
          "•••";


        road.appendChild(
          connector
        );

      }

    }
  );

}


/* =========================================================
   30. LIBRARY DATA
========================================================= */

const defaultLibraryLessons = [

  {
    id: "school-cell",
    icon: "🔬",
    title: "Клетка",
    description:
      "Строение и основные функции клетки"
  },

  {
    id: "school-dna",
    icon: "🧬",
    title: "ДНК и наследственность",
    description:
      "Основы генетической информации"
  },

  {
    id: "school-metabolism",
    icon: "⚡",
    title: "Обмен веществ",
    description:
      "Энергия и процессы в организме"
  }

];


/* =========================================================
   31. FIND LIBRARY LIST
========================================================= */

function getLibraryList() {

  return (
    getById("libraryList") ||
    $(".library-list")
  );

}


/* =========================================================
   32. BUILD LIBRARY
========================================================= */

function buildLibrary() {

  /*
     Сначала обновляем класс.
  */

  setText(
    "libraryGrade",
    `${groundState.grade} класс`
  );


  const list =
    getLibraryList();


  if (!list) {

    /*
       Если список уроков в HTML
       называется иначе — приложение
       всё равно продолжит работать.
    */

    return;

  }


  list.innerHTML = "";


  defaultLibraryLessons.forEach(
    (lesson) => {

      const button =
        document.createElement("button");


      button.type =
        "button";


      button.className =
        "library-lesson-card";


      /* -------------------------
         ICON
      ------------------------- */

      const icon =
        document.createElement("div");


      icon.className =
        "library-lesson-icon";


      icon.textContent =
        lesson.icon;


      /* -------------------------
         INFO
      ------------------------- */

      const info =
        document.createElement("div");


      info.className =
        "library-lesson-info";


      const title =
        document.createElement("strong");


      title.textContent =
        lesson.title;


      const description =
        document.createElement("p");


      description.textContent =
        lesson.description;


      info.append(
        title,
        description
      );


      /* -------------------------
         ARROW
      ------------------------- */

      const arrow =
        document.createElement("span");


      arrow.textContent =
        "→";


      arrow.style.color =
        "var(--green)";


      arrow.style.fontWeight =
        "900";


      /* -------------------------
         CLICK
      ------------------------- */

      button.addEventListener(
        "click",
        () => {

          if (
            typeof window.startLesson ===
            "function"
          ) {

            window.startLesson(
              lesson.id
            );

            return;

          }


          showGroundToast(
            lesson.title,
            "Этот урок подключим через database.js.",
            lesson.icon
          );

        }
      );


      button.append(
        icon,
        info,
        arrow
      );


      list.appendChild(
        button
      );

    }
  );


  /*
     После построения библиотеки
     применяем поиск.
  */

  applyLibrarySearch();

}


/* =========================================================
   33. LIBRARY SEARCH
========================================================= */

const librarySearchInput =
  getById("librarySearchInput");


function applyLibrarySearch() {

  if (!librarySearchInput) {
    return;
  }


  const query =
    librarySearchInput.value
      .trim()
      .toLowerCase();


  $$(
    ".library-lesson-card"
  ).forEach((card) => {

    const text =
      card.textContent
        .toLowerCase();


    card.hidden =
      query.length > 0 &&
      !text.includes(query);

  });

}


if (librarySearchInput) {

  librarySearchInput.addEventListener(
    "input",
    applyLibrarySearch
  );

}


/* =========================================================
   34. CAMPBELL LIBRARY CARD
========================================================= */

const campbellLibraryCard =
  getById("campbellLibraryCard") ||
  $(".campbell-library-card");


onClick(
  campbellLibraryCard,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      libraryScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   35. CAMPBELL BACK
========================================================= */

const campbellBackButton =
  getById("campbellBackButton");


onClick(
  campbellBackButton,
  () => {

    buildLibrary();


    changeScreen(
      campbellScreen,
      libraryScreen
    );

  }
);


/* =========================================================
   36. CAMPBELL THEORY BACK
========================================================= */

const campbellTheoryBackButton =
  getById(
    "campbellTheoryBackButton"
  );


onClick(
  campbellTheoryBackButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellTheoryScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   37. CAMPBELL EXAM BACK
========================================================= */

const campbellExamBackButton =
  getById(
    "campbellExamBackButton"
  );


onClick(
  campbellExamBackButton,
  () => {

    /*
       Сам таймер экзамена
       остановим в части экзамена.
    */

    if (
      typeof stopCampbellExamTimer ===
      "function"
    ) {

      stopCampbellExamTimer();

    }


    updateCampbellChapterScreen();


    changeScreen(
      campbellExamScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   38. CAMPBELL REVIEW BACK
========================================================= */

const campbellReviewBackButton =
  getById(
    "campbellReviewBackButton"
  );


onClick(
  campbellReviewBackButton,
  () => {

    changeScreen(
      campbellReviewScreen,
      campbellResultScreen
    );

  }
);


/* =========================================================
   39. CAMPBELL STATE
========================================================= */

const campbellState = {

  startPage:
    47,

  endPage:
    66,

  currentPage:
    getNumber(
      "campbellChapter2CurrentPage",
      47
    ),

  theoryCompleted:
    localStorage.getItem(
      "campbellChapter2TheoryCompleted"
    ) === "true"

};


/* =========================================================
   40. FIX CAMPBELL PAGE RANGE
========================================================= */

if (
  campbellState.currentPage <
  campbellState.startPage
) {

  campbellState.currentPage =
    campbellState.startPage;

}


if (
  campbellState.currentPage >
  campbellState.endPage
) {

  campbellState.currentPage =
    campbellState.endPage;

}


/* =========================================================
   41. CAMPBELL READING PERCENT
========================================================= */

function getCampbellReadingPercent() {

  if (
    campbellState.theoryCompleted
  ) {

    return 100;

  }


  const total =
    campbellState.endPage -
    campbellState.startPage +
    1;


  const read =
    campbellState.currentPage -
    campbellState.startPage +
    1;


  return Math.round(
    (read / total) * 100
  );

}


/* =========================================================
   42. UPDATE CAMPBELL CHAPTER SCREEN
========================================================= */

function updateCampbellChapterScreen() {

  const readingPercent =
    getCampbellReadingPercent();


  setText(
    "campbellReadingPercent",
    `${readingPercent}%`
  );


  setProgress(
    "campbellReadingProgress",
    readingPercent
  );


  /*
     Общий прогресс главы:

     Теория = первые 50%.
     Экзамен позже даст вторые 50%.
  */

  let chapterProgress =
    Math.round(
      readingPercent * 0.5
    );


  const examCompleted =
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true";


  if (examCompleted) {

    chapterProgress =
      100;

  }


  setText(
    "campbellProgressText",
    `${chapterProgress}%`
  );


  setProgress(
    "campbellProgressBar",
    chapterProgress
  );


  /*
     ЭКЗАМЕН
  */

  const examButton =
    getById(
      "campbellExamButton"
    );


  const examStatus =
    getById(
      "campbellExamStatus"
    );


  if (
    campbellState.theoryCompleted
  ) {

    if (examButton) {

      examButton.classList.remove(
        "locked"
      );

    }


    if (examStatus) {

      examStatus.textContent =
        examCompleted
          ? "✓ Экзамен пройден"
          : "Экзамен разблокирован";

    }

  }

  else {

    if (examButton) {

      examButton.classList.add(
        "locked"
      );

    }


    if (examStatus) {

      examStatus.textContent =
        "🔒 Сначала изучи материал главы";

    }

  }

}


/* =========================================================
   43. CAMPBELL THEORY BUTTON
========================================================= */

const campbellTheoryButton =
  getById(
    "campbellTheoryButton"
  );


onClick(
  campbellTheoryButton,
  () => {

    /*
       В части 3 функция покажет
       реальную страницу 47–66.
    */

    if (
      typeof renderCampbellPage ===
      "function"
    ) {

      renderCampbellPage();

    }


    changeScreen(
      campbellScreen,
      campbellTheoryScreen
    );

  }
);


/* =========================================================
   44. CAMPBELL EXAM BUTTON
========================================================= */

const campbellExamButton =
  getById(
    "campbellExamButton"
  );


onClick(
  campbellExamButton,
  () => {

    if (
      !campbellState.theoryCompleted
    ) {

      showGroundToast(
        "Экзамен закрыт",
        "Сначала дочитай материал главы 2.",
        "🔒"
      );

      return;

    }


    /*
       Реальный экзамен подключим
       в следующей части.
    */

    if (
      typeof startCampbellExam ===
      "function"
    ) {

      startCampbellExam();

      return;

    }


    showGroundToast(
      "Экзамен",
      "Экзамен сейчас подключаем.",
      "📝"
    );

  }
);


/* =========================================================
   45. THEORY COMPLETE → EXAM
========================================================= */

const campbellTheoryCompleteButton =
  getById(
    "campbellTheoryCompleteButton"
  );


onClick(
  campbellTheoryCompleteButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellTheoryCompleteScreen,
      campbellScreen
    );


    showGroundToast(
      "Экзамен открыт",
      "Теперь можно проверить знания по главе 2.",
      "🔓"
    );

  }
);


/* =========================================================
   46. INITIAL BUILD
========================================================= */

buildRoad();

buildLibrary();

updateCampbellChapterScreen();


/* =========================================================
   END PART 2
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 3
   CAMPBELL READER — PAGES 47–66
========================================================= */


/* =========================================================
   47. CAMPBELL ELEMENTS
========================================================= */

const campbellReaderImage =
  getById("campbellReaderImage");

const campbellReaderLoading =
  getById("campbellReaderLoading");

const campbellReaderError =
  getById("campbellReaderError");

const campbellPrevButton =
  getById("campbellPrevButton");

const campbellNextButton =
  getById("campbellNextButton");

const completeCampbellTheoryButton =
  getById("completeCampbellTheoryButton");


/* =========================================================
   48. IMAGE PATH
========================================================= */

function getCampbellPagePath(page) {

  return (
    `images/campbell/chapter2/page-${page}.webp`
  );

}


/* =========================================================
   49. SAVE CURRENT PAGE
========================================================= */

function saveCampbellPage() {

  localStorage.setItem(
    "campbellChapter2CurrentPage",
    String(campbellState.currentPage)
  );

}


/* =========================================================
   50. READER PROGRESS
========================================================= */

function getCampbellReaderPercent() {

  const total =
    campbellState.endPage -
    campbellState.startPage +
    1;


  const current =
    campbellState.currentPage -
    campbellState.startPage +
    1;


  return Math.round(
    (current / total) * 100
  );

}


/* =========================================================
   51. UPDATE READER INFO
========================================================= */

function updateCampbellReaderInfo() {

  const page =
    campbellState.currentPage;

  const percent =
    getCampbellReaderPercent();


  /*
     PAGE TEXT
  */

  setText(
    "campbellReaderPageNumber",
    `Страница ${page} из ${campbellState.endPage}`
  );


  setText(
    "campbellReaderPageTop",
    String(page)
  );


  /*
     PROGRESS
  */

  setProgress(
    "campbellReaderProgressFill",
    percent
  );


  /*
     Иногда HTML может использовать
     другой ID — поддерживаем и его.
  */

  setProgress(
    "campbellReaderProgress",
    percent
  );


  /*
     PREVIOUS
  */

  if (campbellPrevButton) {

    campbellPrevButton.disabled =
      page <= campbellState.startPage;

  }


  /*
     NEXT
  */

  if (campbellNextButton) {

    campbellNextButton.disabled =
      page >= campbellState.endPage;

  }


  /*
     КНОПКА ЗАВЕРШЕНИЯ

     Показываем только на странице 66.
  */

  if (completeCampbellTheoryButton) {

    completeCampbellTheoryButton.hidden =
      page !== campbellState.endPage;

  }

}


/* =========================================================
   52. LOADING STATE
========================================================= */

function showCampbellLoading() {

  if (campbellReaderLoading) {

    campbellReaderLoading.hidden =
      false;

  }


  if (campbellReaderError) {

    campbellReaderError.hidden =
      true;

  }

}


/* =========================================================
   53. HIDE LOADING
========================================================= */

function hideCampbellLoading() {

  if (campbellReaderLoading) {

    campbellReaderLoading.hidden =
      true;

  }

}


/* =========================================================
   54. ERROR STATE
========================================================= */

function showCampbellImageError(page) {

  hideCampbellLoading();


  if (campbellReaderImage) {

    campbellReaderImage.hidden =
      true;

  }


  if (campbellReaderError) {

    campbellReaderError.hidden =
      false;


    const errorText =
      campbellReaderError.querySelector(
        "p"
      );


    if (errorText) {

      errorText.textContent =
        `Не удалось загрузить page-${page}.webp. Проверь папку images/campbell/chapter2/.`;

    }

  }


  console.error(
    `GROUND: Campbell page ${page} not found.`
  );

}


/* =========================================================
   55. PAGE ANIMATION
========================================================= */

function animateCampbellPage() {

  if (!campbellReaderImage) {
    return;
  }


  campbellReaderImage.classList.remove(
    "page-enter"
  );


  /*
     Перезапуск CSS-анимации.
  */

  void campbellReaderImage.offsetWidth;


  campbellReaderImage.classList.add(
    "page-enter"
  );

}


/* =========================================================
   56. RENDER CAMPBELL PAGE
========================================================= */

function renderCampbellPage() {

  if (!campbellReaderImage) {

    console.error(
      "GROUND: #campbellReaderImage не найден."
    );

    return;
  }


  /*
     Защита диапазона 47–66.
  */

  campbellState.currentPage =
    Math.max(
      campbellState.startPage,
      Math.min(
        campbellState.endPage,
        campbellState.currentPage
      )
    );


  const page =
    campbellState.currentPage;


  const src =
    getCampbellPagePath(page);


  /*
     Обновляем интерфейс сразу.
  */

  updateCampbellReaderInfo();

  showCampbellLoading();


  campbellReaderImage.hidden =
    true;


  if (campbellReaderError) {

    campbellReaderError.hidden =
      true;

  }


  /*
     Создаём временное изображение.

     Так старая страница не мигает,
     пока новая ещё загружается.
  */

  const preloadImage =
    new Image();


  preloadImage.decoding =
    "async";


  preloadImage.alt =
    `Campbell Biology — страница ${page}`;


  /*
     SUCCESS
  */

  preloadImage.addEventListener(
    "load",
    () => {

      /*
         Если пользователь очень быстро
         перелистнул дальше, не показываем
         уже устаревшую картинку.
      */

      if (
        page !==
        campbellState.currentPage
      ) {

        return;

      }


      campbellReaderImage.src =
        src;


      campbellReaderImage.alt =
        `Campbell Biology — страница ${page}`;


      campbellReaderImage.hidden =
        false;


      hideCampbellLoading();


      animateCampbellPage();


      saveCampbellPage();


      updateCampbellChapterScreen();

    },
    {
      once: true
    }
  );


  /*
     ERROR
  */

  preloadImage.addEventListener(
    "error",
    () => {

      if (
        page !==
        campbellState.currentPage
      ) {

        return;

      }


      showCampbellImageError(
        page
      );

    },
    {
      once: true
    }
  );


  /*
     Начинаем загрузку.
  */

  preloadImage.src =
    src;

}


/* =========================================================
   57. PRELOAD NEIGHBOUR PAGE

   Подгружаем следующую страницу заранее,
   чтобы листалось быстрее.
========================================================= */

function preloadCampbellPage(page) {

  if (
    page <
      campbellState.startPage ||
    page >
      campbellState.endPage
  ) {

    return;

  }


  const image =
    new Image();


  image.decoding =
    "async";


  image.src =
    getCampbellPagePath(page);

}


/* =========================================================
   58. NEXT PAGE
========================================================= */

function nextCampbellPage() {

  if (
    campbellState.currentPage >=
    campbellState.endPage
  ) {

    return;

  }


  campbellState.currentPage +=
    1;


  saveCampbellPage();

  renderCampbellPage();


  /*
     Следующую после неё
     грузим заранее.
  */

  preloadCampbellPage(
    campbellState.currentPage + 1
  );

}


/* =========================================================
   59. PREVIOUS PAGE
========================================================= */

function previousCampbellPage() {

  if (
    campbellState.currentPage <=
    campbellState.startPage
  ) {

    return;

  }


  campbellState.currentPage -=
    1;


  saveCampbellPage();

  renderCampbellPage();


  preloadCampbellPage(
    campbellState.currentPage - 1
  );

}


/* =========================================================
   60. BUTTON EVENTS
========================================================= */

onClick(
  campbellNextButton,
  nextCampbellPage
);


onClick(
  campbellPrevButton,
  previousCampbellPage
);


/* =========================================================
   61. COMPLETE THEORY
========================================================= */

onClick(
  completeCampbellTheoryButton,
  () => {

    /*
       Нельзя завершить раньше
       последней страницы.
    */

    if (
      campbellState.currentPage !==
      campbellState.endPage
    ) {

      showGroundToast(
        "Ещё не всё",
        "Сначала дойди до последней страницы главы.",
        "📖"
      );

      return;

    }


    /*
       Если уже проходили раньше —
       повторно награду не выдаём.
    */

    const alreadyCompleted =
      localStorage.getItem(
        "campbellChapter2TheoryCompleted"
      ) === "true";


    campbellState.theoryCompleted =
      true;


    localStorage.setItem(
      "campbellChapter2TheoryCompleted",
      "true"
    );


    /*
       Награда только первый раз.
    */

    if (!alreadyCompleted) {

      addXP(50);

      addGenes(10);

    }


    updateCampbellChapterScreen();


    /*
       Награда на экране завершения.
    */

    setText(
      "campbellTheoryRewardXP",
      alreadyCompleted
        ? "+0 XP"
        : "+50 XP"
    );


    setText(
      "campbellTheoryRewardGenes",
      alreadyCompleted
        ? "+0"
        : "+10"
    );


    /*
       Если специальных Campbell ID
       нет — используем общие.
    */

    setText(
      "lessonRewardXP",
      alreadyCompleted
        ? "+0 XP"
        : "+50 XP"
    );


    setText(
      "lessonRewardGenes",
      alreadyCompleted
        ? "+0"
        : "+10"
    );


    changeScreen(
      campbellTheoryScreen,
      campbellTheoryCompleteScreen
    );


    showGroundToast(
      "Теория завершена",
      "Экзамен по главе 2 разблокирован!",
      "🎉"
    );

  }
);


/* =========================================================
   62. KEYBOARD CONTROL

   На ноутбуке можно листать:
   ← предыдущая
   → следующая
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

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
      "ArrowRight"
    ) {

      nextCampbellPage();

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      previousCampbellPage();

    }

  }
);


/* =========================================================
   63. TOUCH SWIPE

   На телефоне:
   свайп влево  → следующая
   свайп вправо → предыдущая
========================================================= */

let campbellTouchStartX =
  null;


if (campbellTheoryScreen) {

  campbellTheoryScreen.addEventListener(
    "touchstart",
    (event) => {

      if (
        !event.touches.length
      ) {

        return;

      }


      campbellTouchStartX =
        event.touches[0].clientX;

    },
    {
      passive: true
    }
  );


  campbellTheoryScreen.addEventListener(
    "touchend",
    (event) => {

      if (
        campbellTouchStartX ===
        null
      ) {

        return;

      }


      if (
        !event.changedTouches.length
      ) {

        campbellTouchStartX =
          null;

        return;

      }


      const endX =
        event.changedTouches[0]
          .clientX;


      const difference =
        endX -
        campbellTouchStartX;


      /*
         Минимум 60px,
         чтобы случайное касание
         не листало страницу.
      */

      if (
        Math.abs(difference) >=
        60
      ) {

        if (
          difference < 0
        ) {

          nextCampbellPage();

        }

        else {

          previousCampbellPage();

        }

      }


      campbellTouchStartX =
        null;

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   64. INITIAL READER UPDATE
========================================================= */

updateCampbellReaderInfo();


/* =========================================================
   END PART 3
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 4
   CAMPBELL EXAM
========================================================= */


/* =========================================================
   65. EXAM QUESTIONS

   ВАЖНО:
   Сейчас это тестовый набор для проверки механики.
   Позже просто заменим вопросы на ваши настоящие.
========================================================= */

const campbellExamQuestions = [

  {
    question:
      "Какой элемент является основой органических молекул?",

    answers: [
      "Кислород",
      "Углерод",
      "Натрий",
      "Кальций"
    ],

    correct: 1,

    explanation:
      "Углерод способен образовывать четыре ковалентные связи и служит основой огромного количества органических молекул."
  },


  {
    question:
      "Какая частица атома имеет отрицательный заряд?",

    answers: [
      "Протон",
      "Нейтрон",
      "Электрон",
      "Ядро"
    ],

    correct: 2,

    explanation:
      "Электрон имеет отрицательный электрический заряд."
  },


  {
    question:
      "Где находятся протоны и нейтроны?",

    answers: [
      "В ядре атома",
      "В электронной оболочке",
      "Между атомами",
      "Только в молекулах"
    ],

    correct: 0,

    explanation:
      "Протоны и нейтроны находятся в ядре атома."
  },


  {
    question:
      "Что определяет атомный номер элемента?",

    answers: [
      "Количество нейтронов",
      "Количество молекул",
      "Количество протонов",
      "Количество связей"
    ],

    correct: 2,

    explanation:
      "Атомный номер элемента соответствует количеству протонов в ядре."
  },


  {
    question:
      "Что такое изотопы?",

    answers: [
      "Атомы разных элементов с одинаковой массой",

      "Атомы одного элемента с разным количеством нейтронов",

      "Молекулы с одинаковым числом атомов",

      "Ионы с одинаковым зарядом"
    ],

    correct: 1,

    explanation:
      "Изотопы одного элемента имеют одинаковое число протонов, но различаются числом нейтронов."
  },


  {
    question:
      "Какая связь образуется при совместном использовании электронных пар?",

    answers: [
      "Ковалентная",
      "Ионная",
      "Водородная",
      "Механическая"
    ],

    correct: 0,

    explanation:
      "При ковалентной связи атомы совместно используют одну или несколько пар валентных электронов."
  },


  {
    question:
      "Что происходит при образовании ионной связи?",

    answers: [
      "Атомы обязательно становятся изотопами",

      "Электроны передаются между атомами, образуя противоположно заряженные ионы",

      "Протоны переходят между ядрами",

      "Нейтроны образуют общую пару"
    ],

    correct: 1,

    explanation:
      "Передача электронов может создать катион и анион, которые притягиваются благодаря противоположным зарядам."
  },


  {
    question:
      "Что называют химической реакцией?",

    answers: [
      "Изменение только температуры вещества",

      "Процесс образования и разрушения химических связей с преобразованием веществ",

      "Движение электронов вокруг ядра",

      "Изменение количества протонов элемента"
    ],

    correct: 1,

    explanation:
      "Во время химической реакции исходные вещества преобразуются в продукты за счёт изменения химических связей."
  }

];


/* =========================================================
   66. EXAM STATE
========================================================= */

const campbellExamState = {

  currentQuestion: 0,

  selectedAnswer: null,

  answers: [],

  correctAnswers: 0,

  secondsLeft: 600,

  timer: null,

  finished: false

};


/* =========================================================
   67. EXAM ELEMENTS
========================================================= */

const campbellExamQuestion =
  getById("campbellExamQuestion");

const campbellExamAnswers =
  getById("campbellExamAnswers");

const campbellExamNextButton =
  getById("campbellExamNextButton");

const campbellExamTimer =
  getById("campbellExamTimer");


/* =========================================================
   68. START EXAM
========================================================= */

function startCampbellExam() {

  if (
    !campbellState.theoryCompleted
  ) {

    showGroundToast(
      "Экзамен закрыт",
      "Сначала заверши теорию.",
      "🔒"
    );

    return;

  }


  stopCampbellExamTimer();


  campbellExamState.currentQuestion =
    0;

  campbellExamState.selectedAnswer =
    null;

  campbellExamState.answers =
    [];

  campbellExamState.correctAnswers =
    0;

  campbellExamState.secondsLeft =
    600;

  campbellExamState.finished =
    false;


  changeScreen(
    campbellScreen,
    campbellExamScreen
  );


  renderCampbellExamQuestion();

  updateCampbellExamTimer();

  startCampbellExamTimer();

}


/* =========================================================
   69. RENDER QUESTION
========================================================= */

function renderCampbellExamQuestion() {

  const index =
    campbellExamState.currentQuestion;


  const question =
    campbellExamQuestions[index];


  if (!question) {

    finishCampbellExam();

    return;

  }


  campbellExamState.selectedAnswer =
    null;


  /* QUESTION COUNTER */

  setText(
    "campbellExamQuestionCounter",
    `Вопрос ${index + 1} из ${campbellExamQuestions.length}`
  );


  /* PROGRESS */

  const progress =
    (
      index /
      campbellExamQuestions.length
    ) * 100;


  setProgress(
    "campbellExamProgressBar",
    progress
  );


  /* QUESTION */

  if (campbellExamQuestion) {

    campbellExamQuestion.textContent =
      question.question;

  }


  /* HINT */

  setText(
    "campbellExamQuestionHint",
    "Выбери один правильный ответ."
  );


  /* ANSWERS */

  if (!campbellExamAnswers) {
    return;
  }


  campbellExamAnswers.innerHTML =
    "";


  const letters =
    ["A", "B", "C", "D", "E", "F"];


  question.answers.forEach(
    (answer, answerIndex) => {

      const button =
        document.createElement("button");


      button.type =
        "button";


      button.className =
        "answer-option";


      const letter =
        document.createElement("span");


      letter.className =
        "answer-letter";


      letter.textContent =
        letters[answerIndex] || "?";


      const text =
        document.createElement("span");


      text.className =
        "answer-text";


      text.textContent =
        answer;


      button.append(
        letter,
        text
      );


      button.addEventListener(
        "click",
        () => {

          selectCampbellAnswer(
            answerIndex,
            button
          );

        }
      );


      campbellExamAnswers.appendChild(
        button
      );

    }
  );


  /* NEXT BUTTON */

  if (campbellExamNextButton) {

    campbellExamNextButton.disabled =
      true;


    campbellExamNextButton.textContent =
      index ===
      campbellExamQuestions.length - 1
        ? "Завершить экзамен"
        : "Продолжить";

  }

}


/* =========================================================
   70. SELECT ANSWER
========================================================= */

function selectCampbellAnswer(
  answerIndex,
  button
) {

  if (
    campbellExamState.selectedAnswer !==
    null
  ) {

    return;

  }


  const question =
    campbellExamQuestions[
      campbellExamState.currentQuestion
    ];


  if (!question) {
    return;
  }


  campbellExamState.selectedAnswer =
    answerIndex;


  const isCorrect =
    answerIndex ===
    question.correct;


  /* SAVE ANSWER */

  campbellExamState.answers.push({

    questionIndex:
      campbellExamState.currentQuestion,

    selected:
      answerIndex,

    correct:
      question.correct,

    isCorrect:
      isCorrect

  });


  if (isCorrect) {

    campbellExamState.correctAnswers +=
      1;

  }


  /* LOCK ALL ANSWERS */

  const answerButtons =
    Array.from(
      campbellExamAnswers.querySelectorAll(
        ".answer-option"
      )
    );


  answerButtons.forEach(
    (answerButton, index) => {

      answerButton.disabled =
        true;


      if (
        index ===
        question.correct
      ) {

        answerButton.classList.add(
          "correct"
        );

      }


      if (
        index === answerIndex &&
        !isCorrect
      ) {

        answerButton.classList.add(
          "wrong"
        );

      }

    }
  );


  /* FEEDBACK */

  setText(
    "campbellExamQuestionHint",

    isCorrect
      ? `✓ Правильно. ${question.explanation}`
      : `✕ Неправильно. ${question.explanation}`
  );


  if (campbellExamNextButton) {

    campbellExamNextButton.disabled =
      false;

  }

}


/* =========================================================
   71. NEXT QUESTION
========================================================= */

function nextCampbellExamQuestion() {

  if (
    campbellExamState.selectedAnswer ===
    null
  ) {

    return;

  }


  const lastQuestion =
    campbellExamState.currentQuestion >=
    campbellExamQuestions.length - 1;


  if (lastQuestion) {

    finishCampbellExam();

    return;

  }


  campbellExamState.currentQuestion +=
    1;


  renderCampbellExamQuestion();

}


/* =========================================================
   72. NEXT BUTTON
========================================================= */

onClick(
  campbellExamNextButton,
  nextCampbellExamQuestion
);


/* =========================================================
   73. TIMER
========================================================= */

function startCampbellExamTimer() {

  stopCampbellExamTimer();


  campbellExamState.timer =
    setInterval(
      () => {

        campbellExamState.secondsLeft -=
          1;


        updateCampbellExamTimer();


        if (
          campbellExamState.secondsLeft <=
          0
        ) {

          finishCampbellExam();

        }

      },
      1000
    );

}


/* =========================================================
   74. STOP TIMER
========================================================= */

function stopCampbellExamTimer() {

  if (
    campbellExamState.timer
  ) {

    clearInterval(
      campbellExamState.timer
    );


    campbellExamState.timer =
      null;

  }

}


/* =========================================================
   75. UPDATE TIMER
========================================================= */

function updateCampbellExamTimer() {

  if (!campbellExamTimer) {
    return;
  }


  const seconds =
    Math.max(
      0,
      campbellExamState.secondsLeft
    );


  const minutes =
    Math.floor(
      seconds / 60
    );


  const remainingSeconds =
    seconds % 60;


  campbellExamTimer.textContent =
    `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;


  campbellExamTimer.classList.remove(
    "warning",
    "danger"
  );


  if (
    seconds <= 60
  ) {

    campbellExamTimer.classList.add(
      "danger"
    );

  }

  else if (
    seconds <= 180
  ) {

    campbellExamTimer.classList.add(
      "warning"
    );

  }

}


/* =========================================================
   76. FINISH EXAM
========================================================= */

function finishCampbellExam() {

  if (
    campbellExamState.finished
  ) {

    return;

  }


  campbellExamState.finished =
    true;


  stopCampbellExamTimer();


  const total =
    campbellExamQuestions.length;


  const correct =
    campbellExamState.correctAnswers;


  const wrong =
    total - correct;


  const percent =
    Math.round(
      (correct / total) * 100
    );


  /*
     PASS = 70%
  */

  const passed =
    percent >= 70;


  /*
     Был ли экзамен уже успешно
     пройден раньше?
  */

  const previouslyCompleted =
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true";


  /*
     Если прошёл сейчас —
     сохраняем.
  */

  if (passed) {

    localStorage.setItem(
      "campbellChapter2ExamCompleted",
      "true"
    );

  }


  /*
     Награда выдаётся только
     за ПЕРВОЕ успешное прохождение.
  */

  let rewardXP =
    0;


  let rewardGenes =
    0;


  if (
    passed &&
    !previouslyCompleted
  ) {

    rewardXP =
      100;


    rewardGenes =
      20;


    addXP(
      rewardXP
    );


    addGenes(
      rewardGenes
    );

  }


  /*
     SAVE RESULT
  */

  localStorage.setItem(
    "campbellChapter2LastScore",
    String(percent)
  );


  localStorage.setItem(
    "campbellChapter2CorrectAnswers",
    String(correct)
  );


  /*
     UPDATE RESULT SCREEN
  */

  renderCampbellResult({

    total,
    correct,
    wrong,
    percent,
    passed,
    rewardXP,
    rewardGenes

  });


  updateCampbellChapterScreen();


  changeScreen(
    campbellExamScreen,
    campbellResultScreen
  );

}


/* =========================================================
   77. RENDER RESULT
========================================================= */

function renderCampbellResult(
  result
) {

  /* ICON */

  setText(
    "campbellResultIcon",

    result.passed
      ? "🏆"
      : "📚"
  );


  /* TITLE */

  setText(
    "campbellResultTitle",

    result.passed
      ? "Экзамен пройден!"
      : "Попробуй ещё раз"
  );


  /* MESSAGE */

  setText(
    "campbellResultMessage",

    result.passed
      ? "Отличная работа! Глава 2 завершена."
      : "Для прохождения нужно набрать минимум 70%. Повтори материал и попробуй снова."
  );


  /* PERCENT */

  setText(
    "campbellResultPercent",
    `${result.percent}%`
  );


  /*
     Если процент находится
     внутри отдельного элемента.
  */

  const percentElement =
    $(".campbell-result-percent");


  if (
    percentElement &&
    !getById("campbellResultPercent")
  ) {

    percentElement.textContent =
      `${result.percent}%`;

  }


  /* PROGRESS */

  setProgress(
    "campbellResultProgress",
    result.percent
  );


  /* STATS */

  setText(
    "campbellResultCorrect",
    result.correct
  );


  setText(
    "campbellResultWrong",
    result.wrong
  );


  setText(
    "campbellResultTotal",
    result.total
  );


  /* REWARD */

  let rewardText;


  if (
    result.rewardXP > 0 ||
    result.rewardGenes > 0
  ) {

    rewardText =
      `+${result.rewardXP} XP • +${result.rewardGenes} 🧬`;

  }

  else if (
    result.passed
  ) {

    rewardText =
      "Экзамен уже был пройден ✓";

  }

  else {

    rewardText =
      "Пройди экзамен, чтобы получить награду";

  }


  setText(
    "campbellRewardText",
    rewardText
  );

}


/* =========================================================
   78. RESULT BUTTONS
========================================================= */

const campbellContinueButton =
  getById(
    "campbellContinueButton"
  );


const campbellRetryButton =
  getById(
    "campbellRetryButton"
  );


const campbellReviewButton =
  getById(
    "campbellReviewButton"
  );


/* =========================================================
   79. CONTINUE
========================================================= */

onClick(
  campbellContinueButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellResultScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   80. RETRY
========================================================= */

onClick(
  campbellRetryButton,
  () => {

    startCampbellExam();

  }
);


/* =========================================================
   81. REVIEW
========================================================= */

onClick(
  campbellReviewButton,
  () => {

    renderCampbellReview();


    changeScreen(
      campbellResultScreen,
      campbellReviewScreen
    );

  }
);


/* =========================================================
   82. RENDER REVIEW
========================================================= */

function renderCampbellReview() {

  const container =
    getById(
      "campbellReviewQuestions"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const total =
    campbellExamQuestions.length;


  const correct =
    campbellExamState.correctAnswers;


  const percent =
    Math.round(
      (correct / total) * 100
    );


  setText(
    "campbellReviewScore",
    `${correct}/${total}`
  );


  setProgress(
    "campbellReviewProgress",
    percent
  );


  campbellExamState.answers.forEach(
    (answerData, reviewIndex) => {

      const question =
        campbellExamQuestions[
          answerData.questionIndex
        ];


      if (!question) {
        return;
      }


      const block =
        document.createElement(
          "article"
        );


      block.className =
        "campbell-theory-block";


      /* NUMBER */

      const label =
        document.createElement(
          "span"
        );


      label.className =
        "small-label";


      label.textContent =
        `ВОПРОС ${reviewIndex + 1}`;


      /* QUESTION */

      const title =
        document.createElement(
          "h2"
        );


      title.textContent =
        question.question;


      /* USER ANSWER */

      const userAnswer =
        document.createElement(
          "div"
        );


      userAnswer.className =
        answerData.isCorrect
          ? "campbell-review-answer correct"
          : "campbell-review-answer wrong";


      const userLabel =
        document.createElement(
          "strong"
        );


      userLabel.textContent =
        answerData.isCorrect
          ? "ТВОЙ ОТВЕТ ✓"
          : "ТВОЙ ОТВЕТ ✕";


      const userText =
        document.createElement(
          "p"
        );


      userText.textContent =
        question.answers[
          answerData.selected
        ];


      userAnswer.append(
        userLabel,
        userText
      );


      block.append(
        label,
        title,
        userAnswer
      );


      /* CORRECT ANSWER */

      if (
        !answerData.isCorrect
      ) {

        const correctBox =
          document.createElement(
            "div"
          );


        correctBox.className =
          "campbell-review-correct";


        const correctLabel =
          document.createElement(
            "strong"
          );


        correctLabel.textContent =
          "ПРАВИЛЬНЫЙ ОТВЕТ";


        const correctText =
          document.createElement(
            "p"
          );


        correctText.textContent =
          question.answers[
            question.correct
          ];


        correctBox.append(
          correctLabel,
          correctText
        );


        block.appendChild(
          correctBox
        );

      }


      /* EXPLANATION */

      const note =
        document.createElement(
          "div"
        );


      note.className =
        "campbell-note";


      const noteIcon =
        document.createElement(
          "span"
        );


      noteIcon.textContent =
        "💡";


      const explanation =
        document.createElement(
          "p"
        );


      explanation.textContent =
        question.explanation;


      note.append(
        noteIcon,
        explanation
      );


      block.appendChild(
        note
      );


      container.appendChild(
        block
      );

    }
  );

}


/* =========================================================
   83. REVIEW FINISH
========================================================= */

const campbellReviewFinishButton =
  getById(
    "campbellReviewFinishButton"
  );


onClick(
  campbellReviewFinishButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellReviewScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   84. EXPOSE FUNCTIONS

   Часть 2 уже проверяет наличие
   window.startCampbellExam.
========================================================= */

window.startCampbellExam =
  startCampbellExam;


window.stopCampbellExamTimer =
  stopCampbellExamTimer;


/* =========================================================
   END PART 4
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 5
   PROFILE + ACHIEVEMENTS + ACTIVITY
========================================================= */


/* =========================================================
   85. PROFILE DATA
========================================================= */

const groundAchievements = [

  {
    id: "first-step",
    icon: "🌱",
    title: "Первый шаг",
    description: "Заверши первый урок",

    check() {
      return groundState.completedLessons >= 1;
    }
  },

  {
    id: "gene-hunter",
    icon: "🧬",
    title: "Охотник за генами",
    description: "Собери 25 генов",

    check() {
      return groundState.genes >= 25;
    }
  },

  {
    id: "student",
    icon: "⚡",
    title: "Исследователь",
    description: "Получи 100 XP",

    check() {
      return groundState.xp >= 100;
    }
  },

  {
    id: "campbell-reader",
    icon: "📖",
    title: "Читатель Campbell",
    description: "Заверши теорию главы 2",

    check() {
      return (
        localStorage.getItem(
          "campbellChapter2TheoryCompleted"
        ) === "true"
      );
    }
  },

  {
    id: "campbell-master",
    icon: "🏆",
    title: "Химия жизни",
    description: "Пройди экзамен по главе 2",

    check() {
      return (
        localStorage.getItem(
          "campbellChapter2ExamCompleted"
        ) === "true"
      );
    }
  },

  {
    id: "level-5",
    icon: "⭐",
    title: "Пятый уровень",
    description: "Достигни 5 уровня",

    check() {
      return groundState.level >= 5;
    }
  }

];


/* =========================================================
   86. PROFILE LEVEL PROGRESS
========================================================= */

function getProfileXPData() {

  const xpPerLevel =
    100;


  const xpInLevel =
    groundState.xp % xpPerLevel;


  const percent =
    Math.round(
      (xpInLevel / xpPerLevel) * 100
    );


  return {

    current:
      xpInLevel,

    needed:
      xpPerLevel,

    percent:
      percent

  };

}


/* =========================================================
   87. UPDATE PROFILE

   Переопределяем функцию из PART 1.
   Теперь профиль полноценный.
========================================================= */

function updateProfile() {

  recalculateLevel();

  updateGlobalStats();


  const xpData =
    getProfileXPData();


  /* -------------------------
     LEVEL
  ------------------------- */

  setText(
    "profileLevel",
    groundState.level
  );


  /* -------------------------
     XP
  ------------------------- */

  setText(
    "profileXP",
    groundState.xp
  );


  setText(
    "profileXPText",
    `${xpData.current} / ${xpData.needed} XP`
  );


  setProgress(
    "profileXPProgress",
    xpData.percent
  );


  /* -------------------------
     GENES
  ------------------------- */

  setText(
    "profileGenes",
    groundState.genes
  );


  /* -------------------------
     STREAK
  ------------------------- */

  setText(
    "profileStreak",
    groundState.streak
  );


  /* -------------------------
     COMPLETED
  ------------------------- */

  setText(
    "profileCompletedLessons",
    groundState.completedLessons
  );


  /* -------------------------
     GRADE
  ------------------------- */

  setText(
    "profileGrade",
    `${groundState.grade} класс`
  );


  /* -------------------------
     ACHIEVEMENTS
  ------------------------- */

  renderAchievements();


  /* -------------------------
     ACTIVITY
  ------------------------- */

  renderProfileActivity();

}


/* =========================================================
   88. FIND ACHIEVEMENTS CONTAINER
========================================================= */

function getAchievementsContainer() {

  return (
    getById("achievementsList") ||
    getById("profileAchievements") ||
    $(".achievements-list")
  );

}


/* =========================================================
   89. RENDER ACHIEVEMENTS
========================================================= */

function renderAchievements() {

  const container =
    getAchievementsContainer();


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  let unlockedCount =
    0;


  groundAchievements.forEach(
    (achievement) => {

      const unlocked =
        achievement.check();


      if (unlocked) {

        unlockedCount += 1;

      }


      const card =
        document.createElement("div");


      card.className =
        "achievement-card";


      if (unlocked) {

        card.classList.add(
          "unlocked"
        );

      }


      /* ICON */

      const icon =
        document.createElement("div");


      icon.className =
        "achievement-icon";


      icon.textContent =
        unlocked
          ? achievement.icon
          : "🔒";


      /* INFO */

      const info =
        document.createElement("div");


      info.className =
        "achievement-info";


      const title =
        document.createElement("strong");


      title.textContent =
        achievement.title;


      const description =
        document.createElement("p");


      description.textContent =
        achievement.description;


      info.append(
        title,
        description
      );


      /* STATUS */

      const status =
        document.createElement("span");


      status.className =
        "achievement-status";


      status.textContent =
        unlocked
          ? "✓"
          : "";


      card.append(
        icon,
        info,
        status
      );


      container.appendChild(
        card
      );

    }
  );


  setText(
    "achievementCount",
    `${unlockedCount}/${groundAchievements.length}`
  );

}


/* =========================================================
   90. ACTIVITY STORAGE
========================================================= */

function getActivityData() {

  try {

    const saved =
      localStorage.getItem(
        "groundActivity"
      );


    if (!saved) {

      return {};

    }


    const parsed =
      JSON.parse(saved);


    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {

      return {};

    }


    return parsed;

  }

  catch (error) {

    console.error(
      "GROUND: activity data error",
      error
    );


    return {};

  }

}


/* =========================================================
   91. SAVE ACTIVITY
========================================================= */

function saveActivityData(data) {

  localStorage.setItem(
    "groundActivity",
    JSON.stringify(data)
  );

}


/* =========================================================
   92. LOCAL DATE KEY

   Формат:
   YYYY-MM-DD
========================================================= */

function getLocalDateKey(date = new Date()) {

  const year =
    date.getFullYear();


  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return `${year}-${month}-${day}`;

}


/* =========================================================
   93. REGISTER ACTIVITY

   Вызываем при завершении урока,
   теории или экзамена.
========================================================= */

function registerGroundActivity(
  amount = 1
) {

  const activity =
    getActivityData();


  const today =
    getLocalDateKey();


  activity[today] =
    (
      Number(activity[today]) ||
      0
    ) + amount;


  saveActivityData(
    activity
  );


  updateGroundStreak(
    activity
  );

}


/* =========================================================
   94. STREAK CALCULATION
========================================================= */

function updateGroundStreak(
  activity = getActivityData()
) {

  let streak =
    0;


  const date =
    new Date();


  /*
     Если сегодня активности ещё нет,
     разрешаем серии продолжаться со вчера.
  */

  const todayKey =
    getLocalDateKey(date);


  if (!activity[todayKey]) {

    date.setDate(
      date.getDate() - 1
    );

  }


  while (true) {

    const key =
      getLocalDateKey(date);


    if (!activity[key]) {

      break;

    }


    streak += 1;


    date.setDate(
      date.getDate() - 1
    );

  }


  groundState.streak =
    streak;


  saveGroundState();

  updateGlobalStats();

}


/* =========================================================
   95. PROFILE ACTIVITY
========================================================= */

function renderProfileActivity() {

  const container =
    getById("profileActivity") ||
    $(".profile-activity");


  if (!container) {
    return;
  }


  const activity =
    getActivityData();


  container.innerHTML =
    "";


  const dayNames =
    [
      "Вс",
      "Пн",
      "Вт",
      "Ср",
      "Чт",
      "Пт",
      "Сб"
    ];


  /*
     Последние 7 дней.
  */

  for (
    let offset = 6;
    offset >= 0;
    offset -= 1
  ) {

    const date =
      new Date();


    date.setDate(
      date.getDate() - offset
    );


    const key =
      getLocalDateKey(date);


    const amount =
      Number(
        activity[key]
      ) || 0;


    const day =
      document.createElement("div");


    day.className =
      "activity-day";


    if (amount > 0) {

      day.classList.add(
        "active"
      );

    }


    const circle =
      document.createElement("div");


    circle.className =
      "activity-day-circle";


    circle.textContent =
      amount > 0
        ? "✓"
        : "";


    const name =
      document.createElement("span");


    name.className =
      "activity-day-name";


    name.textContent =
      dayNames[
        date.getDay()
      ];


    day.append(
      circle,
      name
    );


    container.appendChild(
      day
    );

  }


  /* MESSAGE */

  const activeDays =
    Object.values(
      activity
    ).filter(
      (value) =>
        Number(value) > 0
    ).length;


  if (activeDays === 0) {

    setText(
      "activityMessage",
      "Начни обучение — здесь появится твоя активность."
    );

  }

  else if (
    groundState.streak >= 3
  ) {

    setText(
      "activityMessage",
      `🔥 Серия ${groundState.streak} дн. Продолжай!`
    );

  }

  else {

    setText(
      "activityMessage",
      "Хорошее начало. Продолжай заниматься каждый день."
    );

  }

}


/* =========================================================
   96. CAMPBELL ACTIVITY FIX

   Если теория уже завершена,
   сохраняем специальный флаг,
   чтобы не записывать её повторно.
========================================================= */

function registerCampbellTheoryActivity() {

  const key =
    "campbellChapter2ActivityRegistered";


  if (
    localStorage.getItem(key) ===
    "true"
  ) {

    return;

  }


  registerGroundActivity(1);


  localStorage.setItem(
    key,
    "true"
  );

}


/* =========================================================
   97. CAMPBELL EXAM ACTIVITY
========================================================= */

function registerCampbellExamActivity() {

  const key =
    "campbellChapter2ExamActivityRegistered";


  if (
    localStorage.getItem(key) ===
    "true"
  ) {

    return;

  }


  registerGroundActivity(1);


  localStorage.setItem(
    key,
    "true"
  );

}


/* =========================================================
   98. SYNC EXISTING CAMPBELL PROGRESS

   Если пользователь уже завершил Campbell
   до добавления системы профиля.
========================================================= */

function syncCampbellProfileProgress() {

  const theoryCompleted =
    localStorage.getItem(
      "campbellChapter2TheoryCompleted"
    ) === "true";


  const examCompleted =
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true";


  if (theoryCompleted) {

    registerCampbellTheoryActivity();

  }


  if (examCompleted) {

    registerCampbellExamActivity();

  }

}


/* =========================================================
   99. COMPLETED LESSON
========================================================= */

function registerCompletedLesson() {

  groundState.completedLessons +=
    1;


  registerGroundActivity(1);


  saveGroundState();

  updateGlobalStats();

  buildRoad();

}


/* =========================================================
   100. PROFILE AVATAR CLICK
========================================================= */

const profileAvatar =
  getById("profileAvatar") ||
  $(".profile-avatar");


onClick(
  profileAvatar,
  () => {

    profileAvatar.classList.remove(
      "pet"
    );


    void profileAvatar.offsetWidth;


    profileAvatar.classList.add(
      "pet"
    );


    showGroundToast(
      "Ground",
      "Мяу! 🐈‍⬛",
      "🧬"
    );


    setTimeout(
      () => {

        profileAvatar.classList.remove(
          "pet"
        );

      },
      900
    );

  }
);


/* =========================================================
   101. RESET BUTTON

   Пока НЕ удаляет данные автоматически.
   Случайным нажатием прогресс не потеряем.
========================================================= */

const resetProgressButton =
  getById("resetProgressButton");


onClick(
  resetProgressButton,
  () => {

    showGroundToast(
      "Прогресс защищён",
      "Сброс данных пока отключён, чтобы случайно ничего не удалить.",
      "🛡️"
    );

  }
);


/* =========================================================
   102. SYNC PROFILE
========================================================= */

syncCampbellProfileProgress();

updateGroundStreak();

updateProfile();


/* =========================================================
   103. EXPORT

   player.js сможет сообщать app.js,
   что пользователь завершил урок.
========================================================= */

window.GroundApp = {

  addXP:
    addXP,

  addGenes:
    addGenes,

  registerActivity:
    registerGroundActivity,

  completeLesson:
    registerCompletedLesson,

  updateProfile:
    updateProfile,

  showToast:
    showGroundToast,

  changeScreen:
    changeScreen

};


/* =========================================================
   END PART 5
========================================================= */
