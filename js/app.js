/* =========================================================
   GROUND — APP.JS
   PART 1
   CORE + SCREENS + NAVIGATION + PROFILE
========================================================= */

"use strict";


/* =========================================================
   1. HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  Array.from(
    document.querySelectorAll(selector)
  );

function getById(id) {
  return document.getElementById(id);
}


/* =========================================================
   2. SAFE EVENTS

   Если элемента нет в HTML,
   приложение НЕ ломается.
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
   3. SCREENS
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
  getById(
    "campbellTheoryCompleteScreen"
  );

const campbellExamScreen =
  getById("campbellExamScreen");

const campbellResultScreen =
  getById("campbellResultScreen");

const campbellReviewScreen =
  getById("campbellReviewScreen");

const allScreens =
  $$(".screen");


/* =========================================================
   4. SCREEN SWITCHER

   Сохраняем анимацию переходов.
========================================================= */

function changeScreen(
  fromScreen,
  toScreen
) {

  if (!toScreen) {

    console.error(
      "GROUND: экран для перехода не найден."
    );

    return;
  }


  allScreens.forEach(
    (screen) => {

      screen.classList.remove(
        "active"
      );

    }
  );


  /*
     Перезапускаем CSS-анимацию.
  */

  void toScreen.offsetWidth;


  toScreen.classList.add(
    "active"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  updateBottomNavigation(
    toScreen
  );

}


/* =========================================================
   5. LOCAL STORAGE
========================================================= */

function getNumber(
  key,
  fallback = 0
) {

  const value =
    Number(
      localStorage.getItem(key)
    );

  return Number.isFinite(value)
    ? value
    : fallback;

}


function getText(
  key,
  fallback = ""
) {

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
    String(
      groundState.genes
    )
  );

  localStorage.setItem(
    "groundXP",
    String(
      groundState.xp
    )
  );

  localStorage.setItem(
    "groundLevel",
    String(
      groundState.level
    )
  );

  localStorage.setItem(
    "groundStreak",
    String(
      groundState.streak
    )
  );

  localStorage.setItem(
    "groundCompletedLessons",
    String(
      groundState.completedLessons
    )
  );

}


/* =========================================================
   8. SAFE TEXT
========================================================= */

function setText(
  id,
  value
) {

  const element =
    getById(id);

  if (!element) {
    return;
  }

  element.textContent =
    value;

}


/* =========================================================
   9. SAFE PROGRESS
========================================================= */

function setProgress(
  id,
  percent
) {

  const element =
    getById(id);

  if (!element) {
    return;
  }


  const safePercent =
    Math.max(
      0,
      Math.min(
        100,
        percent
      )
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

  $$(".gene-value")
    .forEach(
      (element) => {

        element.textContent =
          groundState.genes;

      }
    );


  setText(
    "homeGenes",
    groundState.genes
  );

  setText(
    "profileGenes",
    groundState.genes
  );


  /*
     УРОВЕНЬ
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
     ПРОЙДЕННЫЕ УРОКИ
  */

  setText(
    "profileCompletedLessons",
    groundState.completedLessons
  );


  /*
     XP
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
   11. LEVEL
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

  groundState.xp +=
    Number(amount) || 0;

  recalculateLevel();

  saveGroundState();

  updateGlobalStats();

}


/* =========================================================
   13. ADD GENES
========================================================= */

function addGenes(amount) {

  groundState.genes +=
    Number(amount) || 0;

  saveGroundState();

  updateGlobalStats();

}


/* =========================================================
   14. TOAST
========================================================= */

let groundToastTimer =
  null;


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


  toast.hidden =
    false;


  clearTimeout(
    groundToastTimer
  );


  groundToastTimer =
    setTimeout(
      () => {

        toast.hidden =
          true;

      },
      2600
    );

}


/* =========================================================
   15. BOTTOM NAVIGATION
========================================================= */

const navItems =
  $$(".nav-item");


function updateBottomNavigation(
  activeScreen
) {

  let activeNav =
    "";


  if (
    activeScreen ===
    homeScreen
  ) {

    activeNav =
      "home";

  }


  else if (
    activeScreen ===
      libraryScreen ||

    activeScreen ===
      campbellScreen ||

    activeScreen ===
      campbellTheoryScreen
  ) {

    activeNav =
      "library";

  }


  else if (
    activeScreen ===
    profileScreen
  ) {

    activeNav =
      "profile";

  }


  else if (
    activeScreen ===
    lessonScreen
  ) {

    activeNav =
      "road";

  }


  navItems.forEach(
    (button) => {

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

    }
  );

}


/* =========================================================
   16. PROFILE
========================================================= */

function updateProfile() {

  updateGlobalStats();

}


/* =========================================================
   17. BOTTOM NAVIGATION CLICKS
========================================================= */

navItems.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const nav =
          button.dataset.nav;


        /* HOME */

        if (
          nav === "home"
        ) {

          changeScreen(
            null,
            homeScreen
          );

          return;
        }


        /* ROAD */

        if (
          nav === "road"
        ) {

          changeScreen(
            null,
            homeScreen
          );


          setTimeout(
            () => {

              const road =
                getById(
                  "learningRoad"
                ) ||
                $(".learning-road");


              if (road) {

                road.scrollIntoView({
                  behavior:
                    "smooth",
                  block:
                    "start"
                });

              }

            },
            170
          );

          return;
        }


        /* LIBRARY */

        if (
          nav === "library"
        ) {

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


        /* PROFILE */

        if (
          nav === "profile"
        ) {

          updateProfile();

          changeScreen(
            null,
            profileScreen
          );

          return;
        }

      }
    );

  }
);


/* =========================================================
   18. SETTINGS
========================================================= */

const settingsButton =
  getById(
    "settingsButton"
  );


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
   19. WELCOME
========================================================= */

const startButton =
  getById(
    "startButton"
  );


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
  getById(
    "pathBackButton"
  );


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

$$(".path-card")
  .forEach(
    (card) => {

      card.addEventListener(
        "click",
        () => {

          const path =
            card.dataset.path;


          /* SCHOOL */

          if (
            path === "school"
          ) {

            changeScreen(
              pathScreen,
              gradeScreen
            );

            return;
          }


          /* ENT */

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


          /* OLYMPIAD */

          if (
            path ===
            "olympiad"
          ) {

            showGroundToast(
              "Олимпиада",
              "Олимпиадный курс скоро появится.",
              "🏆"
            );

          }

        }
      );

    }
  );


/* =========================================================
   22. GRADE BACK
========================================================= */

const gradeBackButton =
  getById(
    "gradeBackButton"
  );


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

$$(".grade-card")
  .forEach(
    (card) => {

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

    }
  );


/* =========================================================
   24. CHANGE GRADE
========================================================= */

const changeGradeButton =
  getById(
    "changeGradeButton"
  );


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
   25. MASCOT
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


      void groundMascot.offsetWidth;


      groundMascot.classList.add(
        "pet"
      );


      setTimeout(
        () => {

          groundMascot.classList.remove(
            "pet"
          );

        },
        1000
      );

    }
  );

}


/* =========================================================
   26. INITIAL UPDATE
========================================================= */

updateGlobalStats();


/* =========================================================
   END PART 1

   ↓ ЧАСТЬ 2 ВСТАВЛЯЕТСЯ ПРЯМО ПОД ЭТОЙ СТРОКОЙ ↓
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 2
   ROAD + LIBRARY + CAMPBELL CHAPTER
========================================================= */


/* =========================================================
   27. ROAD DATA
========================================================= */

