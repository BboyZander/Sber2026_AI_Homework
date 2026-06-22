// Канонический источник демо-контента (задачи + отклики/избранное).
// Используется CLI-сидером (seed-content.mjs) и серверным сбросом (/api/demo-reset).
// Детерминированно: одинаковое состояние при каждом прогоне.

const TEEN_EMAIL = "teen@trajectory.demo";

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const METRO = [
  "м. Тверская", "м. Киевская", "м. Курская", "м. Белорусская", "м. Парк культуры",
  "м. Сокол", "м. ВДНХ", "м. Юго-Западная", "м. Текстильщики", "м. Новогиреево",
  "м. Митино", "м. Аэропорт", "м. Чертановская", "м. Бабушкинская",
];

const THEMES = {
  pvz_issue: {
    title: "Помощь в пункте выдачи", category: "delivery", work_format: "offline",
    physical: "light", outdoor: false, hours: 4, ages: [16, 17],
    what: "Выдавать заказы клиентам, сверять штрихкоды, поддерживать порядок на стеллажах.",
    done: "Все заказы за смену выданы корректно, зона выдачи убрана.", xp: 80,
  },
  pvz_receive: {
    title: "Приёмка и сортировка в ПВЗ", category: "warehouse", work_format: "offline",
    physical: "light", outdoor: false, hours: 4, ages: [16, 17],
    what: "Принять поставку, разложить заказы по ячейкам, отметить приёмку в системе.",
    done: "Вся поставка разложена по ячейкам, расхождения зафиксированы.", xp: 75,
  },
  warehouse_pick: {
    title: "Сборка заказов на складе", category: "warehouse", work_format: "offline",
    physical: "light", outdoor: false, hours: 4, ages: [16, 17],
    what: "Собирать заказы по списку, упаковывать, передавать на выдачу/доставку.",
    done: "Заказы из задания собраны и упакованы без ошибок.", xp: 78,
  },
  shelf_stock: {
    title: "Выкладка товара в магазине", category: "warehouse", work_format: "offline",
    physical: "light", outdoor: false, hours: 4, ages: [16, 17],
    what: "Выложить товар на полки по планограмме, проверить ценники и сроки.",
    done: "Полки заполнены по планограмме, просрочка убрана.", xp: 70,
  },
  packing: {
    title: "Фасовка продуктов", category: "warehouse", work_format: "offline",
    physical: "light", outdoor: false, hours: 4, ages: [16, 17],
    what: "Фасовать и взвешивать продукты, клеить этикетки, готовить к выкладке.",
    done: "Норма фасовки за смену выполнена, упаковка аккуратная.", xp: 68,
  },
  promo_tasting: {
    title: "Промо-дегустация в магазине", category: "promo", work_format: "offline",
    physical: "light", outdoor: false, hours: 3, ages: [16, 17],
    what: "Презентовать продукт покупателям, угощать пробниками, рассказывать об акции.",
    done: "Промо-стойка отработана смену, материалы розданы.", xp: 60,
  },
  promo_flyers: {
    title: "Раздача листовок", category: "promo", work_format: "offline",
    physical: "light", outdoor: true, hours: 3, ages: [14, 17],
    what: "Раздавать листовки у точки, приглашать прохожих, отвечать на вопросы об акции.",
    done: "Пачка листовок роздана, поток у точки отработан.", xp: 50,
  },
  survey: {
    title: "Опрос покупателей", category: "promo", work_format: "offline",
    physical: "none", outdoor: false, hours: 3, ages: [14, 17],
    what: "Проводить короткий опрос по анкете, фиксировать ответы в приложении.",
    done: "Собрано нужное число анкет, данные внесены.", xp: 55,
  },
  event_help: {
    title: "Помощь на мероприятии", category: "events", work_format: "offline",
    physical: "light", outdoor: false, hours: 5, ages: [16, 17],
    what: "Встречать гостей, помогать с регистрацией и навигацией, поддерживать зону.",
    done: "Гости зарегистрированы, зона мероприятия в порядке.", xp: 90,
  },
  ambassador: {
    title: "Промо сервиса в районе", category: "promo", work_format: "offline",
    physical: "light", outdoor: true, hours: 3, ages: [14, 17],
    what: "Рассказывать жителям о сервисе, помогать установить приложение, раздавать промокоды.",
    done: "План активаций выполнен, промокоды розданы.", xp: 58,
  },
  smm_online: {
    title: "Помощь с контентом для соцсетей", category: "smm", work_format: "online",
    physical: "none", outdoor: false, hours: 2, ages: [14, 17],
    what: "Подобрать референсы, собрать пост/сторис по брифу, оформить по гайдлайну.",
    done: "Контент по брифу сдан и принят куратором.", xp: 65,
  },
  data_entry: {
    title: "Внесение данных в таблицы", category: "data", work_format: "online",
    physical: "none", outdoor: false, hours: 3, ages: [14, 17],
    what: "Переносить данные в таблицы по инструкции, проверять на ошибки.",
    done: "Все строки задания внесены и выверены.", xp: 52,
  },
  home_organize: {
    title: "Разбор и организация пространства", category: "household", work_format: "offline",
    physical: "light", outdoor: false, hours: 3, ages: [14, 17],
    what: "Разобрать вещи по категориям, оформить хранение по инструкции заказчика.",
    done: "Вещи разобраны и расставлены по системе, владелец принял работу.", xp: 60,
  },
};

