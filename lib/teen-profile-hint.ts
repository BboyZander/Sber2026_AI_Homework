import type { Application } from "@/types/application";

export type ProfileHint = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

/** Демо-подсказка «как AI»: правила по активности, без внешнего API. */
export function buildTeenProfileHint(apps: Application[]): ProfileHint {
  const n = apps.length;
  const inProgress = apps.some((a) => a.status === "in_progress");
  const waiting = apps.some((a) => a.status === "sent" || a.status === "awaiting");
  const paid = apps.filter((a) => a.status === "paid").length;

  if (n === 0) {
    return {
      eyebrow: "Совет",
      title: "Начни с каталога",
      body: "Пока без откликов — зайди в каталог и выбери задачу по времени и формату. Первый отклик сразу появится здесь и в разделе «Отклики».",
      href: "/teen/tasks",
      cta: "Открыть каталог",
    };
  }

  if (inProgress) {
    return {
      eyebrow: "Совет",
      title: "Задача в работе — держи связь",
      body: "Уточни детали у организатора и зафиксируй сроки. Когда закончишь, отметь выполнение в «Откликах» — потом статус станет «Выполнено», затем «Оплачено».",
      href: "/teen/applications",
      cta: "К откликам",
    };
  }

  if (waiting) {
    return {
      eyebrow: "Совет",
      title: "Ждём ответа по откликам",
      body: "Пока работодатель смотрит заявки, можно подобрать ещё задачу. Заглядывай в «Отклики» — там обновятся статусы.",
      href: "/teen/applications",
      cta: "Открыть отклики",
    };
  }

  if (paid >= 1) {
    return {
      eyebrow: "Совет",
      title: "Хороший темп",
      body: "Уже есть оплаченные задачи в демо — отличный задел. Попробуй другой формат или длительность, чтобы разнообразить опыт.",
      href: "/teen/tasks",
      cta: "Найти следующую задачу",
    };
  }

  return {
    eyebrow: "Совет",
    title: "Продолжай",
    body: "Статистика тянется из откликов. Новые задачи и отклики работодателей ускорят рост уровня и XP.",
    href: "/teen/dashboard",
    cta: "На главную",
  };
}