const roadData = {

  "7": [
    {
      id: "7-1",
      title: "Введение в биологию",
      subtitle: "Живые организмы и их свойства",
      icon: "🌱",
      unlocked: true
    },

    {
      id: "7-2",
      title: "Клетка",
      subtitle: "Основная единица жизни",
      icon: "🔬"
    },

    {
      id: "7-3",
      title: "Организмы",
      subtitle: "Разнообразие живого мира",
      icon: "🧬"
    }
  ],


  "8": [
    {
      id: "8-1",
      title: "Организм человека",
      subtitle: "Системы органов",
      icon: "🫀",
      unlocked: true
    },

    {
      id: "8-2",
      title: "Кровообращение",
      subtitle: "Сердце и сосуды",
      icon: "❤️"
    },

    {
      id: "8-3",
      title: "Дыхание",
      subtitle: "Газообмен",
      icon: "🫁"
    }
  ],


  "9": [
    {
      id: "9-1",
      title: "От гена к белку",
      subtitle: "ДНК, РНК и синтез белка",
      icon: "🧬",
      unlocked: true
    },

    {
      id: "9-2",
      title: "Генетика",
      subtitle: "Наследственность и изменчивость",
      icon: "🧬"
    },

    {
      id: "9-3",
      title: "Регуляция генов",
      subtitle: "Как клетка управляет генами",
      icon: "🔬"
    }
  ],


  "10": [
    {
      id: "10-1",
      title: "Клеточная биология",
      subtitle: "Строение и функции клетки",
      icon: "🔬",
      unlocked: true
    },

    {
      id: "10-2",
      title: "Метаболизм",
      subtitle: "Энергия клетки",
      icon: "⚡"
    },

    {
      id: "10-3",
      title: "Деление клетки",
      subtitle: "Митоз и мейоз",
      icon: "🧬"
    }
  ],


  "11": [
    {
      id: "11-1",
      title: "Молекулярная биология",
      subtitle: "Гены и молекулы",
      icon: "🧬",
      unlocked: true
    },

    {
      id: "11-2",
      title: "Эволюция",
      subtitle: "Изменение живых организмов",
      icon: "🌍"
    },

    {
      id: "11-3",
      title: "Экология",
      subtitle: "Организмы и окружающая среда",
      icon: "🌿"
    }
  ]

};


/* =========================================================
   28. ROAD ELEMENT
========================================================= */

const learningRoad =
  getById("learningRoad") ||
  $(".learning-road") ||
  getById("roadContainer");


/* =========================================================
   29. COMPLETED ROAD LESSONS
========================================================= */

function getCompletedRoadLessons() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "groundCompletedRoadLessons"
      ) || "[]"
    );

  }

  catch (error) {

    console.error(
      "GROUND: ошибка чтения прогресса дорожки.",
      error
    );

    return [];

  }

}


function saveCompletedRoadLessons(
  lessons
) {

  localStorage.setItem(
    "groundCompletedRoadLessons",
    JSON.stringify(lessons)
  );

}


/* =========================================================
   30. IS ROAD LEVEL COMPLETED
========================================================= */

function isRoadLessonCompleted(
  id
) {

  return getCompletedRoadLessons()
    .includes(id);

}


/* =========================================================
   31. BUILD ROAD
========================================================= */

