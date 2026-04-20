export const USER_ROLES = ["teen", "employer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TASK_STATUSES = ["draft", "open", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Статусы отклика подростка (демо-поток). */
export const APPLICATION_STATUSES = [
  "applied",
  "rejected",
  "accepted",
  "submitted",
  "paid",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Подписи статусов отклика (единый словарь для подростка и работодателя). */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Отклик отправлен",
  rejected: "Отклик отклонён",
  accepted: "Ты в работе",
  submitted: "Ждёт подтверждения",
  paid: "Оплачено",
};

/** Подсказка на карточке отклика подростка. */
export const APPLICATION_STATUS_HINTS: Record<ApplicationStatus, string> = {
  applied: "Работодатель получил отклик и скоро примет решение.",
  rejected: "Работодатель отклонил отклик по этой задаче.",
  accepted: "Ты принят в работу. Выполни задачу и отметь результат.",
  submitted: "Результат отправлен. Ждём подтверждения выплаты от работодателя.",
  paid: "Готово: опыт на балансе, сумма в кошельке (в демо).",
};

/** Подписи статуса задачи в бейдже и сводках. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Черновик",
  open: "Открыта",
  in_progress: "В работе",
  completed: "Завершена",
};

export function normalizeTaskStatus(raw: unknown): TaskStatus {
  if (raw === "draft" || raw === "open" || raw === "in_progress" || raw === "completed") {
    return raw;
  }
  if (raw === "published") return "open";
  if (raw === "closed") return "completed";
  return "draft";
}

export function normalizeApplicationStatus(raw: unknown): ApplicationStatus {
  if (
    raw === "applied" ||
    raw === "rejected" ||
    raw === "accepted" ||
    raw === "submitted" ||
    raw === "paid"
  ) {
    return raw;
  }
  if (raw === "sent" || raw === "awaiting") return "applied";
  if (raw === "in_progress") return "accepted";
  if (raw === "completed") return "submitted";
  return "applied";
}

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

export const ENGAGEMENT_TYPES = ["employment", "self_employed"] as const;
export type EngagementType = (typeof ENGAGEMENT_TYPES)[number];
export const ENGAGEMENT_TYPE_LABELS: Record<EngagementType, string> = {
  employment: "Трудовой договор",
  self_employed: "Самозанятость",
};

export const PHYSICAL_LOAD_LEVELS = ["none", "light"] as const;
export type PhysicalLoadLevel = (typeof PHYSICAL_LOAD_LEVELS)[number];
export const PHYSICAL_LOAD_LABELS: Record<PhysicalLoadLevel, string> = {
  none: "Без нагрузки",
  light: "Лёгкая",
};

export const MINOR_COMPLIANCE_STATUSES = ["passed", "warning", "blocked"] as const;
export type MinorComplianceStatus = (typeof MINOR_COMPLIANCE_STATUSES)[number];
export const MINOR_COMPLIANCE_STATUS_LABELS: Record<MinorComplianceStatus, string> = {
  passed: "Допустимо",
  warning: "Условно допустимо",
  blocked: "Недопустимо",
};