const STATUS_PATTERN = {
  "x5@trajectory.demo": ["open", "open", "open", "open", "in_progress", "completed"],
  "ozon@trajectory.demo": ["open", "open", "open", "in_progress", "completed", "completed"],
  "wildberries@trajectory.demo": ["open", "open", "open", "open", "open", "completed"],
  "yandex@trajectory.demo": ["open", "open", "in_progress", "in_progress", "completed", "completed"],
  "magnit@trajectory.demo": ["open", "open", "open", "completed", "completed", "completed"],
  "vkusvill@trajectory.demo": ["open", "open", "open", "open", "in_progress", "completed"],
  "samokat@trajectory.demo": ["open", "open", "open", "open", "open", "in_progress"],
  "dodo@trajectory.demo": ["open", "open", "in_progress", "completed", "completed", "completed"],
};

const PLAN = {
  "x5@trajectory.demo": ["pvz_issue", "pvz_receive", "shelf_stock", "promo_tasting", "survey", "promo_flyers"],
  "ozon@trajectory.demo": ["pvz_issue", "pvz_receive", "warehouse_pick", "data_entry", "survey", "packing"],
  "wildberries@trajectory.demo": ["pvz_issue", "pvz_receive", "shelf_stock", "packing", "survey", "data_entry"],
  "yandex@trajectory.demo": ["home_organize", "ambassador", "event_help", "promo_flyers", "smm_online", "data_entry"],
  "magnit@trajectory.demo": ["shelf_stock", "promo_tasting", "survey", "promo_flyers", "packing", "pvz_issue"],
  "vkusvill@trajectory.demo": ["packing", "home_organize", "promo_tasting", "survey", "event_help", "smm_online"],
  "samokat@trajectory.demo": ["warehouse_pick", "pvz_receive", "packing", "data_entry", "survey", "shelf_stock"],
  "dodo@trajectory.demo": ["promo_flyers", "ambassador", "event_help", "survey", "smm_online", "promo_tasting"],
};