function buildRoad() {

  if (!learningRoad) {
    return;
  }


  const grade =
    groundState.grade;


  const lessons =
    roadData[grade] || [];


  const completed =
    getCompletedRoadLessons();


  learningRoad.innerHTML =
    "";


  lessons.forEach(
    (lesson, index) => {

      const previousLesson =
        lessons[index - 1];


      const previousCompleted =
        !previousLesson ||
        completed.includes(
          previousLesson.id
        );


      const unlocked =
        lesson.unlocked ||
        previousCompleted;


      const done =
        completed.includes(
          lesson.id
        );


      const item =
        document.createElement(
          "button"
        );


      item.type =
        "button";


      item.className =
        "road-level";


      item.dataset.lessonId =
        lesson.id;


      if (done) {

        item.classList.add(
          "completed"
        );

      }


      if (unlocked) {

        item.classList.add(
          "unlocked"
        );

      }

      else {

        item.classList.add(
          "locked"
        );

      }


      item.innerHTML = `

        <span class="road-level-icon">
          ${
            done
              ? "✓"
              : unlocked
                ? lesson.icon
                : "🔒"
          }
        </span>

        <span class="road-level-info">

          <strong>
            ${lesson.title}
          </strong>

          <small>
            ${lesson.subtitle}
          </small>

        </span>

      `;


      item.addEventListener(
        "click",
        () => {

          if (!unlocked) {

            showGroundToast(
              "Уровень закрыт",
              "Сначала пройди предыдущий урок.",
              "🔒"
            );

            return;
          }


          openRoadLesson(
            lesson
          );

        }
      );


      learningRoad.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   32. OPEN ROAD LESSON
========================================================= */

function openRoadLesson(
  lesson
) {

  /*
     Если player.js предоставляет
     специальную функцию запуска —
     используем её.
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


  /*
     Если специального урока пока нет,
     открываем общий экран урока.
  */

  if (lessonScreen) {

    setText(
      "lessonTitle",
      lesson.title
    );


    setText(
      "lessonSubtitle",
      lesson.subtitle
    );


    changeScreen(
      homeScreen,
      lessonScreen
    );


    return;
  }


  showGroundToast(
    lesson.title,
    "Урок скоро будет доступен.",
    lesson.icon
  );

}


/* =========================================================
   33. HOME ROAD BUTTON
========================================================= */

const continueLearningButton =
  getById(
    "continueLearningButton"
  ) ||
  getById(
    "todayLessonButton"
  );


onClick(
  continueLearningButton,
  () => {

    if (!learningRoad) {
      return;
    }


    learningRoad.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);


/* =========================================================
   34. LIBRARY DATA
========================================================= */

const libraryData = [

  {
    id: "campbell",
    title: "Campbell Biology",
    subtitle:
      "Углублённая биология",
    icon: "📚",
    type: "book"
  },

  {
    id: "school",
    title:
      `${groundState.grade} класс`,
    subtitle:
      "Школьная программа",
    icon: "🎓",
    type: "school"
  },

  {
    id: "ent",
    title: "ЕНТ",
    subtitle:
      "Подготовка к экзамену",
    icon: "🎯",
    type: "ent"
  },

  {
    id: "olympiad",
    title: "Олимпиада",
    subtitle:
      "Углублённые задания",
    icon: "🏆",
    type: "olympiad"
  }

];


/* =========================================================
   35. LIBRARY ELEMENTS
========================================================= */

const libraryList =
  getById("libraryList") ||
  getById("libraryContent") ||
  $(".library-list");


const libraryBackButton =
  getById(
    "libraryBackButton"
  );


/* =========================================================
   36. BUILD LIBRARY
========================================================= */

function buildLibrary() {

  if (!libraryList) {
    return;
  }


  libraryList.innerHTML =
    "";


  libraryData.forEach(
    (item) => {

      const card =
        document.createElement(
          "button"
        );


      card.type =
        "button";


      card.className =
        "library-card";


      card.dataset.libraryId =
        item.id;


      card.innerHTML = `

        <span class="library-card-icon">
          ${item.icon}
        </span>

        <span class="library-card-content">

          <strong>
            ${
              item.id === "school"
                ? `${groundState.grade} класс`
                : item.title
            }
          </strong>

          <small>
            ${item.subtitle}
          </small>

        </span>

        <span class="library-card-arrow">
          →
        </span>

      `;


      card.addEventListener(
        "click",
        () => {

          openLibraryItem(
            item
          );

        }
      );


      libraryList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   37. OPEN LIBRARY ITEM
========================================================= */

function openLibraryItem(
  item
) {

  if (
    item.id === "campbell"
  ) {

    openCampbellChapter();

    return;
  }


  if (
    item.id === "school"
  ) {

    showGroundToast(
      `${groundState.grade} класс`,
      "Школьная библиотека будет пополняться.",
      "🎓"
    );

    return;
  }


  if (
    item.id === "ent"
  ) {

    showGroundToast(
      "ЕНТ",
      "Материалы для ЕНТ скоро появятся.",
      "🎯"
    );

    return;
  }


  if (
    item.id === "olympiad"
  ) {

    showGroundToast(
      "Олимпиада",
      "Олимпиадная библиотека скоро появится.",
      "🏆"
    );

  }

}


/* =========================================================
   38. LIBRARY BACK
========================================================= */

onClick(
  libraryBackButton,
  () => {

    changeScreen(
      libraryScreen,
      homeScreen
    );

  }
);


/* =========================================================
   39. CAMPBELL STATE

   Глава 2:
   PDF 47–66
========================================================= */

const savedCampbellPage =
  getNumber(
    "campbellChapter2CurrentPage",
    47
  );


const campbellState = {

  startPage: 47,

  endPage: 66,

  currentPage:
    Math.max(
      47,
      Math.min(
        66,
        savedCampbellPage
      )
    ),

  theoryCompleted:
    localStorage.getItem(
      "campbellChapter2TheoryCompleted"
    ) === "true",

  examCompleted:
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true",

  examScore:
    getNumber(
      "campbellChapter2ExamScore",
      0
    )

};


/* =========================================================
   40. CAMPBELL ELEMENTS
========================================================= */

const campbellBackButton =
  getById(
    "campbellBackButton"
  );


const openCampbellTheoryButton =
  getById(
    "openCampbellTheoryButton"
  ) ||
  getById(
    "campbellTheoryButton"
  );


const openCampbellExamButton =
  getById(
    "openCampbellExamButton"
  ) ||
  getById(
    "campbellExamButton"
  );


/* =========================================================
   41. OPEN CAMPBELL CHAPTER
========================================================= */

function openCampbellChapter() {

  if (!campbellScreen) {

    console.error(
      "GROUND: #campbellScreen не найден."
    );

    return;
  }


  updateCampbellChapterScreen();


  changeScreen(
    libraryScreen,
    campbellScreen
  );

}


/* =========================================================
   42. UPDATE CAMPBELL CHAPTER
========================================================= */

function updateCampbellChapterScreen() {

  const totalPages =
    campbellState.endPage -
    campbellState.startPage +
    1;


  const current =
    campbellState.currentPage -
    campbellState.startPage +
    1;


  const readerPercent =
    Math.round(
      (current / totalPages) *
      100
    );


  setText(
    "campbellCurrentPage",
    campbellState.currentPage
  );


  setText(
    "campbellTotalPages",
    totalPages
  );


  setProgress(
    "campbellChapterProgress",
    readerPercent
  );


  /*
     THEORY STATUS
  */

  setText(
    "campbellTheoryStatus",
    campbellState.theoryCompleted
      ? "Пройдено"
      : "Не завершено"
  );


  /*
     EXAM STATUS
  */

  setText(
    "campbellExamStatus",
    campbellState.examCompleted
      ? `Результат: ${campbellState.examScore}%`
      : campbellState.theoryCompleted
        ? "Доступен"
        : "Сначала пройди теорию"
  );


  /*
     EXAM LOCK
  */

  if (openCampbellExamButton) {

    openCampbellExamButton.disabled =
      !campbellState.theoryCompleted;


    openCampbellExamButton.classList.toggle(
      "locked",
      !campbellState.theoryCompleted
    );

  }

}


/* =========================================================
   43. CAMPBELL BACK
========================================================= */

onClick(
  campbellBackButton,
  () => {

    changeScreen(
      campbellScreen,
      libraryScreen
    );

  }
);


/* =========================================================
   44. OPEN CAMPBELL THEORY
========================================================= */

onClick(
  openCampbellTheoryButton,
  () => {

    if (!campbellTheoryScreen) {

      console.error(
        "GROUND: #campbellTheoryScreen не найден."
      );

      return;
    }


    changeScreen(
      campbellScreen,
      campbellTheoryScreen
    );


    /*
       renderCampbellPage находится
       в PART 3.
    */

    if (
      typeof renderCampbellPage ===
      "function"
    ) {

      renderCampbellPage();

    }

  }
);


/* =========================================================
   45. OPEN CAMPBELL EXAM
========================================================= */

onClick(
  openCampbellExamButton,
  () => {

    if (
      !campbellState.theoryCompleted
    ) {

      showGroundToast(
        "Экзамен закрыт",
        "Сначала закончи теорию главы.",
        "🔒"
      );

      return;
    }


    if (
      typeof startCampbellExam ===
      "function"
    ) {

      startCampbellExam();

      return;
    }


    if (campbellExamScreen) {

      changeScreen(
        campbellScreen,
        campbellExamScreen
      );

    }

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

   ↓ PART 3 ВСТАВЛЯЕМ СРАЗУ ПОД ЭТИМ ↓
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 3
   CAMPBELL READER — PAGES 47–66
========================================================= */


/* =========================================================
   47. CAMPBELL READER ELEMENTS
========================================================= */

const campbellReaderImage =
  getById("campbellReaderImage");

const campbellReaderLoading =
  getById("campbellReaderLoading");

const campbellReaderError =
  getById("campbellReaderError");


/*
   Поддерживаем ОБА варианта ID.

   Новый:
   campbellPrevButton
   campbellNextButton

   Старый:
   campbellReaderPrevButton
   campbellReaderNextButton
*/

const campbellPrevButton =
  getById("campbellPrevButton") ||
  getById("campbellReaderPrevButton");

const campbellNextButton =
  getById("campbellNextButton") ||
  getById("campbellReaderNextButton");


const completeCampbellTheoryButton =
  getById(
    "completeCampbellTheoryButton"
  );


const campbellTheoryBackButton =
  getById(
    "campbellTheoryBackButton"
  ) ||
  getById(
    "campbellReaderBackButton"
  );


/* =========================================================
   48. CAMPBELL IMAGE PATH
========================================================= */

function getCampbellPagePath(
  page
) {

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
    String(
      campbellState.currentPage
    )
  );

}


/* =========================================================
   50. CAMPBELL PROGRESS
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
   51. UPDATE READER INTERFACE
========================================================= */

function updateCampbellReaderInfo() {

  const page =
    campbellState.currentPage;


  const percent =
    getCampbellReaderPercent();


  /*
     PAGE NUMBER
  */

  setText(
    "campbellReaderPageNumber",
    `Страница ${page} из ${campbellState.endPage}`
  );


  setText(
    "campbellReaderPageTop",
    String(page)
  );


  setText(
    "campbellPageNumber",
    String(page)
  );


  /*
     PROGRESS
  */

  setProgress(
    "campbellReaderProgressFill",
    percent
  );


  setProgress(
    "campbellReaderProgress",
    percent
  );


  /*
     PREVIOUS BUTTON
  */

  if (campbellPrevButton) {

    campbellPrevButton.disabled =
      page <=
      campbellState.startPage;

  }


  /*
     NEXT BUTTON
  */

  if (campbellNextButton) {

    campbellNextButton.disabled =
      page >=
      campbellState.endPage;

  }


  /*
     COMPLETE THEORY

     Показываем только
     на последней странице.
  */

  if (
    completeCampbellTheoryButton
  ) {

    completeCampbellTheoryButton.hidden =
      page !==
      campbellState.endPage;

  }

}


/* =========================================================
   52. LOADING
========================================================= */

function showCampbellLoading() {

  if (
    campbellReaderLoading
  ) {

    campbellReaderLoading.hidden =
      false;

  }


  if (
    campbellReaderError
  ) {

    campbellReaderError.hidden =
      true;

  }

}


/* =========================================================
   53. HIDE LOADING
========================================================= */

function hideCampbellLoading() {

  if (
    campbellReaderLoading
  ) {

    campbellReaderLoading.hidden =
      true;

  }

}


/* =========================================================
   54. IMAGE ERROR
========================================================= */

function showCampbellImageError(
  page
) {

  hideCampbellLoading();


  if (
    campbellReaderImage
  ) {

    campbellReaderImage.hidden =
      true;

  }


  if (
    campbellReaderError
  ) {

    campbellReaderError.hidden =
      false;


    const errorText =
      campbellReaderError.querySelector(
        "p"
      );


    if (errorText) {

      errorText.textContent =
        `Не удалось загрузить page-${page}.webp. Проверь файл images/campbell/chapter2/page-${page}.webp`;

    }

  }


  console.error(
    `GROUND: не удалось загрузить Campbell page-${page}.webp`
  );

}


/* =========================================================
   55. PAGE ANIMATION
========================================================= */

function animateCampbellPage() {

  if (
    !campbellReaderImage
  ) {

    return;

  }


  campbellReaderImage.classList.remove(
    "page-enter"
  );


  /*
     Перезапускаем CSS animation.
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

  if (
    !campbellReaderImage
  ) {

    console.error(
      "GROUND: #campbellReaderImage не найден."
    );

    return;

  }


  /*
     Защита диапазона.

     Страница никогда не уйдёт
     ниже 47 или выше 66.
  */

  campbellState.currentPage =
    Math.max(
      campbellState.startPage,

      Math.min(
        campbellState.endPage,
        Number(
          campbellState.currentPage
        ) ||
        campbellState.startPage
      )
    );


  const page =
    campbellState.currentPage;


  const src =
    getCampbellPagePath(
      page
    );


  /*
     Сразу обновляем номер страницы
     и кнопки.
  */

  updateCampbellReaderInfo();


  showCampbellLoading();


  /*
     Скрываем старую ошибку.
  */

  if (
    campbellReaderError
  ) {

    campbellReaderError.hidden =
      true;

  }


  /*
     ВАЖНО:

     Здесь больше не делаем сложную
     систему с отдельным preloadImage
     перед каждой сменой страницы.

     Сам <img> загружает нужный файл.
     Это проще и надёжнее.
  */

  campbellReaderImage.hidden =
    false;


  campbellReaderImage.onload =
    () => {

      hideCampbellLoading();

      campbellReaderImage.hidden =
        false;

      animateCampbellPage();

      saveCampbellPage();

      updateCampbellChapterScreen();

    };


  campbellReaderImage.onerror =
    () => {

      showCampbellImageError(
        page
      );

    };


  /*
     Добавляем маленький параметр
     версии страницы.

     Он помогает браузеру не держать
     старую картинку в кэше.
  */

  campbellReaderImage.src =
    `${src}?page=${page}`;

}


/* =========================================================
   57. PRELOAD PAGE
========================================================= */

function preloadCampbellPage(
  page
) {

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


  image.src =
    getCampbellPagePath(
      page
    );

}


/* =========================================================
   58. NEXT PAGE
========================================================= */

function nextCampbellPage() {

  /*
     Если уже 66 —
     дальше не идём.
  */

  if (
    campbellState.currentPage >=
    campbellState.endPage
  ) {

    return;

  }


  /*
     +1 страница.

     47 → 48
     48 → 49
     ...
  */

  campbellState.currentPage++;


  console.log(
    "GROUND Campbell:",
    campbellState.currentPage
  );


  saveCampbellPage();


  renderCampbellPage();


  /*
     Заранее загружаем
     следующую страницу.
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


  campbellState.currentPage--;


  saveCampbellPage();


  renderCampbellPage();


  preloadCampbellPage(
    campbellState.currentPage - 1
  );

}


/* =========================================================
   60. READER BUTTON EVENTS
========================================================= */

/*
   Не используем прямой:

   button.addEventListener(...)

   без проверки.

   Именно такие места раньше
   могли ронять весь JS.
*/

if (
  campbellNextButton
) {

  campbellNextButton.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      event.stopPropagation();


      nextCampbellPage();

    }
  );

}

else {

  console.warn(
    "GROUND: кнопка Campbell NEXT не найдена."
  );

}


if (
  campbellPrevButton
) {

  campbellPrevButton.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      event.stopPropagation();


      previousCampbellPage();

    }
  );

}

else {

  console.warn(
    "GROUND: кнопка Campbell PREVIOUS не найдена."
  );

}


/* =========================================================
   61. BACK FROM THEORY
========================================================= */

onClick(
  campbellTheoryBackButton,
  () => {

    saveCampbellPage();


    updateCampbellChapterScreen();


    changeScreen(
      campbellTheoryScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   62. COMPLETE CAMPBELL THEORY
========================================================= */

onClick(
  completeCampbellTheoryButton,
  () => {

    /*
       Завершение разрешено
       только на странице 66.
    */

    if (
      campbellState.currentPage !==
      campbellState.endPage
    ) {

      showGroundToast(
        "Ещё не всё",
        "Сначала дочитай главу до страницы 66.",
        "📖"
      );

      return;

    }


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
       Награда выдаётся
       только один раз.
    */

    if (
      !alreadyCompleted
    ) {

      addXP(
        50
      );

      addGenes(
        10
      );

    }


    updateCampbellChapterScreen();


    /*
       REWARD
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
       Поддерживаем также
       общий экран награды.
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


    if (
      campbellTheoryCompleteScreen
    ) {

      changeScreen(
        campbellTheoryScreen,
        campbellTheoryCompleteScreen
      );

    }

    else {

      changeScreen(
        campbellTheoryScreen,
        campbellScreen
      );

    }


    showGroundToast(
      "Теория завершена",
      "Экзамен по главе 2 разблокирован!",
      "🎉"
    );

  }
);


/* =========================================================
   63. THEORY COMPLETE CONTINUE
========================================================= */

const campbellTheoryContinueButton =
  getById(
    "campbellTheoryContinueButton"
  ) ||
  getById(
    "campbellTheoryCompleteButton"
  );


onClick(
  campbellTheoryContinueButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellTheoryCompleteScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   64. KEYBOARD CONTROL
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    /*
       Стрелки работают только
       когда открыт Campbell Reader.
    */

    if (
      !campbellTheoryScreen ||
      !campbellTheoryScreen.classList.contains(
        "active"
      )
    ) {

      return;

    }


    /*
       RIGHT
    */

    if (
      event.key ===
      "ArrowRight"
    ) {

      event.preventDefault();

      nextCampbellPage();

    }


    /*
       LEFT
    */

    if (
      event.key ===
      "ArrowLeft"
    ) {

      event.preventDefault();

      previousCampbellPage();

    }

  }
);


/* =========================================================
   65. TOUCH SWIPE
========================================================= */

let campbellTouchStartX =
  null;


let campbellTouchStartY =
  null;


if (
  campbellTheoryScreen
) {

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


      campbellTouchStartY =
        event.touches[0].clientY;

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
          null ||

        campbellTouchStartY ===
          null
      ) {

        return;

      }


      if (
        !event.changedTouches.length
      ) {

        campbellTouchStartX =
          null;

        campbellTouchStartY =
          null;

        return;

      }


      const endX =
        event.changedTouches[0]
          .clientX;


      const endY =
        event.changedTouches[0]
          .clientY;


      const differenceX =
        endX -
        campbellTouchStartX;


      const differenceY =
        endY -
        campbellTouchStartY;


      /*
         Листаем только если движение
         явно горизонтальное.

         Поэтому обычная прокрутка
         страницы вверх/вниз
         не будет случайно листать книгу.
      */

      if (
        Math.abs(
          differenceX
        ) >= 60 &&

        Math.abs(
          differenceX
        ) >
        Math.abs(
          differenceY
        )
      ) {

        /*
           SWIPE LEFT
           → следующая
        */

        if (
          differenceX < 0
        ) {

          nextCampbellPage();

        }


        /*
           SWIPE RIGHT
           → предыдущая
        */

        else {

          previousCampbellPage();

        }

      }


      campbellTouchStartX =
        null;


      campbellTouchStartY =
        null;

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   66. INITIAL CAMPBELL UPDATE
========================================================= */

updateCampbellReaderInfo();


/*
   Заранее подготавливаем страницу
   после сохранённой.
*/

preloadCampbellPage(
  campbellState.currentPage + 1
);


/* =========================================================
   END PART 3

   ↓ PART 4 ВСТАВЛЯЕМ ПРЯМО ПОД ЭТОЙ СТРОКОЙ ↓
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 4
   CAMPBELL EXAM
========================================================= */


/* =========================================================
   67. EXAM QUESTIONS
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
   68. EXAM STATE
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
   69. EXAM ELEMENTS
========================================================= */

const campbellExamQuestion =
  getById(
    "campbellExamQuestion"
  );


const campbellExamAnswers =
  getById(
    "campbellExamAnswers"
  );


const campbellExamNextButton =
  getById(
    "campbellExamNextButton"
  );


const campbellExamTimer =
  getById(
    "campbellExamTimer"
  );


const campbellExamBackButton =
  getById(
    "campbellExamBackButton"
  );


/* =========================================================
   70. START EXAM
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


  if (
    !campbellExamScreen
  ) {

    console.error(
      "GROUND: #campbellExamScreen не найден."
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
   71. RENDER QUESTION
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


  /*
     QUESTION COUNTER
  */

  setText(
    "campbellExamQuestionCounter",
    `Вопрос ${index + 1} из ${campbellExamQuestions.length}`
  );


  /*
     PROGRESS
  */

  const progress =
    (
      index /
      campbellExamQuestions.length
    ) * 100;


  setProgress(
    "campbellExamProgressBar",
    progress
  );


  setProgress(
    "campbellExamProgress",
    progress
  );


  /*
     QUESTION
  */

  if (
    campbellExamQuestion
  ) {

    campbellExamQuestion.textContent =
      question.question;

  }


  /*
     HINT
  */

  setText(
    "campbellExamQuestionHint",
    "Выбери один правильный ответ."
  );


  /*
     ANSWERS
  */

  if (
    !campbellExamAnswers
  ) {

    console.error(
      "GROUND: #campbellExamAnswers не найден."
    );

    return;

  }


  campbellExamAnswers.innerHTML =
    "";


  const letters =
    [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F"
    ];


  question.answers.forEach(
    (
      answer,
      answerIndex
    ) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "answer-option";


      const letter =
        document.createElement(
          "span"
        );


      letter.className =
        "answer-letter";


      letter.textContent =
        letters[answerIndex] ||
        "?";


      const text =
        document.createElement(
          "span"
        );


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


  /*
     NEXT BUTTON
  */

  if (
    campbellExamNextButton
  ) {

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
   72. SELECT ANSWER
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


  /*
     SAVE ANSWER
  */

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

    campbellExamState.correctAnswers++;

  }


  /*
     LOCK ANSWERS
  */

  const answerButtons =
    Array.from(
      campbellExamAnswers.querySelectorAll(
        ".answer-option"
      )
    );


  answerButtons.forEach(
    (
      answerButton,
      index
    ) => {

      answerButton.disabled =
        true;


      /*
         CORRECT
      */

      if (
        index ===
        question.correct
      ) {

        answerButton.classList.add(
          "correct"
        );

      }


      /*
         WRONG SELECTED
      */

      if (
        index ===
          answerIndex &&

        !isCorrect
      ) {

        answerButton.classList.add(
          "wrong"
        );

      }

    }
  );


  /*
     FEEDBACK
  */

  setText(
    "campbellExamQuestionHint",

    isCorrect

      ? `✓ Правильно. ${question.explanation}`

      : `✕ Неправильно. ${question.explanation}`
  );


  /*
     ENABLE NEXT
  */

  if (
    campbellExamNextButton
  ) {

    campbellExamNextButton.disabled =
      false;

  }

}


/* =========================================================
   73. NEXT QUESTION
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


  campbellExamState.currentQuestion++;


  renderCampbellExamQuestion();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   74. NEXT BUTTON
========================================================= */

onClick(
  campbellExamNextButton,
  nextCampbellExamQuestion
);


/* =========================================================
   75. TIMER
========================================================= */

function startCampbellExamTimer() {

  stopCampbellExamTimer();


  campbellExamState.timer =
    setInterval(
      () => {

        campbellExamState.secondsLeft--;


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
   76. STOP TIMER
========================================================= */

function stopCampbellExamTimer() {

  if (
    !campbellExamState.timer
  ) {

    return;

  }


  clearInterval(
    campbellExamState.timer
  );


  campbellExamState.timer =
    null;

}


/* =========================================================
   77. UPDATE TIMER
========================================================= */

function updateCampbellExamTimer() {

  if (
    !campbellExamTimer
  ) {

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


  /*
     1 MINUTE
  */

  if (
    seconds <= 60
  ) {

    campbellExamTimer.classList.add(
      "danger"
    );

  }


  /*
     3 MINUTES
  */

  else if (
    seconds <= 180
  ) {

    campbellExamTimer.classList.add(
      "warning"
    );

  }

}


/* =========================================================
   78. FINISH EXAM
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
    total > 0

      ? Math.round(
          (
            correct /
            total
          ) * 100
        )

      : 0;


  /*
     PASS = 70%
  */

  const passed =
    percent >= 70;


  const previouslyCompleted =
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true";


  /*
     SAVE SUCCESS
  */

  if (passed) {

    campbellState.examCompleted =
      true;


    localStorage.setItem(
      "campbellChapter2ExamCompleted",
      "true"
    );

  }


  /*
     SAVE SCORE

     Сохраняем лучший результат
     отдельно от последнего.
  */

  const oldBest =
    getNumber(
      "campbellChapter2ExamScore",
      0
    );


  const bestScore =
    Math.max(
      oldBest,
      percent
    );


  campbellState.examScore =
    bestScore;


  localStorage.setItem(
    "campbellChapter2ExamScore",
    String(bestScore)
  );


  localStorage.setItem(
    "campbellChapter2LastScore",
    String(percent)
  );


  localStorage.setItem(
    "campbellChapter2CorrectAnswers",
    String(correct)
  );


  /*
     REWARD
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
     RESULT
  */

  renderCampbellResult({

    total:
      total,

    correct:
      correct,

    wrong:
      wrong,

    percent:
      percent,

    passed:
      passed,

    rewardXP:
      rewardXP,

    rewardGenes:
      rewardGenes

  });


  updateCampbellChapterScreen();


  if (
    campbellResultScreen
  ) {

    changeScreen(
      campbellExamScreen,
      campbellResultScreen
    );

  }

  else {

    changeScreen(
      campbellExamScreen,
      campbellScreen
    );

  }

}


/* =========================================================
   79. RENDER RESULT
========================================================= */

function renderCampbellResult(
  result
) {

  /*
     ICON
  */

  setText(
    "campbellResultIcon",

    result.passed
      ? "🏆"
      : "📚"
  );


  /*
     TITLE
  */

  setText(
    "campbellResultTitle",

    result.passed
      ? "Экзамен пройден!"
      : "Попробуй ещё раз"
  );


  /*
     MESSAGE
  */

  setText(
    "campbellResultMessage",

    result.passed

      ? "Отличная работа! Глава 2 завершена."

      : "Для прохождения нужно набрать минимум 70%. Повтори материал и попробуй снова."
  );


  /*
     PERCENT
  */

  setText(
    "campbellResultPercent",
    `${result.percent}%`
  );


  const percentElement =
    $(".campbell-result-percent");


  if (
    percentElement &&
    !getById(
      "campbellResultPercent"
    )
  ) {

    percentElement.textContent =
      `${result.percent}%`;

  }


  /*
     PROGRESS
  */

  setProgress(
    "campbellResultProgress",
    result.percent
  );


  /*
     STATS
  */

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


  /*
     REWARD
  */

  let rewardText =
    "";


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


  /*
     Дополнительные ID,
     если они есть в HTML.
  */

  setText(
    "campbellResultRewardXP",
    `+${result.rewardXP} XP`
  );


  setText(
    "campbellResultRewardGenes",
    `+${result.rewardGenes}`
  );

}


/* =========================================================
   80. EXAM BACK
========================================================= */

onClick(
  campbellExamBackButton,
  () => {

    stopCampbellExamTimer();


    changeScreen(
      campbellExamScreen,
      campbellScreen
    );

  }
);


/* =========================================================
   81. RESULT BUTTONS
========================================================= */

const campbellResultContinueButton =
  getById(
    "campbellResultContinueButton"
  );


const campbellRetryExamButton =
  getById(
    "campbellRetryExamButton"
  ) ||
  getById(
    "campbellResultRetryButton"
  );


const campbellReviewButton =
  getById(
    "campbellReviewButton"
  );


/*
   CONTINUE
*/

onClick(
  campbellResultContinueButton,
  () => {

    updateCampbellChapterScreen();


    changeScreen(
      campbellResultScreen,
      campbellScreen
    );

  }
);


/*
   RETRY
*/

onClick(
  campbellRetryExamButton,
  () => {

    startCampbellExam();

  }
);


/*
   REVIEW

   Сам экран разбора продолжим
   в следующей части.
*/

onClick(
  campbellReviewButton,
  () => {

    if (
      typeof openCampbellReview ===
      "function"
    ) {

      openCampbellReview();

      return;

    }


    showGroundToast(
      "Разбор",
      "Разбор ответов скоро откроется.",
      "📖"
    );

  }
);


/* =========================================================
   END PART 4

   ↓ PART 5 ВСТАВЛЯЕМ ПРЯМО ПОД ЭТИМ ↓
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 5
   EXAM REVIEW + LESSON COMPLETE + RESTORE STATE
========================================================= */


/* =========================================================
   82. REVIEW ELEMENTS
========================================================= */



const campbellReviewList =
  getById("campbellReviewList") ||
  getById("campbellReviewContent");

const campbellReviewBackButton =
  getById("campbellReviewBackButton");

const campbellReviewFinishButton =
  getById("campbellReviewFinishButton");


/* =========================================================
   83. OPEN REVIEW
========================================================= */

function openCampbellReview() {

  if (!campbellReviewScreen) {

    showGroundToast(
      "Разбор ответов",
      "Экран разбора пока не найден в HTML.",
      "📖"
    );

    return;
  }


  renderCampbellReview();


  changeScreen(
    campbellResultScreen,
    campbellReviewScreen
  );

}


/* =========================================================
   84. RENDER REVIEW
========================================================= */

function renderCampbellReview() {

  if (!campbellReviewList) {
    return;
  }


  campbellReviewList.innerHTML =
    "";


  const savedAnswers =
    campbellExamState.answers;


  campbellExamQuestions.forEach(
    (question, index) => {

      const saved =
        savedAnswers.find(
          (item) =>
            item.questionIndex === index
        );


      const selectedIndex =
        saved
          ? saved.selected
          : null;


      const isCorrect =
        selectedIndex ===
        question.correct;


      const card =
        document.createElement("article");


      card.className =
        "campbell-review-card";


      card.classList.add(
        isCorrect
          ? "correct"
          : "wrong"
      );


      const title =
        document.createElement("h3");


      title.textContent =
        `${index + 1}. ${question.question}`;


      card.appendChild(
        title
      );


      /*
         USER ANSWER
      */

      const userAnswer =
        document.createElement("p");


      userAnswer.className =
        "campbell-review-user-answer";


      if (
        selectedIndex !== null &&
        question.answers[selectedIndex]
      ) {

        userAnswer.textContent =
          `Твой ответ: ${question.answers[selectedIndex]}`;

      }

      else {

        userAnswer.textContent =
          "Твой ответ: нет ответа";

      }


      card.appendChild(
        userAnswer
      );


      /*
         CORRECT ANSWER
      */

      const correctAnswer =
        document.createElement("p");


      correctAnswer.className =
        "campbell-review-correct-answer";


      correctAnswer.textContent =
        `Правильный ответ: ${question.answers[question.correct]}`;


      card.appendChild(
        correctAnswer
      );


      /*
         RESULT
      */

      const result =
        document.createElement("strong");


      result.className =
        "campbell-review-result";


      result.textContent =
        isCorrect
          ? "✓ Правильно"
          : "✕ Неправильно";


      card.appendChild(
        result
      );


      /*
         EXPLANATION
      */

      const explanation =
        document.createElement("p");


      explanation.className =
        "campbell-review-explanation";


      explanation.textContent =
        question.explanation;


      card.appendChild(
        explanation
      );


      campbellReviewList.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   85. REVIEW BACK
========================================================= */

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
   86. REVIEW FINISH
========================================================= */

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
   87. LESSON COMPLETE ELEMENTS
========================================================= */

const lessonCompleteButton =
  getById(
    "lessonCompleteButton"
  );


/* =========================================================
   88. OPEN LESSON COMPLETE
========================================================= */

function openLessonComplete(
  xp = 0,
  genes = 0
) {

  setText(
    "lessonRewardXP",
    `+${xp} XP`
  );


  setText(
    "lessonRewardGenes",
    `+${genes}`
  );


  if (
    lessonCompleteScreen
  ) {

    /*
       Находим активный экран,
       чтобы корректно его закрыть.
    */

    const activeScreen =
      $(".screen.active");


    if (
      activeScreen &&
      activeScreen !==
      lessonCompleteScreen
    ) {

      changeScreen(
        activeScreen,
        lessonCompleteScreen
      );

    }

    else {

      showScreen(
        lessonCompleteScreen
      );

    }

  }

}


/* =========================================================
   89. LESSON COMPLETE CONTINUE
========================================================= */

onClick(
  lessonCompleteButton,
  () => {

    updateHomeStats();


    buildRoad();


    changeScreen(
      lessonCompleteScreen,
      homeScreen
    );

  }
);


/* =========================================================
   90. COMPLETE ROAD LESSON
========================================================= */

function completeRoadLesson(
  lessonId,
  xp = 20,
  genes = 5
) {

  if (!lessonId) {
    return;
  }


  const completed =
    getCompletedRoadLessons();


  const alreadyCompleted =
    completed.includes(
      lessonId
    );


  /*
     Сохраняем прохождение.
  */

  if (!alreadyCompleted) {

    completed.push(
      lessonId
    );


    saveCompletedRoadLessons(
      completed
    );


    /*
       Награда только один раз.
    */

    addXP(
      xp
    );


    addGenes(
      genes
    );

  }


  buildRoad();


  openLessonComplete(
    alreadyCompleted
      ? 0
      : xp,

    alreadyCompleted
      ? 0
      : genes
  );

}


/* =========================================================
   91. EXPOSE COMPLETE FUNCTION

   player.js сможет вызвать:

   window.completeGroundLesson("9-1", 20, 5);
========================================================= */

window.completeGroundLesson =
  completeRoadLesson;


/* =========================================================
   92. CLOSE GENERIC LESSON
========================================================= */

function closeGroundLesson() {

  if (
    lessonScreen &&
    lessonScreen.classList.contains(
      "active"
    )
  ) {

    changeScreen(
      lessonScreen,
      homeScreen
    );

  }

}


/*
   Делаем функцию доступной
   для player.js.
*/

window.closeGroundLesson =
  closeGroundLesson;


/* =========================================================
   93. SAFE CLOSE LESSON BUTTON

   Поддерживаем несколько ID,
   чтобы старый HTML тоже работал.
========================================================= */

const appCloseLessonButton =
  getById("closeLessonButton") ||
  getById("lessonCloseButton") ||
  getById("closeLesson");


onClick(
  appCloseLessonButton,
  closeGroundLesson
);


/* =========================================================
   94. SAVE APP STATE
========================================================= */

function saveGroundState() {

  try {

    localStorage.setItem(
      "groundAppState",
      JSON.stringify({
        grade:
          groundState.grade,

        campbellPage:
          campbellState.currentPage
      })
    );

  }

  catch (error) {

    console.warn(
      "GROUND: не удалось сохранить состояние.",
      error
    );

  }

}


/* =========================================================
   95. RESTORE APP STATE
========================================================= */

function restoreGroundState() {

  let savedState =
    null;


  try {

    savedState =
      JSON.parse(
        localStorage.getItem(
          "groundAppState"
        ) || "null"
      );

  }

  catch (error) {

    console.warn(
      "GROUND: сохранённое состояние повреждено.",
      error
    );

  }


  /*
     RESTORE GRADE
  */

  if (
    savedState &&
    savedState.grade &&
    roadData[savedState.grade]
  ) {

    groundState.grade =
      String(
        savedState.grade
      );

  }


  /*
     RESTORE CAMPBELL PAGE
  */

  if (
    savedState &&
    Number.isFinite(
      Number(
        savedState.campbellPage
      )
    )
  ) {

    campbellState.currentPage =
      Math.max(
        campbellState.startPage,

        Math.min(
          campbellState.endPage,
          Number(
            savedState.campbellPage
          )
        )
      );

  }


  /*
     Синхронизация состояния
     Campbell с localStorage.
  */

  campbellState.theoryCompleted =
    localStorage.getItem(
      "campbellChapter2TheoryCompleted"
    ) === "true";


  campbellState.examCompleted =
    localStorage.getItem(
      "campbellChapter2ExamCompleted"
    ) === "true";


  campbellState.examScore =
    getNumber(
      "campbellChapter2ExamScore",
      0
    );

}


/* =========================================================
   96. AUTO SAVE
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    saveGroundState();

  }
);


document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "hidden"
    ) {

      saveGroundState();

    }

  }
);


/* =========================================================
   97. PROFILE FALLBACK

   Это страховка для проблемы,
   когда профиль раньше
   не открывался.
========================================================= */

const profileNavButtons =
  $$(
    '[data-screen="profile"],' +
    '[data-target="profile"],' +
    '[data-page="profile"]'
  );


profileNavButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        if (!profileScreen) {

          console.warn(
            "GROUND: #profileScreen не найден."
          );

          return;

        }


        const activeScreen =
          $(".screen.active");


        changeScreen(
          activeScreen,
          profileScreen
        );


        updateProfile();

      }
    );

  }
);


/* =========================================================
   98. PROFILE BACK FALLBACK
========================================================= */

const profileBackButton =
  getById("profileBackButton");


onClick(
  profileBackButton,
  () => {

    changeScreen(
      profileScreen,
      homeScreen
    );

  }
);


/* =========================================================
   99. UPDATE PROFILE
========================================================= */

function updateProfile() {

  const genes =
    getNumber(
      "groundGenes",
      groundState.genes || 0
    );


  const xp =
    getNumber(
      "groundXP",
      groundState.xp || 0
    );


  const level =
    Math.floor(
      xp / 100
    ) + 1;


  const completedLessons =
    getCompletedRoadLessons()
      .length;


  setText(
    "profileGenes",
    genes
  );


  setText(
    "profileXP",
    xp
  );


  setText(
    "profileLevel",
    level
  );


  setText(
    "profileLessons",
    completedLessons
  );


  setText(
    "profileGrade",
    `${groundState.grade} класс`
  );

}


/* =========================================================
   100. UPDATE HOME
========================================================= */

function refreshGroundUI() {

  updateGlobalStats();

  updateProfile();

  buildRoad();

  buildLibrary();

  updateCampbellChapterScreen();

  updateCampbellReaderInfo();

}


/* =========================================================
   101. RESTORE EVERYTHING
========================================================= */

restoreGroundState();


refreshGroundUI();


/* =========================================================
   102. GLOBAL ERROR PROTECTION

   Ошибка в одном обработчике
   теперь будет видна в консоли.
========================================================= */

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "GROUND JS ERROR:",
      event.message,
      event.filename,
      event.lineno
    );

  }
);


/* =========================================================
   103. DEBUG

   После запуска в Console должно быть:

   GROUND: app.js loaded successfully
========================================================= */

console.log(
  "GROUND: app.js loaded successfully"
);


/* =========================================================
   END PART 5

   ↓ PART 6 ВСТАВЛЯЕМ ПРЯМО ПОД ЭТИМ ↓
========================================================= */
/* =========================================================
   GROUND — APP.JS
   PART 6
   NAVIGATION + TRANSITIONS + FINAL INITIALIZATION
========================================================= */


/* =========================================================
   104. SCREEN HELPERS
========================================================= */

function getActiveScreen() {

  return document.querySelector(
    ".screen.active"
  );

}


function showScreen(
  targetScreen
) {

  if (!targetScreen) {

    console.warn(
      "GROUND: showScreen получил пустой экран."
    );

    return;
  }


  const currentScreen =
    getActiveScreen();


  changeScreen(
    currentScreen,
    targetScreen
  );

}


/* =========================================================
   105. SAFE SCREEN OPEN
========================================================= */

function openGroundScreen(
  screenId
) {

  const target =
    getById(
      screenId
    );


  if (!target) {

    console.warn(
      `GROUND: экран #${screenId} не найден.`
    );

    return;
  }


  showScreen(
    target
  );

}


/* =========================================================
   106. EXPOSE SCREEN FUNCTIONS
========================================================= */

window.openGroundScreen =
  openGroundScreen;


window.showGroundScreen =
  showScreen;


/* =========================================================
   107. BOTTOM NAV FALLBACK

   Поддерживаем разные варианты HTML,
   которые были в предыдущих версиях Ground.
========================================================= */

const bottomNavButtons =
  $$(
    ".bottom-nav button," +
    ".bottom-navigation button," +
    ".nav-item"
  );


bottomNavButtons.forEach(
  (button) => {

    /*
       Не создаём второй обработчик
       для .nav-item из PART 1.
    */

    if (
      button.classList.contains(
        "nav-item"
      )
    ) {

      return;

    }


    button.addEventListener(
      "click",
      () => {

        const target =
          button.dataset.screen ||
          button.dataset.target ||
          button.dataset.page ||
          button.dataset.nav;


        if (!target) {
          return;
        }


        /*
           HOME
        */

        if (
          target === "home" ||
          target === "homeScreen"
        ) {

          showScreen(
            homeScreen
          );

          return;
        }


        /*
           ROAD
        */

        if (
          target === "road" ||
          target === "path"
        ) {

          showScreen(
            homeScreen
          );


          setTimeout(
            () => {

              if (
                learningRoad
              ) {

                learningRoad.scrollIntoView({
                  behavior:
                    "smooth",

                  block:
                    "center"
                });

              }

            },
            180
          );


          return;
        }


        /*
           LIBRARY
        */

        if (
          target === "library" ||
          target === "libraryScreen"
        ) {

          buildLibrary();


          showScreen(
            libraryScreen
          );


          return;
        }


        /*
           PROFILE
        */

        if (
          target === "profile" ||
          target === "profileScreen"
        ) {

          updateProfile();


          showScreen(
            profileScreen
          );


          return;
        }

      }
    );

  }
);


/* =========================================================
   108. TRANSITION CLASS
========================================================= */

function restartScreenAnimation(
  screen
) {

  if (!screen) {
    return;
  }


  screen.classList.remove(
    "screen-enter"
  );


  void screen.offsetWidth;


  screen.classList.add(
    "screen-enter"
  );

}


/* =========================================================
   109. OBSERVE SCREEN CHANGES

   Когда появляется .active,
   запускаем анимацию.
========================================================= */



/* =========================================================
   111. CAMPBELL THEORY DIRECT FALLBACK
========================================================= */

const theoryDirectButtons =
  $$(
    '[data-open="campbell-theory"]'
  );


theoryDirectButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        if (
          !campbellTheoryScreen
        ) {

          return;

        }


        showScreen(
          campbellTheoryScreen
        );


        renderCampbellPage();

      }
    );

  }
);


/* =========================================================
   112. CAMPBELL EXAM DIRECT FALLBACK
========================================================= */

const examDirectButtons =
  $$(
    '[data-open="campbell-exam"]'
  );


examDirectButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        startCampbellExam();

      }
    );

  }
);


