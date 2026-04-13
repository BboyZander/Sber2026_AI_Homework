export const USER_ROLES = ["teen", "employer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TASK_STATUSES = ["draft", "published", "closed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Статусы отклика подростка (демо-поток). */
export const APPLICATION_STATUSES = [
  "sent",
  "awaiting",
  "in_progress",
  "completed",
  "paid",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Подписи статусов отклика (единый словарь для подростка и работодателя). */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  sent: "Отправлен",
  awaiting: "Ждём ответа",
  in_progress: "В работе",
  completed: "Выполнено",
  paid: "Оплачено",
};

/** Подсказка на карточке отклика подростка. */
export const APPLICATION_STATUS_HINTS: Record<ApplicationStatus, string> = {
  sent: "Работодатель ещё не ответил — обычно это пара дней.",
  awaiting: "Заявку смотрят, скоро будет ответ.",
  in_progress: "Ты в деле: уточни детали у контакта из карточки задачи.",
  completed: "Ты отметил выполнение — жди подтверждения выплаты.",
  paid: "Готово: опыт на балансе, сумма в кошельке (в демо).",
};

/** Подписи статуса задачи в бейдже и сводках. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Черновик",
  published: "Активна",
  closed: "Завершена",
};

export const TASK_CATEGORIES = [
  "delivery",
  "events",
  "promo",
  "creative",
  "other",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  delivery: "Доставка",
  events: "Мероприятия",
  promo: "Промо",
  creative: "Творчество",
  other: "Другое",
};

export const WORK_FORMATS = ["online", "offline"] as const;
export type WorkFormat = (typeof WORK_FORMATS)[number];

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  online: "Онлайн",
  offline: "Офлайн",
};

export const DURATION_BUCKETS = ["short", "long"] as const;
export type DurationBucket = (typeof DURATION_BUCKETS)[number];

export const DURATION_BUCKET_LABELS: Record<DurationBucket, string> = {
  short: "Короткая",
  long: "Длинная",
};
