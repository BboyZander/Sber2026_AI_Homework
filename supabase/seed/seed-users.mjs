// F0.3.1 — сиды учёток и профилей.
// Запуск: node --env-file=.env.local supabase/seed/seed-users.mjs
// Идемпотентно: повторный запуск обновляет данные, не плодит дубли.
// Создаёт auth.users через Admin API (email_confirm:true — без писем) + profiles/*.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Нет NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (запускай с --env-file=.env.local)");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PASSWORD = "demo123456";

const teen = {
  email: "teen@trajectory.demo",
  name: "Артём",
  city: "Москва",
  profile: {
    age: 16,
    xp: 140,
    level: 2,
    interests: ["digital", "events", "part-time"],
    preferred_task_format: "any",
    completed_tasks_count: 3,
    onboarded: true,
  },
};

// 8 работодателей под подростковую подработку (ПВЗ, доставка, промо, ивенты, ритейл).
const employers = [
  {
    email: "x5@trajectory.demo",
    companyName: "X5 Group",
    inn: "7728029110", ogrn: "1027700210690",
    customer_type: "legal_entity",
    task_categories: ["delivery", "promo"],
    rating: 4.7, reviews_count: 128, verified: true,
    cabinet_description: "Пятёрочка, Перекрёсток и доставка: помощь в ПВЗ, выкладка, промо.",
    cabinet_tags: ["ПВЗ", "доставка", "ритейл"],
  },
  {
    email: "ozon@trajectory.demo",
    companyName: "Ozon",
    inn: "7704217370", ogrn: "1027739244741",
    customer_type: "legal_entity",
    task_categories: ["delivery", "other"],
    rating: 4.6, reviews_count: 203, verified: true,
    cabinet_description: "Пункты выдачи и сортировочные центры: приём, выдача, помощь на складе.",
    cabinet_tags: ["ПВЗ", "склад", "сортировка"],
  },
  {
    email: "wildberries@trajectory.demo",
    companyName: "Wildberries",
    inn: "7721546864", ogrn: "1067746062449",
    customer_type: "legal_entity",
    task_categories: ["delivery", "other"],
    rating: 4.4, reviews_count: 176, verified: true,
    cabinet_description: "ПВЗ Wildberries: выдача заказов, приёмка, поддержание порядка в зале.",
    cabinet_tags: ["ПВЗ", "выдача"],
  },
  {
    email: "yandex@trajectory.demo",
    companyName: "Яндекс",
    inn: "7736207543", ogrn: "1027700229193",
    customer_type: "legal_entity",
    task_categories: ["promo", "events"],
    rating: 4.8, reviews_count: 311, verified: true,
    cabinet_description: "Промо-акции, опросы, помощь на мероприятиях и амбассадорство сервисов.",
    cabinet_tags: ["промо", "ивенты", "опросы"],
  },
  {
    email: "magnit@trajectory.demo",
    companyName: "Магнит",
    inn: "2309085638", ogrn: "1032304945947",
    customer_type: "legal_entity",
    task_categories: ["promo", "other"],
    rating: 4.3, reviews_count: 142, verified: true,
    cabinet_description: "Магазины у дома: выкладка товара, помощь в зале, промо-дегустации.",
    cabinet_tags: ["ритейл", "выкладка", "промо"],
  },
  {
    email: "vkusvill@trajectory.demo",
    companyName: "ВкусВилл",
    inn: "7734675810", ogrn: "5117746072034",
    customer_type: "legal_entity",
    task_categories: ["other", "promo"],
    rating: 4.5, reviews_count: 98, verified: true,
    cabinet_description: "Магазины здоровых продуктов: фасовка, выкладка, помощь покупателям.",
    cabinet_tags: ["ритейл", "фасовка"],
  },
  {
    email: "samokat@trajectory.demo",
    companyName: "Самокат",
    inn: "7813252159", ogrn: "1207800126770",
    customer_type: "legal_entity",
    task_categories: ["delivery", "other"],
    rating: 4.6, reviews_count: 154, verified: true,
    cabinet_description: "Даркстор-доставка: сборка заказов, приёмка, помощь на складе.",
    cabinet_tags: ["склад", "сборка", "доставка"],
  },
  {
    email: "dodo@trajectory.demo",
    companyName: "Додо Пицца",
    inn: "1101140415", ogrn: "1111101000557",
    customer_type: "legal_entity",
    task_categories: ["promo", "events"],
    rating: 4.4, reviews_count: 87, verified: true,
    cabinet_description: "Промо и мероприятия: раздача листовок, помощь на ивентах, анкетирование.",
    cabinet_tags: ["промо", "листовки", "ивенты"],
  },
];

async function loadExistingByEmail() {
  const byEmail = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) byEmail.set(u.email, u.id);
    if (data.users.length < 1000) break;
    page += 1;
  }
  return byEmail;
}

async function ensureAuthUser(byEmail, email, metadata) {
  if (byEmail.has(email)) {
    const id = byEmail.get(email);
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: PASSWORD,
      user_metadata: metadata,
    });
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const byEmail = await loadExistingByEmail();

  // --- Подросток ---
  const teenId = await ensureAuthUser(byEmail, teen.email, { name: teen.name, role: "teen" });
  let { error: e1 } = await supabase.from("profiles").upsert({
    id: teenId, email: teen.email, name: teen.name, role: "teen", city: teen.city,
  });
  if (e1) throw e1;
  let { error: e2 } = await supabase.from("teen_profiles").upsert({ id: teenId, ...teen.profile });
  if (e2) throw e2;
  console.log(`✓ teen   ${teen.email.padEnd(26)} ${teenId}`);

  // --- Работодатели ---
  for (const emp of employers) {
    const id = await ensureAuthUser(byEmail, emp.email, { name: emp.companyName, role: "employer" });
    const { error: pe } = await supabase.from("profiles").upsert({
      id, email: emp.email, name: emp.companyName, role: "employer", city: "Москва",
    });
    if (pe) throw pe;
    const { error: ee } = await supabase.from("employer_profiles").upsert({
      id,
      company_name: emp.companyName,
      inn: emp.inn,
      ogrn: emp.ogrn,
      verified: emp.verified,
      customer_type: emp.customer_type,
      task_categories: emp.task_categories,
      cabinet_description: emp.cabinet_description,
      cabinet_tags: emp.cabinet_tags,
      rating: emp.rating,
      reviews_count: emp.reviews_count,
    });
    if (ee) throw ee;
    console.log(`✓ empl   ${emp.email.padEnd(26)} ${id}  ${emp.companyName}`);
  }

  console.log("\nГотово. Пароль у всех сид-учёток:", PASSWORD);
}

main().catch((err) => {
  console.error("Ошибка сидов:", err.message ?? err);
  process.exit(1);
});