/* =========================================================
   113. READER IMAGE PROTECTION
========================================================= */

if (
  campbellReaderImage
) {

  campbellReaderImage.setAttribute(
    "draggable",
    "false"
  );


  campbellReaderImage.addEventListener(
    "contextmenu",
    (event) => {

      /*
         Не блокируем браузер полностью.
         Просто не запускаем
         никакую дополнительную логику.
      */

    }
  );

}


/* =========================================================
   114. CAMPBELL PAGE CACHE PRELOAD
========================================================= */

function preloadCampbellNeighbours() {

  preloadCampbellPage(
    campbellState.currentPage - 1
  );


  preloadCampbellPage(
    campbellState.currentPage + 1
  );

}


/* =========================================================
   115. SAVE CAMPBELL WHEN PAGE CHANGES
========================================================= */

function syncCampbellState() {

  localStorage.setItem(
    "campbellChapter2CurrentPage",
    String(
      campbellState.currentPage
    )
  );


  saveGroundState();

}


/* =========================================================
   116. SAFE GLOBAL STATE SAVE

   Это дополняет PART 1:
   сохраняем и статистику,
   и текущее состояние приложения.
========================================================= */

function saveAllGroundData() {

  /*
     Основные данные пользователя.
  */

  localStorage.setItem(
    "groundSelectedGrade",
    String(
      groundState.grade
    )
  );


  localStorage.setItem(
    "groundGenes",
    String(
      groundState.genes
    )
  );


  localStorage.setItem(
    "groundXP",
    String(
      groundState.xp
    )
  );


  localStorage.setItem(
    "groundLevel",
    String(
      groundState.level
    )
  );


  localStorage.setItem(
    "groundStreak",
    String(
      groundState.streak
    )
  );


  localStorage.setItem(
    "groundCompletedLessons",
    String(
      groundState.completedLessons
    )
  );


  /*
     Campbell.
  */

  localStorage.setItem(
    "campbellChapter2CurrentPage",
    String(
      campbellState.currentPage
    )
  );


  /*
     Общее состояние.
  */

  localStorage.setItem(
    "groundAppState",
    JSON.stringify({

      grade:
        groundState.grade,

      campbellPage:
        campbellState.currentPage

    })
  );

}


