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


  /* ========================================
     КНОПКИ
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
    document.getElementById("librarySearchInput");


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
    document.getElementById("profileXPProgress");

  const profileLevelText =
    document.getElementById("profileLevelText");

  const profileCompletedLessons =
    document.getElementById(
      "profileCompletedLessons"
    );

  const achievementsContainer =
    document.getElementById(
      "achievementsContainer"
    );


  /* ========================================
     КАЛЕНДАРЬ
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
     ПЕРЕХОД
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


    changingScreen =
      true;


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


        changingScreen =
          false;

      }, 280);

    }, 250);

  }


  /* ========================================
     START
  ======================================== */

  startButton.addEventListener(
    "click",
    () => {

      changeScreen(
        welcomeScreen,
        pathScreen
      );

    }
  );


  pathBackButton.addEventListener(
    "click",
    () => {

      changeScreen(
        pathScreen,
        welcomeScreen
      );

    }
  );


  gradeBackButton.addEventListener(
    "click",
    () => {

      changeScreen(
        gradeScreen,
        pathScreen
      );

    }
  );


  /* ========================================
     НАПРАВЛЕНИЯ
  ======================================== */

  document
    .querySelectorAll(".path-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const path =
            card.dataset.path;


          if (
            path === "school"
          ) {

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


          if (
            path === "ent"
          ) {

            alert(
              "🎯 ЕНТ скоро добавим."
            );

            return;

          }


          alert(
            "🏆 Олимпиадный раздел скоро добавим."
          );

        }
      );

    });


  /* ========================================
     КЛАСС
  ======================================== */

  document
    .querySelectorAll(".grade-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          localStorage.setItem(
            "groundGrade",
            card.dataset.grade
          );


          updateUserInterface();


          changeScreen(
            gradeScreen,
            homeScreen
          );

        }
      );

    });


  changeGradeButton.addEventListener(
    "click",
    () => {

      changeScreen(
        homeScreen,
        gradeScreen
      );

    }
  );


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
     УРОК ПРОЙДЕН?
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


    if (
      lessonId === 1
    ) {

      return true;

    }


    return isLessonCompleted(
      grade,
      lessonId - 1
    );

  }


  /* ========================================
     ДОРОЖКА
  ======================================== */

  function buildLearningRoad() {

    learningRoad.innerHTML =
      "";


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


    courseTitle.textContent =
      course.title;


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
                ? `+${lesson.rewardXP} XP • +${lesson.rewardGenes} 🧬`
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


            window.openGroundLesson(
              lesson.id
            );

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

      return;

    }


    const lessons =
      window.GroundDB.getLessons(
        grade
      );


    const query =
      searchText
        .trim()
        .toLowerCase();


    const filtered =
      lessons.filter(lesson => {

        return (

          (
            lesson.title || ""
          )
            .toLowerCase()
            .includes(query)

          ||

          (
            lesson.description || ""
          )
            .toLowerCase()
            .includes(query)

        );

      });


    libraryLessons.innerHTML =
      "";


    if (
      filtered.length === 0
    ) {

      libraryLessons.innerHTML = `

        <div class="library-empty">
          🔎 Ничего не найдено
        </div>

      `;

      return;

    }


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

            window.openGroundLesson(
              lesson.id
            );

          }
        );


        libraryLessons.appendChild(
          card
        );

      }
    );

  }


  librarySearchInput.addEventListener(
    "input",
    () => {

      buildLibrary(
        librarySearchInput.value
      );

    }
  );


  /* ========================================
     АКТИВНОСТЬ
  ======================================== */

  function getLocalDateString(
    date
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

    catch {

      return [];

    }

  }


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


    /*
      JS:
      воскресенье = 0
      понедельник = 1

      переводим в:
      понедельник = 0
    */

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


    activityStreak.textContent =
      player.streak;


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


  /* ========================================
     ПРОЙДЕННЫЕ УРОКИ
  ======================================== */

  function getCompletedLessonsCount() {

    let total =
      0;


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
        localStorage.getItem(key) === "true"
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

    const achievements = [

      {
        icon: "🌱",
        title: "Первый шаг",
        description: "Пройди первый урок",
        unlocked: completed >= 1,
        progress: `${Math.min(completed,1)} / 1`
      },

      {
        icon: "🧬",
        title: "Исследователь",
        description: "Собери 25 генов",
        unlocked: player.genes >= 25,
        progress: `${Math.min(player.genes,25)} / 25`
      },

      {
        icon: "🧠",
        title: "Биолог",
        description: "Пройди 5 уроков",
        unlocked: completed >= 5,
        progress: `${Math.min(completed,5)} / 5`
      },

      {
        icon: "🔥",
        title: "В ритме",
        description: "Достигни серии 3 дня",
        unlocked: player.streak >= 3,
        progress: `${Math.min(player.streak,3)} / 3`
      },

      {
        icon: "⚡",
        title: "Неделя силы",
        description: "Достигни серии 7 дней",
        unlocked: player.streak >= 7,
        progress: `${Math.min(player.streak,7)} / 7`
      },

      {
        icon: "⭐",
        title: "Новый уровень",
        description: "Достигни 2 уровня",
        unlocked: player.level >= 2,
        progress: `${Math.min(player.level,2)} / 2`
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
     ПРОФИЛЬ
  ======================================== */

  function updateProfile() {

    const player =
      getPlayerData();


    const completed =
      getCompletedLessonsCount();


    const xp =
      player.xp % 100;


    profileGrade.textContent =
      `${player.grade} класс`;


    profileLevel.textContent =
      player.level;


    profileGenes.textContent =
      player.genes;


    profileStreak.textContent =
      player.streak;


    profileXP.textContent =
      xp;


    profileXPProgress.style.width =
      `${xp}%`;


    profileLevelText.textContent =
      `Уровень ${player.level}`;


    profileCompletedLessons.textContent =
      completed;


    buildActivityWeek();


    buildAchievements(
      player,
      completed
    );

  }


  /* ========================================
     ОБНОВЛЕНИЕ UI
  ======================================== */

  function updateUserInterface() {

    const player =
      getPlayerData();


    currentGrade.textContent =
      `${player.grade} класс`;


    document
      .querySelectorAll(
        ".gene-value"
      )
      .forEach(element => {

        element.textContent =
          player.genes;

      });


    xpValue.textContent =
      player.xp % 100;


    levelValue.textContent =
      player.level;


    streakValue.textContent =
      player.streak;


    xpProgress.style.width =
      `${player.xp % 100}%`;


    buildLearningRoad();


    if (
      profileScreen.classList.contains(
        "active"
      )
    ) {

      updateProfile();

    }

  }


  /* ========================================
     НАВИГАЦИЯ
  ======================================== */

  const homeLibraryButton =
    document.querySelector(
      '#homeScreen [data-nav="library"]'
    );


  homeLibraryButton.addEventListener(
    "click",
    () => {

      librarySearchInput.value =
        "";


      buildLibrary();


      changeScreen(
        homeScreen,
        libraryScreen
      );

    }
  );


  const homeProfileButton =
    document.querySelector(
      '#homeScreen [data-nav="profile"]'
    );


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


  document
    .querySelector(
      '#homeScreen [data-nav="road"]'
    )
    .addEventListener(
      "click",
      () => {

        learningRoad.scrollIntoView({
          behavior: "smooth"
        });

      }
    );


  document
    .querySelector(
      ".library-home-button"
    )
    .addEventListener(
      "click",
      () => {

        updateUserInterface();


        changeScreen(
          libraryScreen,
          homeScreen
        );

      }
    );


  document
    .querySelector(
      ".library-road-button"
    )
    .addEventListener(
      "click",
      () => {

        changeScreen(
          libraryScreen,
          homeScreen
        );


        setTimeout(() => {

          learningRoad.scrollIntoView({
            behavior: "smooth"
          });

        }, 400);

      }
    );


  document
    .querySelector(
      ".library-profile-button"
    )
    .addEventListener(
      "click",
      () => {

        updateProfile();


        changeScreen(
          libraryScreen,
          profileScreen
        );

      }
    );


  document
    .querySelector(
      ".profile-home-button"
    )
    .addEventListener(
      "click",
      () => {

        updateUserInterface();


        changeScreen(
          profileScreen,
          homeScreen
        );

      }
    );


  document
    .querySelector(
      ".profile-library-button"
    )
    .addEventListener(
      "click",
      () => {

        buildLibrary();


        changeScreen(
          profileScreen,
          libraryScreen
        );

      }
    );


  document
    .querySelector(
      ".profile-road-button"
    )
    .addEventListener(
      "click",
      () => {

        changeScreen(
          profileScreen,
          homeScreen
        );


        setTimeout(() => {

          learningRoad.scrollIntoView({
            behavior: "smooth"
          });

        }, 400);

      }
    );


  document
    .getElementById(
      "settingsButton"
    )
    .addEventListener(
      "click",
      () => {

        alert(
          "⚙️ Настройки сделаем позже."
        );

      }
    );


  /* ========================================
     PLAYER UPDATE
  ======================================== */

  window.updateGroundUI =
    function () {

      updateUserInterface();

    };


  /* ========================================
     ЗАПУСК
  ======================================== */

  updateUserInterface();

});