/** Детерминированно построить 48 задач для переданных работодателей (Map email→{id,name}). */
export function buildTasks(employersByEmail) {
  const rnd = mulberry32(20260615);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  function moscowPoint() {
    return { lat: +(55.70 + rnd() * 0.12).toFixed(5), lng: +(37.48 + rnd() * 0.28).toFixed(5) };
  }
  function weekdayISO(minDays, maxDays) {
    const d = new Date();
    d.setDate(d.getDate() + between(minDays, maxDays));
    const dow = d.getDay();
    if (dow === 6) d.setDate(d.getDate() + 2);
    if (dow === 0) d.setDate(d.getDate() + 1);
    d.setHours(between(10, 15), pick([0, 30]), 0, 0);
    return d.toISOString();
  }
  function pastWeekdayISO() {
    const d = new Date();
    d.setDate(d.getDate() - between(3, 20));
    const dow = d.getDay();
    if (dow === 6) d.setDate(d.getDate() - 1);
    if (dow === 0) d.setDate(d.getDate() - 2);
    d.setHours(between(10, 15), 0, 0, 0);
    return d.toISOString();
  }

  function buildTask(emp, themeKey, status) {
    const t = THEMES[themeKey];
    const online = t.work_format === "online";
    const hourly = rnd() < 0.55;
    const rate = between(28, 42) * 10;
    const payRub = hourly ? rate * t.hours : between(90, 240) * 10;
    const hasFixed = rnd() < 0.7;
    const start = status === "completed" ? pastWeekdayISO() : weekdayISO(2, 21);
    const point = online ? { lat: null, lng: null } : moscowPoint();

    return {
      title: `${t.title} · ${emp.name}`,
      description: `${t.what} Подработка от «${emp.name}» — без опыта, всему научим на месте.`,
      what_to_do: t.what,
      completion_criteria: t.done,
      contact_person: "Куратор площадки (контакты в чате после отклика)",
      employer_id: emp.id,
      employer_name: emp.name,
      category: t.category,
      status,
      reward_xp: t.xp,
      payment_type: hourly ? "hourly" : "fixed",
      payment_amount: hourly ? rate : payRub,
      estimated_hours: hourly ? t.hours : null,
      pay_rub: payRub,
      work_format: t.work_format,
      duration_bucket: t.hours <= 3 ? "short" : "long",
      duration_label: t.hours <= 2 ? "до 2 часов" : `смена ${t.hours} ч`,
      location: online ? null : `Москва, ${pick(METRO)}`,
      min_age: t.ages[0],
      max_age: t.ages[1],
      engagement_type: "self_employed",
      has_fixed_schedule: hasFixed,
      start_date_time: start,
      duration_hours: t.hours,
      weekly_hours_expected: t.hours,
      during_school_period_allowed: true,
      during_vacation_allowed: true,
      requires_medical_exam: false,
      physical_load_level: t.physical,
      is_outdoor: t.outdoor,
      minor_compliance_status: "passed",
      minor_compliance_reasons: [],
      deadline: null,
      lat: point.lat,
      lng: point.lng,
    };
  }

  const tasks = [];
  for (const [email, themes] of Object.entries(PLAN)) {
    const emp = employersByEmail.get(email);
    if (!emp) continue;
    const statuses = STATUS_PATTERN[email];
    themes.forEach((theme, slot) => tasks.push(buildTask(emp, theme, statuses[slot])));
  }
  return tasks;
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Отклики (весь спектр статусов) + избранное подростка по вставленным задачам ({id,status}). */
export function pickApplicationsAndFavorites(teenId, tasks) {
  const byStatus = (s) =>
    tasks.filter((t) => t.status === s).sort((a, b) => (a.id < b.id ? -1 : 1));
  const open = byStatus("open");
  const inProgress = byStatus("in_progress");
  const completed = byStatus("completed");

  if (inProgress.length < 2 || completed.length < 1 || open.length < 7) {
    throw new Error("Недостаточно сид-задач для откликов/избранного");
  }

  const applications = [
    { task_id: inProgress[0].id, status: "accepted", created_at: daysAgoISO(4),
      message: "Готов выйти на смену, есть опыт волонтёрства." },
    { task_id: inProgress[1].id, status: "submitted", created_at: daysAgoISO(6),
      message: "Сделал, прикладываю результат." },
    { task_id: completed[0].id, status: "paid", created_at: daysAgoISO(14),
      paid_at: daysAgoISO(9), message: "Спасибо, всё прошло отлично!" },
    { task_id: open[0].id, status: "applied", created_at: daysAgoISO(1),
      message: "Здравствуйте! Хочу попробовать, когда удобно выйти?" },
    { task_id: open[1].id, status: "applied", created_at: daysAgoISO(2), message: null },
    { task_id: open[2].id, status: "rejected", created_at: daysAgoISO(7),
      message: "Могу в будни после 15:00." },
  ].map((a) => ({ teen_id: teenId, paid_at: null, ...a }));

  const favorites = [open[3], open[4], open[5], open[6]].map((t, i) => ({
    teen_id: teenId,
    task_id: t.id,
    created_at: daysAgoISO(i + 1),
  }));

  return { applications, favorites };
}

/**
 * Сбросить демо-контент к зафиксированному состоянию.
 * Удаляет задачи сид-работодателей (каскадом — их отклики/избранное),
 * заново вставляет задачи и отклики/избранное подростка. Профили не трогает.
 */
export async function resetDemoContent(supabase) {
  const { data: emps, error: empErr } = await supabase
    .from("profiles")
    .select("id, email, name")
    .eq("role", "employer");
  if (empErr) throw empErr;

  const byEmail = new Map(emps.map((e) => [e.email, e]));
  const ids = emps.map((e) => e.id);

  const { error: delErr } = await supabase.from("tasks").delete().in("employer_id", ids);
  if (delErr) throw delErr;

  const tasks = buildTasks(byEmail);
  const { data: inserted, error: insErr } = await supabase
    .from("tasks")
    .insert(tasks)
    .select("id, status");
  if (insErr) throw insErr;

  const { data: teen, error: teenErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", TEEN_EMAIL)
    .maybeSingle();
  if (teenErr) throw teenErr;

  let applicationsCount = 0;
  let favoritesCount = 0;
  if (teen) {
    const { applications, favorites } = pickApplicationsAndFavorites(teen.id, inserted);
    // Отклики/избранное подростка уже удалены каскадом вместе с задачами — вставляем заново.
    const { error: aErr } = await supabase.from("applications").insert(applications);
    if (aErr) throw aErr;
    const { error: fErr } = await supabase.from("favorites").insert(favorites);
    if (fErr) throw fErr;
    applicationsCount = applications.length;
    favoritesCount = favorites.length;
  }

  return { tasks: tasks.length, applications: applicationsCount, favorites: favoritesCount };
}