/* =========================================================
   117. AUTO SAVE
========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    saveAllGroundData();

  }
);


/* =========================================================
   118. UPDATE NAVIGATION ACTIVE STATE
========================================================= */

function refreshNavigationState() {

  const active =
    getActiveScreen();


  if (!active) {
    return;
  }


  updateBottomNavigation(
    active
  );

}


/* =========================================================
   119. ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !== "Escape"
    ) {

      return;

    }


    const active =
      getActiveScreen();


    /*
       THEORY → CAMPBELL
    */

    if (
      active ===
      campbellTheoryScreen
    ) {

      saveCampbellPage();


      showScreen(
        campbellScreen
      );


      return;
    }


    /*
       EXAM → CAMPBELL
    */

    if (
      active ===
      campbellExamScreen
    ) {

      stopCampbellExamTimer();


      showScreen(
        campbellScreen
      );


      return;
    }


    /*
       RESULT → CAMPBELL
    */

    if (
      active ===
      campbellResultScreen
    ) {

      showScreen(
        campbellScreen
      );


      return;
    }


    /*
       REVIEW → RESULT
    */

    if (
      active ===
      campbellReviewScreen
    ) {

      showScreen(
        campbellResultScreen
      );


      return;
    }


    /*
       CAMPBELL → LIBRARY
    */

    if (
      active ===
      campbellScreen
    ) {

      showScreen(
        libraryScreen
      );


      return;
    }


    /*
       LIBRARY / PROFILE → HOME
    */

    if (
      active ===
        libraryScreen ||

      active ===
        profileScreen
    ) {

      showScreen(
        homeScreen
      );

    }

  }
);


