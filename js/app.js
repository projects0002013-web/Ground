/* Ground — static study app. All learner data stays in this browser. */
(() => {
  "use strict";
  const DB = window.GroundDB;
  const P = window.GroundPlayer;
  const STORAGE = "ground.v2";
  const app = document.getElementById("app");
  const dialog = document.getElementById("dialog");
  const defaults = () => ({
    version: 2,
    onboarded: false,
    name: "Биолог",
    course: "8",
    layout: "auto",
    xp: 0,
    genes: 0,
    completed: {},
    days: [],
    history: [],
    bookPage: 0,
    bookRead: [],
    scanPage: 47,
    session: null,
    lastResult: null,
  });
  let storageAvailable = true;
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE) || "null");
      if (!value || value.version !== 2) return migrateLegacy();
      const base = defaults();
      for (const key of [
        "onboarded",
        "name",
        "course",
        "layout",
        "xp",
        "genes",
        "bookPage",
        "scanPage",
      ]) {
        if (typeof value[key] === typeof base[key]) base[key] = value[key];
      }
      base.layout = ["auto", "laptop", "phone"].includes(base.layout)
        ? base.layout
        : "auto";
      base.name = base.name.slice(0, 40) || "Биолог";
      base.course = DB.courses[base.course] ? base.course : "8";
      base.xp = Number.isFinite(base.xp) ? Math.max(0, base.xp) : 0;
      base.genes = Number.isFinite(base.genes) ? Math.max(0, base.genes) : 0;
      base.bookPage = Math.max(0, Math.min(3, Math.floor(base.bookPage)));
      base.scanPage = base.scanPage === 48 ? 48 : 47;
      base.days = Array.isArray(value.days)
        ? value.days.filter(
            (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v),
          )
        : [];
      base.bookRead = Array.isArray(value.bookRead)
        ? [
            ...new Set(
              value.bookRead.filter(
                (v) => Number.isInteger(v) && v >= 0 && v < 4,
              ),
            ),
          ]
        : [];
      base.completed = validCompleted(value.completed) ? value.completed : {};
      base.history = Array.isArray(value.history)
        ? value.history.filter(validResult).slice(0, 50)
        : [];
      base.lastResult = validResult(value.lastResult) ? value.lastResult : null;
      base.session = validSession(value.session) ? value.session : null;
      return base;
    } catch {
      storageAvailable = false;
      return defaults();
    }
  }
  function migrateLegacy() {
    const base = defaults();
    const old = JSON.parse(localStorage.getItem("groundAppState") || "null");
    const grade = old?.grade || localStorage.getItem("groundSelectedGrade");
    if (DB.courses[grade]) {
      base.course = String(grade);
      base.onboarded = true;
    }
    for (const [key, legacy] of [
      ["xp", "groundXP"],
      ["genes", "groundGenes"],
    ]) {
      const value = Number(localStorage.getItem(legacy) || 0);
      if (Number.isFinite(value)) base[key] = Math.max(0, value);
    }
    for (const grade of ["7", "8", "9", "10", "11"]) {
      const ids = grade === "8" ? { 1: 1, 2: 4 } : { 1: 1, 2: 2, 3: 3 };
      for (const [oldId, newId] of Object.entries(ids)) {
        if (
          localStorage.getItem(`ground_${grade}_lesson_${oldId}_complete`) ===
            "true" &&
          DB.courses[grade].lessons.some((l) => l.id === newId && !l.challenge)
        ) {
          base.completed[`${grade}:${newId}`] = {
            percent: 100,
            at: new Date().toISOString(),
          };
        }
      }
    }
    const last = localStorage.getItem("groundLastStudyDate");
    if (last && /^\d{4}-\d{2}-\d{2}$/.test(last)) base.days.push(last);
    return base;
  }
  function validAnswer(a) {
    return (
      a &&
      typeof a.question === "string" &&
      Array.isArray(a.options) &&
      a.options.length > 0 &&
      a.options.every((x) => typeof x === "string") &&
      Number.isInteger(a.selected) &&
      a.selected >= 0 &&
      a.selected < a.options.length &&
      Number.isInteger(a.correct) &&
      a.correct >= 0 &&
      a.correct < a.options.length &&
      typeof a.explanation === "string" &&
      validTable(a.table)
    );
  }
  function validTable(t) {
    return (
      t == null ||
      (Array.isArray(t.headers) &&
        t.headers.every((x) => typeof x === "string") &&
        Array.isArray(t.rows) &&
        t.rows.every(
          (row) =>
            Array.isArray(row) &&
            row.length === t.headers.length &&
            row.every((x) => typeof x === "string"),
        ))
    );
  }
  function validActivityRef(activity) {
    if (!activity || typeof activity.key !== "string") return false;
    if (activity.kind === "book")
      return (
        activity.key === "book:chemistry" &&
        activity.courseKey === "book" &&
        activity.lessonId === "chemistry"
      );
    if (!DB.courses[activity.courseKey]) return false;
    if (activity.kind === "practice")
      return (
        activity.lessonId === "practice" &&
        activity.key === `${activity.courseKey}:practice`
      );
    return (
      ["lesson", "challenge"].includes(activity.kind) &&
      activity.key === `${activity.courseKey}:${activity.lessonId}` &&
      DB.courses[activity.courseKey].lessons.some(
        (l) =>
          l.id === activity.lessonId &&
          Boolean(l.challenge) === (activity.kind === "challenge"),
      )
    );
  }
  function validResult(r) {
    return (
      validActivityRef(r) &&
      typeof r.title === "string" &&
      typeof r.completedAt === "string" &&
      Number.isFinite(Date.parse(r.completedAt)) &&
      typeof r.day === "string" &&
      ["lesson", "challenge", "practice", "book"].includes(r.kind) &&
      ["correct", "total", "percent", "rewardXP", "rewardGenes"].every(
        (k) => Number.isFinite(r[k]) && r[k] >= 0,
      ) &&
      r.percent <= 100 &&
      r.correct <= r.total &&
      typeof r.passed === "boolean" &&
      Array.isArray(r.answers) &&
      r.answers.every(validAnswer) &&
      r.answers.length <= r.total &&
      (r.durationSeconds == null ||
        (Number.isFinite(r.durationSeconds) && r.durationSeconds >= 0))
    );
  }
  function validCompleted(c) {
    return (
      c &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      Object.entries(c).every(([key, v]) => {
        const [course, id] = key.split(":");
        return (
          (key === "book:chemistry" ||
            DB.courses[course]?.lessons.some((l) => String(l.id) === id)) &&
          v &&
          Number.isFinite(v.percent) &&
          v.percent >= 0 &&
          v.percent <= 100 &&
          typeof v.at === "string"
        );
      })
    );
  }
  function validSession(s) {
    return (
      validActivityRef(s) &&
      typeof s.title === "string" &&
      typeof s.key === "string" &&
      typeof s.courseKey === "string" &&
      ["lesson", "challenge", "practice", "book"].includes(s.kind) &&
      Array.isArray(s.steps) &&
      s.steps.length > 0 &&
      s.steps.every(
        (x) =>
          x &&
          ["theory", "question"].includes(x.type) &&
          (x.type === "theory"
            ? typeof x.title === "string" && typeof x.text === "string"
            : typeof x.question === "string" &&
              Array.isArray(x.answers) &&
              x.answers.length > 0 &&
              x.answers.every((a) => typeof a === "string") &&
              Number.isInteger(x.correct) &&
              x.correct >= 0 &&
              x.correct < x.answers.length &&
              typeof x.explanation === "string" &&
              validTable(x.table)),
      ) &&
      Number.isInteger(s.step) &&
      s.step >= 0 &&
      s.step < s.steps.length &&
      Array.isArray(s.answers) &&
      s.answers.every(validAnswer) &&
      (s.selected === null ||
        (Number.isInteger(s.selected) &&
          s.selected >= 0 &&
          s.selected < (s.steps[s.step].answers?.length || 0))) &&
      typeof s.checked === "boolean" &&
      ["rewardXP", "rewardGenes"].every(
        (k) => s[k] == null || (Number.isFinite(s[k]) && s[k] >= 0),
      ) &&
      Number.isFinite(s.startedAt) &&
      (s.deadline === null || Number.isFinite(s.deadline))
    );
  }
  const state = load();
  let view = state.onboarded ? "home" : "welcome";
  let libraryFilter = "all";
  let libraryQuery = "";
  let selectedTrack = "school";
  let lastFocus = null;
  let toastTimer;
  let timer;
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const e = escape;
  const attr = escape;
  const course = () => DB.courses[state.course];
  const courseLabel = () =>
    course().track === "school" ? `${state.course} класс` : course().title;
  const level = () => Math.floor(state.xp / 100) + 1;
  const button = (text, action, options = "") =>
    `<button class="button" data-action="${action}" ${options}>${text}</button>`;
  function persist() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
    } catch {
      if (storageAvailable)
        toast(
          "Не удалось сохранить прогресс. Проверь доступное место и настройки браузера.",
        );
      storageAvailable = false;
    }
  }
  function toast(message) {
    const node = document.getElementById("toast");
    node.textContent = message;
    node.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("visible"), 4500);
  }
  function openDialog(content) {
    lastFocus = document.activeElement;
    dialog.innerHTML = content;
    dialog.showModal();
  }
  function closeDialog() {
    dialog.close();
    if (lastFocus?.isConnected) lastFocus.focus();
  }
  function navigate(next) {
    view = next;
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    const heading = document.querySelector("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  function brand() {
    return '<span class="brand-symbol" aria-hidden="true">❧</span><span>GROUND<small>ИЗУЧАЙ ЖИВОЕ</small></span>';
  }
  function shell(content) {
    const nav = [
      ["home", "⌂", "Главная"],
      ["road", "⌁", "Дорожка"],
      ["practice", "✧", "Практика"],
      ["library", "▤", "Библиотека"],
      ["profile", "◉", "Профиль"],
    ];
    return `<aside class="sidebar"><a class="brand" href="#home" data-action="nav" data-view="home" aria-label="Ground — главная">${brand()}</a><nav aria-label="Основное меню">${nav.map(([id, icon, label]) => `<button class="nav-link ${view === id ? "active" : ""}" data-action="nav" data-view="${id}" ${view === id ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</button>`).join("")}</nav><div class="sidebar-bottom"><div class="sidebar-note"><strong>Маленький шаг. Большое открытие.</strong><p>Всего один урок в день — и биология становится понятнее.</p></div><button class="user-chip" data-action="nav" data-view="profile"><span class="avatar">${e(state.name.charAt(0).toUpperCase())}</span><span><strong>${e(state.name)}</strong><small>Уровень ${level()} · ${e(courseLabel())}</small></span></button></div></aside><div class="shell"><header class="topbar"><div class="mobile-brand brand"><span class="brand-symbol">❧</span>GROUND</div><span class="topbar-label">Твоё пространство для открытий</span><div class="stats"><button class="course-switch" data-action="choose-course">${e(courseLabel())} ⌄</button><div class="stat" title="Серия дней занятий"><span aria-hidden="true">🔥</span><span>${P.streak(state.days)}</span><small>дней</small></div><div class="stat" title="Гены"><span aria-hidden="true">🧬</span><span>${state.genes}</span></div><div class="stat" title="Опыт"><span aria-hidden="true">✦</span><span>${state.xp}</span><small>XP</small></div></div></header><main id="main" class="content">${content}</main></div>`;
  }
  function heading(title, description, extra = "") {
    return `<div class="page-heading"><div><div class="eyebrow">GROUND / ${e(courseLabel())}</div><h1>${title}</h1><p>${description}</p></div>${extra}</div>`;
  }
  function nextLesson() {
    return (
      course().lessons.find(
        (l) => !state.completed[`${state.course}:${l.id}`],
      ) || course().lessons[0]
    );
  }
  function progressCard() {
    return `<div class="progress-card"><div class="level-icon" aria-hidden="true">✦</div><div class="grow"><div class="flex-between"><strong>Уровень ${level()}</strong><small class="muted">${state.xp % 100} / 100 XP</small></div><div class="progress" role="progressbar" aria-label="Опыт до следующего уровня" aria-valuenow="${state.xp % 100}" aria-valuemin="0" aria-valuemax="100"><span style="width:${state.xp % 100}%"></span></div></div></div>`;
  }
  function resumeBanner() {
    return state.session
      ? `<div class="resume"><div><strong>Ты остановился на «${e(state.session.title)}»</strong><p>Продолжи с того же места${state.session.deadline ? " • время испытания продолжает идти" : ""}.</p></div>${button("Продолжить →", "resume")}</div>`
      : "";
  }
  function road(compact = false) {
    const lessons = compact ? course().lessons.slice(0, 3) : course().lessons;
    return `<div class="road ${compact ? "compact" : ""}">${lessons
      .map((l) => {
        const done = state.completed[`${state.course}:${l.id}`];
        const unlocked = P.unlocked(
          course(),
          l.id,
          state.completed,
          state.course,
        );
        const status = done ? "completed" : unlocked ? "available" : "locked";
        return `<div class="road-item ${status}"><button class="road-node ${status}" data-action="start-lesson" data-id="${l.id}" aria-label="${attr(l.title)} — ${done ? "пройден" : unlocked ? "доступен" : "закрыт"}">${done ? "✓" : unlocked ? l.icon : "🔒"}</button><div class="road-info"><div class="eyebrow">${l.challenge ? "ФИНАЛЬНОЕ ИСПЫТАНИЕ" : `УРОК ${l.id}`}</div><h3>${e(l.title)}</h3><p>${e(l.description)}</p>${done ? `<span class="pill">✓ ${done.percent}% · пройден</span>` : unlocked ? `<span class="pill">+${l.rewardXP} XP · +${l.rewardGenes} 🧬</span>` : ""}</div></div>`;
      })
      .join("")}</div>`;
  }
  function dailyCard() {
    const today = P.dayKey();
    const dailyCount = state.history.filter((h) => h.day === today).length;
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + i);
      return d;
    });
    return `<section class="panel daily ${dailyCount ? "complete" : ""}"><div class="flex-between"><h3>Твой ритм</h3><span aria-hidden="true">🔥</span></div><div class="large-number">${P.streak(state.days)} <span style="font-size:16px;letter-spacing:0">${P.streak(state.days) === 1 ? "день" : "дней"}</span></div><p>Каждый день — немного ближе к цели.</p><div class="week">${days.map((d, i) => `<div class="day ${state.days.includes(P.dayKey(d)) ? "done" : ""} ${P.dayKey(d) === today ? "today" : ""}"><span>${state.days.includes(P.dayKey(d)) ? "✓" : d.getDate()}</span>${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}</div>`).join("")}</div><div class="flex-between"><small>Цель на сегодня</small><small class="metric">${Math.min(1, dailyCount)} / 1 урок</small></div><div class="progress"><span style="width:${dailyCount ? 100 : 0}%"></span></div><p class="goal-count">${dailyCount ? "Отлично! Сегодня ты уже позанимался." : "Начни урок — поддержи свою серию."}</p></section>`;
  }
  function home() {
    const next = nextLesson();
    const allDone = course().lessons.every(
      (l) => state.completed[`${state.course}:${l.id}`],
    );
    return shell(
      `${heading("Продолжим открытия?", `Привет, ${e(state.name)}. Сегодня отличный день для биологии.`, `<span class="pill">● ${e(courseLabel())}</span>`)}${resumeBanner()}<div class="dashboard-grid"><div class="main-column"><section class="hero"><div class="hero-copy"><span class="hero-tag">${allDone ? "КУРС ПРОЙДЕН · ПОВТОРЕНИЕ" : "ТВОЙ СЛЕДУЮЩИЙ ШАГ"}</span><h2>${e(next.title)}</h2><p>${e(next.description)}. Теория, практика и маленькое открытие в конце.</p>${button(allDone ? "Повторить урок →" : "Начать урок →", "start-lesson", `data-id="${next.id}"`)}</div><span class="hero-decoration" aria-hidden="true">✧</span><img class="mascot-hero" src="images/mascot.png" alt="Чёрный кот-учёный в лабораторном халате"></section>${progressCard()}<section class="section"><div class="panel-header"><h2>Твоя дорожка</h2><button class="text-link" data-action="nav" data-view="road">Все уроки →</button></div>${road(true)}</section></div><aside class="side-column">${dailyCard()}<section class="panel tip"><div class="tip-icon">✧</div><div class="eyebrow">ЗНАЕШЬ ЛИ ТЫ?</div><h3>Мир начинается с клетки</h3><p>Даже огромный синий кит когда-то был одной клеткой. Большие открытия начинаются с малого.</p><button class="text-link" data-action="nav" data-view="library">Узнать больше →</button></section><section class="panel mini-book"><span class="eyebrow">НА ПОЛКЕ</span><h3>Химия жизни</h3><p>Четыре коротких раздела об атомах, связях и воде.</p><button class="text-link" data-action="read-book">Открыть конспект →</button></section></aside></div>`,
    );
  }
  function roadPage() {
    const done = course().lessons.filter(
      (l) => state.completed[`${state.course}:${l.id}`],
    ).length;
    return shell(
      `${heading("Твой путь в биологии", "Изучай тему, применяй знания и открывай следующий этап.", `<div class="heading-actions"><button class="button secondary small" data-action="choose-course">Сменить курс</button></div>`)}${resumeBanner()}<div class="panel flex-between"><strong>${e(course().title)}</strong><span class="muted">${done} / ${course().lessons.length} пройдено</span></div>${road()}`,
    );
  }
  function welcome() {
    return `<div class="welcome"><header class="welcome-header"><div class="brand">${brand()}</div><span class="pill">БИОЛОГИЯ В НОВОМ РИТМЕ</span></header><main id="main" class="welcome-body"><div class="welcome-copy"><div class="eyebrow">ДЛЯ ТВОИХ БОЛЬШИХ ОТКРЫТИЙ</div><h1>Жизнь удивляет.<br><em>Пойми, как<br>она устроена.</em></h1><p>Изучай биологию маленькими шагами. Применяй знания, открывай уровни и расти вместе с Ground.</p>${button("Начать своё путешествие →", "choose-course")}<div class="welcome-features"><span>✓ Короткие уроки</span><span>✓ Практика и объяснения</span><span>✓ Твой прогресс</span></div></div><div class="welcome-art"><img src="images/mascot.png" alt="Твой спутник — кот-учёный Ground"><div class="float-chip">🧬 +5 генов за открытие</div><div class="float-chip">✦ С каждым уроком умнее</div></div></main><footer class="welcome-footer"><span>ИЗУЧАЙ. ПОНИМАЙ. ПРИМЕНЯЙ.</span><span>7–11 классы · ЕНТ · Олимпиады</span></footer></div>`;
  }
  function tracks() {
    return `<div class="welcome"><header class="welcome-header"><div class="brand">${brand()}</div><button class="button secondary small" data-action="onboard-back">← Назад</button></header><main id="main" class="onboarding"><div class="page-heading"><div class="eyebrow">ШАГ 1 / ТВОЁ НАПРАВЛЕНИЕ</div><h1>С чего начнём?</h1><p>Выбери путь. Его можно сменить в любой момент.</p></div><div class="cards">${[
      [
        "school",
        "📚",
        "Школьная биология",
        "Курсы 7–11 классов. От строения клетки до эволюции.",
      ],
      [
        "ent",
        "🎯",
        "Подготовка к ЕНТ",
        "Тематические вопросы, генетические задачи и итоговый тест.",
      ],
      [
        "olympiad",
        "🔬",
        "Олимпиада",
        "Биологические кейсы, эксперименты и работа с данными.",
      ],
    ]
      .map(
        ([id, icon, title, text]) =>
          `<button class="track-card" data-action="select-track" data-track="${id}"><span class="symbol">${icon}</span><h2>${title}</h2><p>${text}</p><span class="arrow">Выбрать направление →</span></button>`,
      )
      .join("")}</div></main></div>`;
  }
  function grades() {
    return `<div class="welcome"><header class="welcome-header"><div class="brand">${brand()}</div><button class="button secondary small" data-action="choose-course">← Направления</button></header><main id="main" class="onboarding"><div class="page-heading"><div class="eyebrow">ШАГ 2 / ТВОЙ КУРС</div><h1>В каком ты классе?</h1><p>Можно выбрать любой курс, который тебе интересен.</p></div><div class="grade-grid">${[7, 8, 9, 10, 11].map((g) => `<button class="grade-card" data-action="select-course" data-course="${g}"><strong>${g}</strong><span>класс</span></button>`).join("")}</div><div class="panel section"><p>Не знаешь, с чего начать? В 8 классе разберём прокариот и эукариот, типы клеток и органоиды.</p></div></main></div>`;
  }
  function bookCards() {
    const list = [
      {
        id: "book",
        filter: "notes",
        action: "read-book",
        title: DB.book.title,
        description:
          "Авторский конспект: атомы, связи, вода и pH. Прочитай и проверь себя.",
        tag: "КОНСПЕКТ",
        cover: "Химия жизни",
        icon: "⚗",
        meta: `${state.bookRead.length}/4 раздела`,
        color: "",
      },
      {
        id: "course",
        filter: "notes",
        action: "show-course-materials",
        title: course().title,
        description:
          "Короткая теория и задания текущего курса. Возвращайся к сложным темам.",
        tag: "ТВОЙ КУРС",
        cover: "Мир живого",
        icon: "❧",
        meta: `${course().lessons.length - 1} тем`,
        color: "gold",
      },
      {
        id: "scans",
        filter: "books",
        action: "read-scans",
        title: "Campbell Biology",
        description:
          "Два имеющихся изображения страниц 47 и 48. Полная глава пока не добавлена.",
        tag: "ФРАГМЕНТ",
        cover: "Campbell Biology",
        icon: "🧬",
        meta: "2 страницы",
        color: "blue",
      },
    ];
    return list
      .filter(
        (item) =>
          (libraryFilter === "all" || item.filter === libraryFilter) &&
          `${item.title} ${item.description}`
            .toLocaleLowerCase("ru")
            .includes(libraryQuery.toLocaleLowerCase("ru")),
      )
      .map(
        (item) =>
          `<button class="book-card" data-action="${item.action}"><div class="book-cover ${item.color}"><small>GROUND LIBRARY</small><strong>${item.cover}</strong><span class="book-icon" aria-hidden="true">${item.icon}</span></div><span class="eyebrow">${item.tag}</span><h3>${e(item.title)}</h3><p>${e(item.description)}</p><div class="card-footer"><span>${item.meta}</span><span>Открыть →</span></div></button>`,
      )
      .join("");
  }
  function courseMaterials() {
    return course()
      .lessons.filter(
        (l) =>
          !l.challenge &&
          (l.title + " " + l.description)
            .toLocaleLowerCase("ru")
            .includes(libraryQuery.toLocaleLowerCase("ru")),
      )
      .map(
        (l) =>
          `<button class="lesson-row" data-action="lesson-note" data-id="${l.id}"><span class="symbol">${l.icon}</span><span><strong>${e(l.title)}</strong><p>${e(l.description)}</p></span><span class="arrow">→</span></button>`,
      )
      .join("");
  }
  function libraryResults() {
    const cards = bookCards();
    const rows = libraryFilter !== "books" ? courseMaterials() : "";
    return `${cards ? `<div class="cards">${cards}</div>` : ""}${rows ? `<section class="section"><div class="panel-header"><h2>Темы твоего курса</h2><small class="muted">Читай и повторяй</small></div><div class="lesson-list">${rows}</div></section>` : ""}${!cards && !rows ? '<div class="empty">Ничего не найдено. Попробуй другое название темы.</div>' : ""}`;
  }
  function library() {
    return shell(
      `${heading("Полка для любопытных", "Чуть больше глубины. Чуть больше понимания.")}<div class="search-wrap"><label class="sr-only" for="library-search">Найти материал</label><input class="input" id="library-search" type="search" placeholder="Найти книгу или тему…" value="${attr(libraryQuery)}" autocomplete="off"></div><div class="filter-row" aria-label="Тип материалов">${[
        ["all", "Все материалы"],
        ["notes", "Конспекты и темы"],
        ["books", "Книги"],
      ]
        .map(
          ([id, label]) =>
            `<button class="filter ${libraryFilter === id ? "active" : ""}" data-action="library-filter" data-filter="${id}" aria-pressed="${libraryFilter === id}">${label}</button>`,
        )
        .join("")}</div><div id="library-results">${libraryResults()}</div>`,
    );
  }
  function practice() {
    const wrong = state.history.flatMap((h) =>
      h.answers.filter((a) => a.selected !== a.correct),
    );
    return shell(
      `${heading("Знания любят практику", "Пробуй, ошибайся, разбирайся — и пробуй снова.")} ${resumeBanner()}<div class="two-col"><section class="panel practice-banner"><span class="eyebrow">БЕЗ СПЕШКИ</span><h2>Тренировка по курсу</h2><p>Смешанные вопросы курса «${e(course().title)}». Получи объяснение после каждого ответа. Тренировки поддерживают серию занятий; XP начисляется за уроки.</p>${button("Начать тренировку →", "start-practice")}</section><section class="panel practice-banner"><span class="eyebrow">РАБОТА НАД ОШИБКАМИ</span><h2>Преврати ошибки в открытия</h2><p>${wrong.length ? `В истории есть ${wrong.length} ответов, которые стоит повторить. Отработаем их без таймера.` : "Здесь появятся вопросы, в которых ты ошибся. Каждая ошибка — подсказка, что повторить."}</p>${button("Повторить ошибки →", "practice-errors", wrong.length ? "" : "disabled")}</section></div><section class="section"><div class="panel-header"><h2>Последние попытки</h2><small class="muted">Результаты и объяснения</small></div>${historyRows(8)}</section>`,
    );
  }
  function historyRows(limit = 6) {
    return state.history.length
      ? `<div class="panel">${state.history
          .slice(0, limit)
          .map(
            (h, i) =>
              `<div class="activity"><div><strong>${e(h.title)}</strong><p>${new Date(h.completedAt).toLocaleDateString("ru-RU")} · ${h.kind === "practice" ? "Тренировка" : h.passed ? "Пройдено" : "Нужно повторить"}</p></div><div><div class="score">${h.correct}/${h.total} · ${h.percent}%</div><button class="text-link" data-action="history-review" data-index="${i}">Разобрать</button></div></div>`,
          )
          .join("")}</div>`
      : '<div class="empty">Первое открытие ещё впереди. Заверши урок — и здесь появится результат.</div>';
  }
  function profile() {
    const completed = Object.keys(state.completed).length;
    const streak = P.streak(state.days);
    const achievements = [
      ["🌱", "Первое открытие", "Пройди один урок", completed >= 1],
      ["🧬", "Исследователь", "Пройди пять уроков", completed >= 5],
      ["🔥", "В своём ритме", "Занимайся три дня подряд", streak >= 3],
      [
        "🏆",
        "Проверка пройдена",
        "Пройди итоговое испытание",
        Object.keys(state.completed).some((k) => {
          const [c, id] = k.split(":");
          return DB.courses[c]?.lessons.find((l) => l.id === Number(id))
            ?.challenge;
        }),
      ],
    ];
    return shell(
      `${heading("Твои маленькие победы", "Знания растут. И ты вместе с ними.", `<button class="button secondary small" data-action="edit-profile">Настройки</button>`)}<section class="profile-hero"><div class="profile-picture"><img src="images/mascot.png" alt="Кот-учёный Ground"></div><div><div class="eyebrow">ИССЛЕДОВАТЕЛЬ ЖИВОГО</div><h2>${e(state.name)}</h2><p>${e(courseLabel())} · Уровень ${level()}</p></div></section><div class="metrics-grid">${[
        ["✦", state.xp, "опыта XP"],
        ["🧬", state.genes, "генов"],
        ["🔥", streak, "дней подряд"],
        ["✓", completed, "пройдено уроков"],
      ]
        .map(
          ([icon, n, label]) =>
            `<div class="metric-card"><span aria-hidden="true">${icon}</span><strong class="number">${n}</strong><small>${label}</small></div>`,
        )
        .join(
          "",
        )}</div>${progressCard()}<div class="two-col section"><section class="panel"><div class="panel-header"><h2>Достижения</h2><small class="muted">${achievements.filter((a) => a[3]).length}/4</small></div>${achievements.map(([icon, title, text, done]) => `<div class="achievement ${done ? "" : "locked"}"><div class="achievement-icon">${icon}</div><div><strong>${title}</strong><p>${done ? "✓ Получено" : text}</p></div></div>`).join("")}</section><section><div class="panel-header"><h2>История открытий</h2></div>${historyRows(4)}</section></div><p class="local-note">${storageAvailable ? "Прогресс сохраняется в этом браузере на этом устройстве. Экспортируй резервную копию в настройках, чтобы перенести его." : "Хранилище браузера недоступно. Прогресс сохранится только до закрытия страницы; используй экспорт в настройках."} Облачной регистрации в этой версии нет.</p>`,
    );
  }
  function table(data) {
    return data
      ? `<table class="data-table"><thead><tr>${data.headers.map((h) => `<th scope="col">${e(h)}</th>`).join("")}</tr></thead><tbody>${data.rows.map((row) => `<tr>${row.map((cell) => `<td>${e(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      : "";
  }
  function shuffle(items) {
    const array = items.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function createSession(lesson, courseKey, kind = "lesson") {
    return {
      key: kind === "book" ? "book:chemistry" : `${courseKey}:${lesson.id}`,
      courseKey,
      lessonId: lesson.id,
      title: lesson.title,
      kind,
      steps: P.steps(
        lesson,
        kind === "challenge" || kind === "practice" || kind === "book",
      ).map((step) => {
        if (step.type !== "question") return step;
        const order = shuffle(step.answers.map((_, i) => i));
        return {
          ...step,
          answers: order.map((i) => step.answers[i]),
          correct: order.indexOf(step.correct),
        };
      }),
      step: 0,
      answers: [],
      selected: null,
      checked: false,
      rewardXP: lesson.rewardXP,
      rewardGenes: lesson.rewardGenes,
      startedAt: Date.now(),
      deadline:
        kind === "challenge" || kind === "book"
          ? Date.now() + 5 * 60 * 1000
          : null,
    };
  }
  function replaceSession(start) {
    if (state.session) {
      openDialog(
        `<h2>У тебя есть начатое занятие</h2><p>Можно продолжить его или начать новое. При начале нового незавершённая попытка будет удалена.</p><div class="dialog-actions"><button class="button secondary" data-action="dialog-resume">Продолжить</button><button class="button" id="replace-session">Начать новое</button></div>`,
      );
      document.getElementById("replace-session").addEventListener(
        "click",
        () => {
          closeDialog();
          start();
        },
        { once: true },
      );
    } else start();
  }
  function startLesson(id) {
    const l = course().lessons.find((l) => l.id === Number(id));
    if (!l) return;
    if (!P.unlocked(course(), l.id, state.completed, state.course)) {
      toast("Сначала пройди предыдущий урок — и этот этап откроется.");
      return;
    }
    if (
      state.session?.key === `${state.course}:${l.id}` &&
      state.session.kind !== "practice"
    ) {
      navigate("lesson");
      return;
    }
    replaceSession(() => {
      state.session = createSession(
        l,
        state.course,
        l.challenge ? "challenge" : "lesson",
      );
      persist();
      navigate("lesson");
    });
  }
  function startPractice(errorsOnly = false) {
    let questions;
    if (errorsOnly) {
      const seen = new Set();
      questions = state.history
        .flatMap((h) => h.answers.filter((a) => a.selected !== a.correct))
        .filter((a) => {
          if (seen.has(a.question)) return false;
          seen.add(a.question);
          return true;
        })
        .slice(0, 12)
        .map((a) => ({
          question: a.question,
          answers: a.options,
          correct: a.correct,
          explanation: a.explanation,
          table: a.table,
        }));
    } else
      questions = course()
        .lessons.filter((l) => !l.challenge)
        .flatMap((l) => l.questions)
        .slice();
    if (!errorsOnly) questions = shuffle(questions).slice(0, 10);
    if (!questions.length) {
      toast("Пока нет вопросов для повторения.");
      return;
    }
    const l = {
      id: "practice",
      title: errorsOnly ? "Работа над ошибками" : "Тренировка по курсу",
      questions,
    };
    replaceSession(() => {
      state.session = createSession(l, state.course, "practice");
      persist();
      navigate("lesson");
    });
  }
  function lessonView() {
    const s = state.session;
    if (!s) {
      view = "home";
      return home();
    }
    if (s.deadline && s.deadline <= Date.now()) {
      finishSession(true);
      return resultView();
    }
    const step = s.steps[s.step];
    const total = s.steps.filter((x) => x.type === "question").length;
    const current = s.steps
      .slice(0, s.step + 1)
      .filter((x) => x.type === "question").length;
    const correct = step.type === "question" && s.selected === step.correct;
    let content;
    if (step.type === "theory")
      content = `<div class="eyebrow">${e(s.title)} / ТЕОРИЯ</div><h1>${e(step.title)}</h1><p class="theory-text">${e(step.text)}</p><div class="theory-art"><span class="symbol" aria-hidden="true">${e(step.icon || "🔬")}</span><div><strong>Понимание важнее зубрёжки</strong><p>Дальше — вопрос, в котором ты применишь эту идею.</p></div></div>`;
    else
      content = `<div class="eyebrow">${s.kind === "challenge" ? "ИТОГОВОЕ ИСПЫТАНИЕ" : s.kind === "book" ? "ПРОВЕРКА КОНСПЕКТА" : "ПРАКТИКА"} / ВОПРОС ${current} ИЗ ${total}</div><h1>${e(step.question)}</h1>${table(step.table)}<div class="answers" role="group" aria-label="Варианты ответа">${step.answers.map((answer, i) => `<button class="answer ${s.checked ? (i === step.correct ? "correct" : i === s.selected ? "wrong" : "") : i === s.selected ? "selected" : ""}" data-action="answer" data-index="${i}" aria-pressed="${s.selected === i}" ${s.checked ? "disabled" : ""}><span class="letter">${String.fromCharCode(65 + i)}</span><span>${e(answer)}</span></button>`).join("")}</div>${s.checked ? `<div class="feedback ${correct ? "" : "wrong"}" role="status"><strong>${correct ? "Верно. Отличное открытие!" : "Разберёмся вместе"}</strong><p>${e(step.explanation)}</p></div>` : ""}`;
    return `<main id="main" class="lesson-shell"><header class="lesson-top"><button class="close-button" data-action="exit-lesson" aria-label="Выйти из урока">×</button><div class="progress" role="progressbar" aria-label="Прогресс урока" aria-valuenow="${s.step}" aria-valuemin="0" aria-valuemax="${s.steps.length}"><span style="width:${(s.step / s.steps.length) * 100}%"></span></div>${s.deadline ? '<span id="timer" class="timer" role="timer"></span>' : `<span class="metric">🧬 ${state.genes}</span>`}</header><section class="lesson-content">${content}</section></main><footer class="lesson-bottom"><div><small>${step.type === "theory" ? "Прочитай и переходи к практике" : s.checked ? "Каждый ответ — шаг к пониманию" : "Выбери один ответ"}</small>${button(step.type === "theory" ? "К практике →" : s.checked ? (s.step === s.steps.length - 1 ? "Завершить" : "Продолжить →") : "Проверить", "lesson-next", step.type === "question" && s.selected === null ? "disabled" : "")}</div></footer>`;
  }
  function chooseAnswer(index) {
    const s = state.session;
    if (!s || s.checked) return;
    const step = s.steps[s.step];
    if (step.type !== "question" || !step.answers[index]) return;
    s.selected = index;
    persist();
    render();
    document.querySelector(`.answer[data-index="${index}"]`)?.focus();
  }
  function lessonNext() {
    const s = state.session;
    if (!s) return;
    if (s.deadline && s.deadline <= Date.now()) {
      finishSession(true);
      navigate("result");
      return;
    }
    const step = s.steps[s.step];
    if (step.type === "question" && !s.checked) {
      if (s.selected === null) return;
      s.checked = true;
      s.answers.push({
        question: step.question,
        options: step.answers.slice(),
        selected: s.selected,
        correct: step.correct,
        explanation: step.explanation,
        table: step.table,
      });
      persist();
      render();
      document.querySelector(".feedback")?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (s.step === s.steps.length - 1) {
      finishSession();
      navigate("result");
      return;
    }
    s.step++;
    s.selected = null;
    s.checked = false;
    persist();
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    const heading = document.querySelector("main h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  function finishSession(expired = false) {
    const s = state.session;
    if (!s) return;
    P.complete(state, s);
    state.lastResult.expired = expired;
    view = "result";
    persist();
    clearInterval(timer);
  }
  function runTimer() {
    clearInterval(timer);
    if (view !== "lesson" || !state.session?.deadline) return;
    const update = () => {
      const remain = Math.max(
        0,
        Math.ceil((state.session.deadline - Date.now()) / 1000),
      );
      const node = document.getElementById("timer");
      if (node)
        node.textContent = `${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, "0")}`;
      if (remain <= 0) {
        finishSession(true);
        navigate("result");
      }
    };
    update();
    if (view === "lesson") timer = setInterval(update, 1000);
  }
  function resultView() {
    const r = state.lastResult;
    if (!r) {
      view = "home";
      return home();
    }
    const practice = r.kind === "practice";
    const positive = r.passed;
    return shell(
      `<section class="result"><div class="result-symbol" aria-hidden="true">${positive ? "🌱" : "🔬"}</div><div class="eyebrow">${r.expired ? "ВРЕМЯ ЗАВЕРШИЛОСЬ" : practice ? "ТРЕНИРОВКА ЗАВЕРШЕНА" : "ТВОЁ НОВОЕ ОТКРЫТИЕ"}</div><h1>${positive ? "Отличная работа!" : "Ещё немного практики"}</h1><p>${e(r.title)}<br>${positive ? (practice ? "Ты стал на шаг увереннее." : r.rewardXP ? "Знания с тобой. Следующий этап открыт." : "Ты уже проходил это занятие. Отличное повторение!") : "Для прохождения нужно не менее 70% правильных ответов. Разбери ошибки и попробуй ещё раз."}</p><div class="pill">${r.percent}% верных ответов · ${Math.floor((r.durationSeconds || 0) / 60)}:${String((r.durationSeconds || 0) % 60).padStart(2, "0")}</div><div class="result-stats"><div><strong>${r.correct}/${r.total}</strong><small>правильных ответов</small></div><div><strong>+${r.rewardXP}</strong><small>опыта XP</small></div><div><strong>+${r.rewardGenes}</strong><small>генов</small></div></div><div class="result-actions">${button(positive ? "Продолжить путь →" : "Попробовать ещё раз", "result-next")}<button class="button secondary" data-action="review-result">Разобрать ответы</button></div></section>`,
    );
  }
  function reviewView() {
    const r = state.lastResult;
    if (!r) {
      view = "practice";
      return practice();
    }
    return shell(
      `${heading("Каждый ответ — открытие", `${e(r.title)} · ${r.correct} из ${r.total} правильных`, button("← К результату", "nav", 'data-view="result"'))}<div class="reader-panel">${r.answers.map((a, i) => `<article class="review-item"><div class="eyebrow">ВОПРОС ${i + 1} · ${a.selected === a.correct ? "ВЕРНО" : "ПОВТОРИМ"}</div><h3>${e(a.question)}</h3>${table(a.table)}${a.selected !== a.correct ? `<div class="review-answer wrong">Твой ответ: ${e(a.options[a.selected])}</div>` : ""}<div class="review-answer">Правильный ответ: ${e(a.options[a.correct])}</div><p>${e(a.explanation)}</p></article>`).join("")}${r.answers.length < r.total ? `<div class="empty">Не отвечено: ${r.total - r.answers.length}. В следующий раз постарайся пройти всё испытание.</div>` : ""}</div>`,
    );
  }
  function bookView() {
    const index = state.bookPage;
    const page = DB.book.pages[index];
    return shell(
      `<div class="reader-panel"><div class="reader-toolbar"><button class="button secondary small" data-action="nav" data-view="library">← Библиотека</button><span class="pill">${index + 1} / ${DB.book.pages.length}</span></div><div class="eyebrow">ХИМИЧЕСКИЙ КОНТЕКСТ ЖИЗНИ / АВТОРСКИЙ КОНСПЕКТ</div><h1>${e(page.title)}</h1><p class="reader-text">${e(page.text)}</p><aside class="theory-note">${e(page.note)}</aside><div class="progress"><span style="width:${(state.bookRead.length / 4) * 100}%"></span></div><p class="reader-intro muted"><small>Открыто ${state.bookRead.length} из 4 разделов. Этот конспект написан для Ground и не заменяет полный учебник.</small></p><div class="reader-bottom"><button class="button secondary" data-action="book-prev" ${index === 0 ? "disabled" : ""}>← Назад</button>${index < 3 ? button("Следующий раздел →", "book-next") : button("Проверить знания →", "book-exam")}</div></div>`,
    );
  }
  function scanView() {
    return shell(
      `<div class="reader-panel"><div class="reader-toolbar"><button class="button secondary small" data-action="nav" data-view="library">← Библиотека</button><span class="pill">СТРАНИЦА ${state.scanPage}</span></div><div class="eyebrow">БИБЛИОТЕКА / ФРАГМЕНТ</div><h1>Campbell Biology</h1><p class="reader-intro">В репозитории доступны только страницы 47 и 48. Для последовательного изучения темы открой авторский конспект «Химический контекст жизни».</p><div class="scan-container"><img class="reader-image" src="images/campbell/chapter2/page-${state.scanPage}.webp" alt="Campbell Biology, страница ${state.scanPage}"></div><div class="reader-bottom"><button class="button secondary" data-action="scan-prev" ${state.scanPage === 47 ? "disabled" : ""}>← 47</button><button class="button secondary" data-action="scan-next" ${state.scanPage === 48 ? "disabled" : ""}>48 →</button></div></div>`,
    );
  }
  function readBook() {
    if (!state.bookRead.includes(state.bookPage))
      state.bookRead.push(state.bookPage);
    persist();
    navigate("book");
  }
  function startBookExam() {
    if (state.bookRead.length < 4) {
      toast("Сначала открой все четыре раздела конспекта.");
      return;
    }
    const l = {
      id: "chemistry",
      title: "Химический контекст жизни",
      questions: DB.book.questions,
      rewardXP: 40,
      rewardGenes: 8,
    };
    replaceSession(() => {
      state.session = createSession(l, "book", "book");
      persist();
      navigate("lesson");
    });
  }
  function editProfile() {
    openDialog(
      `<h2>Твой профиль</h2><p>Имя и резервная копия прогресса. Данные хранятся только на твоём устройстве.</p><form id="profile-form"><label for="profile-name">Как к тебе обращаться?</label><input id="profile-name" class="input" maxlength="40" required value="${attr(state.name)}"><fieldset class="layout-settings"><legend>Вид интерфейса</legend><div class="layout-options">${[
        ["auto", "Авто", "По размеру экрана"],
        ["laptop", "Ноутбук", "Меню слева"],
        ["phone", "Телефон", "Меню снизу"],
      ]
        .map(
          ([value, title, note]) =>
            `<label class="layout-option"><input type="radio" name="layout" value="${value}" ${state.layout === value ? "checked" : ""}><span><strong>${title}</strong><small>${note}</small></span></label>`,
        )
        .join(
          "",
        )}</div><p>Выбери удобный вид. Настройка сохранится на этом устройстве.</p></fieldset><div class="dialog-actions"><button class="button secondary" type="button" data-action="close-dialog">Отмена</button><button class="button" type="submit">Сохранить</button></div></form><div class="section"><button class="text-link" data-action="export">Экспорт прогресса ↓</button> <span class="muted"> · </span> <button class="text-link" data-action="import">Импорт ↑</button><input type="file" id="import-file" accept="application/json,.json" hidden></div><div class="section"><button class="button danger small" data-action="reset-confirm">Сбросить прогресс</button></div>`,
    );
  }
  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ground-progress-${P.dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Резервная копия скачана. Храни её для переноса прогресса.");
  }
  function validateImport(data) {
    if (
      !data ||
      data.version !== 2 ||
      !DB.courses[data.course] ||
      typeof data.name !== "string" ||
      data.name.length > 40 ||
      !Number.isFinite(data.xp) ||
      data.xp < 0 ||
      !Number.isFinite(data.genes) ||
      data.genes < 0 ||
      !Array.isArray(data.days) ||
      !data.days.every(
        (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
      ) ||
      !validCompleted(data.completed) ||
      !Array.isArray(data.history) ||
      !data.history.every(validResult) ||
      !Array.isArray(data.bookRead) ||
      !data.bookRead.every((n) => Number.isInteger(n) && n >= 0 && n < 4) ||
      !Number.isInteger(data.bookPage) ||
      data.bookPage < 0 ||
      data.bookPage > 3 ||
      (data.layout !== undefined &&
        !["auto", "laptop", "phone"].includes(data.layout)) ||
      (data.session && !validSession(data.session)) ||
      (data.lastResult && !validResult(data.lastResult))
    )
      throw new Error("invalid");
    const allowed = Object.keys(defaults());
    const safe = defaults();
    for (const key of allowed)
      if (Object.hasOwn(data, key)) safe[key] = data[key];
    safe.history = safe.history.slice(0, 50);
    safe.bookRead = [...new Set(safe.bookRead)];
    safe.scanPage = safe.scanPage === 48 ? 48 : 47;
    safe.onboarded = Boolean(safe.onboarded);
    return safe;
  }
  const smallScreen = window.matchMedia("(max-width: 680px)");
  function applyLayout() {
    document.documentElement.dataset.layout = state.layout;
    document.documentElement.dataset.compact = String(
      state.layout === "phone" ||
        (state.layout === "auto" && smallScreen.matches),
    );
  }
  smallScreen.addEventListener("change", applyLayout);
  function render() {
    applyLayout();
    const screens = {
      welcome,
      tracks,
      grades,
      home,
      road: roadPage,
      library,
      practice,
      profile,
      lesson: lessonView,
      result: resultView,
      review: reviewView,
      book: bookView,
      scans: scanView,
    };
    app.innerHTML = (screens[view] || home)();
    document.title = `${{ home: "Главная", road: "Дорожка", library: "Библиотека", practice: "Практика", profile: "Профиль", lesson: "Урок", book: "Химия жизни", result: "Результат", review: "Разбор ответов" }[view] || "Биология"} — Ground`;
    runTimer();
  }
  function handleAction(node) {
    const action = node.dataset.action;
    switch (action) {
      case "nav":
        navigate(node.dataset.view);
        break;
      case "choose-course":
        navigate("tracks");
        break;
      case "onboard-back":
        navigate(state.onboarded ? "home" : "welcome");
        break;
      case "select-track":
        selectedTrack = node.dataset.track;
        selectedTrack === "school"
          ? navigate("grades")
          : selectCourse(selectedTrack);
        break;
      case "select-course":
        selectCourse(node.dataset.course);
        break;
      case "start-lesson":
        startLesson(node.dataset.id);
        break;
      case "resume":
        navigate("lesson");
        break;
      case "dialog-resume":
        closeDialog();
        navigate("lesson");
        break;
      case "start-practice":
        startPractice();
        break;
      case "practice-errors":
        startPractice(true);
        break;
      case "answer":
        chooseAnswer(Number(node.dataset.index));
        break;
      case "lesson-next":
        lessonNext();
        break;
      case "exit-lesson":
        persist();
        navigate("home");
        toast("Место сохранено. Продолжить можно с главной страницы.");
        break;
      case "result-next": {
        const r = state.lastResult;
        if (!r) return;
        if (r.passed) {
          navigate(
            r.kind === "practice"
              ? "practice"
              : r.kind === "book"
                ? "library"
                : "road",
          );
        } else if (r.kind === "book") startBookExam();
        else if (r.kind === "practice") startPractice();
        else {
          state.course = r.courseKey;
          persist();
          startLesson(r.lessonId);
        }
        break;
      }
      case "review-result":
        navigate("review");
        break;
      case "history-review":
        state.lastResult = state.history[Number(node.dataset.index)];
        persist();
        navigate("review");
        break;
      case "library-filter":
        libraryFilter = node.dataset.filter;
        render();
        break;
      case "show-course-materials":
        document
          .querySelector(".lesson-list")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      case "lesson-note": {
        const l = course().lessons.find(
          (l) => l.id === Number(node.dataset.id),
        );
        if (!l) return;
        openDialog(
          `<div class="eyebrow">КОНСПЕКТ / ${e(courseLabel())}</div><h2>${e(l.title)}</h2>${l.theory.map((t) => `<h3>${e(t.title)}</h3><p>${e(t.text)}</p>`).join("")}<div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Закрыть</button><button class="button" data-action="note-start" data-id="${l.id}">К уроку →</button></div>`,
        );
        break;
      }
      case "note-start":
        closeDialog();
        startLesson(node.dataset.id);
        break;
      case "read-book":
        readBook();
        break;
      case "book-prev":
        state.bookPage = Math.max(0, state.bookPage - 1);
        readBook();
        break;
      case "book-next":
        state.bookPage = Math.min(3, state.bookPage + 1);
        readBook();
        break;
      case "book-exam":
        startBookExam();
        break;
      case "read-scans":
        navigate("scans");
        break;
      case "scan-prev":
        state.scanPage = 47;
        persist();
        render();
        break;
      case "scan-next":
        state.scanPage = 48;
        persist();
        render();
        break;
      case "edit-profile":
        editProfile();
        break;
      case "close-dialog":
        closeDialog();
        break;
      case "export":
        exportProgress();
        break;
      case "import":
        document.getElementById("import-file")?.click();
        break;
      case "reset-confirm":
        openDialog(
          `<h2>Начать с чистого листа?</h2><p>Все уроки, награды и история будут удалены с этого устройства. Сначала экспортируй прогресс, если хочешь сохранить копию.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Оставить</button><button class="button danger" data-action="reset">Удалить прогресс</button></div>`,
        );
        break;
      case "reset":
        Object.assign(state, defaults());
        persist();
        closeDialog();
        navigate("welcome");
        toast("Прогресс сброшен. Впереди новые открытия.");
        break;
    }
  }
  function selectCourse(key) {
    if (!DB.courses[key]) return;
    state.course = key;
    state.onboarded = true;
    persist();
    navigate("home");
  }
  document.addEventListener("click", (event) => {
    const node = event.target.closest("[data-action]");
    if (!node || node.disabled) return;
    event.preventDefault();
    handleAction(node);
  });
  document.addEventListener("input", (event) => {
    if (event.target.id === "library-search") {
      libraryQuery = event.target.value;
      document.getElementById("library-results").innerHTML = libraryResults();
    }
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id !== "profile-form") return;
    event.preventDefault();
    const name = document.getElementById("profile-name").value.trim();
    if (!name) {
      toast("Введи имя.");
      return;
    }
    state.name = name.slice(0, 40);
    state.layout = document.querySelector(
      '#profile-form input[name="layout"]:checked',
    ).value;
    persist();
    closeDialog();
    render();
    toast("Профиль сохранён.");
  });
  document.addEventListener("change", async (event) => {
    if (event.target.id !== "import-file") return;
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("size");
      const imported = validateImport(JSON.parse(await file.text()));
      openDialog(
        `<h2>Восстановить прогресс?</h2><p>Копия профиля «${e(imported.name)}» заменит текущий прогресс: ${imported.xp} XP, ${Object.keys(imported.completed).length} пройденных занятий.</p><div class="dialog-actions"><button class="button secondary" data-action="close-dialog">Отмена</button><button class="button" id="confirm-import">Восстановить</button></div>`,
      );
      document.getElementById("confirm-import").addEventListener(
        "click",
        () => {
          Object.assign(state, imported);
          persist();
          closeDialog();
          navigate("profile");
          toast("Прогресс восстановлен.");
        },
        { once: true },
      );
    } catch {
      toast("Файл не подходит. Выбери JSON-копию, экспортированную из Ground.");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      view !== "lesson" ||
      dialog.open ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)
    )
      return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      chooseAnswer(Number(event.key) - 1);
    } else if (event.key === "Escape") {
      persist();
      navigate("home");
    }
  });
  window.addEventListener("pagehide", persist);
  render();
  if (!storageAvailable)
    toast(
      "Прогресс не прочитан. Можно продолжить и экспортировать копию в профиле.",
    );
})();