/* =========================================================
   120. PREVENT DOUBLE CLICKS DURING TRANSITION
========================================================= */

let groundTransitionLocked =
  false;


function temporarilyLockTransition() {

  if (
    groundTransitionLocked
  ) {

    return false;

  }


  groundTransitionLocked =
    true;


  setTimeout(
    () => {

      groundTransitionLocked =
        false;

    },
    220
  );


  return true;

}


/* =========================================================
   121. INITIAL SCREEN
========================================================= */

function initializeGroundScreen() {

  const active =
    getActiveScreen();


  /*
     Если HTML уже имеет
     активный экран — оставляем его.
  */

  if (active) {

    restartScreenAnimation(
      active
    );


    updateBottomNavigation(
      active
    );


    return;
  }


  /*
     Если active нигде нет —
     открываем welcome.
  */

  if (
    welcomeScreen
  ) {

    welcomeScreen.classList.add(
      "active"
    );


    restartScreenAnimation(
      welcomeScreen
    );

  }

}


/* =========================================================
   122. FINAL APP INITIALIZATION
========================================================= */

function initializeGroundApp() {

  /*
     STATS
  */

  updateGlobalStats();


  /*
     ROAD
  */

  buildRoad();


  /*
     LIBRARY
  */

  buildLibrary();


  /*
     CAMPBELL
  */

  updateCampbellChapterScreen();


  updateCampbellReaderInfo();


  preloadCampbellNeighbours();


  /*
     PROFILE
  */

  updateProfile();


  /*
     SCREEN
  */

  initializeGroundScreen();


  /*
     NAV
  */

  refreshNavigationState();


  console.log(
    "GROUND: initialization complete"
  );

}


/* =========================================================
   123. START
========================================================= */

initializeGroundApp();


/* =========================================================
   124. DEBUG INFO

   Если Campbell опять не листается,
   в Console можно увидеть,
   нашлись ли элементы.
========================================================= */

console.log(
  "GROUND Campbell Reader:",
  {
    image:
      Boolean(
        campbellReaderImage
      ),

    previousButton:
      Boolean(
        campbellPrevButton
      ),

    nextButton:
      Boolean(
        campbellNextButton
      ),

    page:
      campbellState.currentPage
  }
);


/* =========================================================
   125. READY
========================================================= */

console.log(
  "================================"
);

console.log(
  "GROUND APP READY"
);

console.log(
  "Campbell pages:",
  `${campbellState.startPage}-${campbellState.endPage}`
);

console.log(
  "Current Campbell page:",
  campbellState.currentPage
);

console.log(
  "================================"
);


/* =========================================================
   END PART 6
========================================================= */
/* =========================================================
   GROUND — CAMPBELL IMAGE ZOOM
========================================================= */

const campbellZoomInButton =
  getById("campbellZoomInButton");

const campbellZoomOutButton =
  getById("campbellZoomOutButton");

const campbellZoomResetButton =
  getById("campbellZoomResetButton");

const campbellZoomValue =
  getById("campbellZoomValue");


let campbellZoom = 100;

const CAMPBELL_ZOOM_MIN = 50;
const CAMPBELL_ZOOM_MAX = 300;
const CAMPBELL_ZOOM_STEP = 25;


/* ========================================
   ОБНОВИТЬ ZOOM
======================================== */

function updateCampbellZoom() {

  if (!campbellReaderImage) {
    return;
  }

  campbellReaderImage.style.transform =
    `scale(${campbellZoom / 100})`;

  if (campbellZoomValue) {
    campbellZoomValue.textContent =
      `${campbellZoom}%`;
  }

  if (campbellZoomOutButton) {
    campbellZoomOutButton.disabled =
      campbellZoom <= CAMPBELL_ZOOM_MIN;
  }

  if (campbellZoomInButton) {
    campbellZoomInButton.disabled =
      campbellZoom >= CAMPBELL_ZOOM_MAX;
  }

}


/* ========================================
   ПРИБЛИЗИТЬ +
======================================== */

onClick(
  campbellZoomInButton,
  () => {

    if (
      campbellZoom >=
      CAMPBELL_ZOOM_MAX
    ) {
      return;
    }

    campbellZoom +=
      CAMPBELL_ZOOM_STEP;

    updateCampbellZoom();

  }
);


/* ========================================
   ОТДАЛИТЬ −
======================================== */

onClick(
  campbellZoomOutButton,
  () => {

    if (
      campbellZoom <=
      CAMPBELL_ZOOM_MIN
    ) {
      return;
    }

    campbellZoom -=
      CAMPBELL_ZOOM_STEP;

    updateCampbellZoom();

  }
);


/* ========================================
   СБРОСИТЬ
======================================== */

onClick(
  campbellZoomResetButton,
  () => {

    campbellZoom = 100;

    updateCampbellZoom();

  }
);


/* ========================================
   СТАРТОВОЕ ЗНАЧЕНИЕ
======================================== */

updateCampbellZoom();
