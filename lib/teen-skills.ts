import type { Application } from "@/types/application";
import type { Task } from "@/types/task";

export type SkillLevel = 0 | 1 | 2 | 3;

export interface Skill {
  id: string;
  label: string;
  icon: string;
  level: SkillLevel;
  levelLabel: string;
  count: number;
  /** Контекстный ярлык — явно говорит ЧТО считается, чтобы не было путаницы. */
  countLabel: string;
}

const LEVEL_THRESHOLDS = [0, 1, 3, 6] as const;

const LEVEL_LABELS: Record<SkillLevel, string> = {
  0: "Нет опыта",
  1: "Начальный",
  2: "Уверенный",
  3: "Эксперт",
};

function toLevel(count: number): SkillLevel {
  if (count >= LEVEL_THRESHOLDS[3]) return 3;
  if (count >= LEVEL_THRESHOLDS[2]) return 2;
  if (count >= LEVEL_THRESHOLDS[1]) return 1;
  return 0;
}

function fmt(n: number, suffix: string): string {
  return n === 0 ? "Пока нет" : `${n} ${suffix}`;
}

/**
 * Вычисляет 5 навыков подростка на основе его откликов и задач.
 * Использует все не-отклонённые заявки как сигнал опыта.
 */
export function computeTeenSkills(
  apps: Application[],
  tasksById: Record<string, Task>,
): Skill[] {
  const active = apps.filter((a) => a.status !== "rejected");
  const completed = apps.filter((a) => a.status === "submitted" || a.status === "paid");

  let communication = 0;
  let digital = 0;
  let logistics = 0;

  for (const a of active) {
    const task = tasksById[a.taskId];
    if (!task) continue;
    if (task.category === "promo" || task.category === "events") communication++;
    if (task.category === "smm" || task.category === "data" || task.category === "creative") digital++;
    if (task.category === "delivery" || task.category === "warehouse") logistics++;
  }

  const raw = [
    { id: "reliability",   label: "Ответственность",  icon: "✅", count: completed.length,  countLabel: fmt(completed.length,  "выполнено") },
    { id: "initiative",    label: "Инициативность",    icon: "🚀", count: active.length,     countLabel: fmt(active.length,     "откликов")  },
    { id: "communication", label: "Коммуникация",      icon: "💬", count: communication,     countLabel: fmt(communication,     "задач")     },
    { id: "digital",       label: "Цифровые навыки",   icon: "💻", count: digital,           countLabel: fmt(digital,           "задач")     },
    { id: "logistics",     label: "Логистика",         icon: "📦", count: logistics,         countLabel: fmt(logistics,         "задач")     },
  ];

  return raw
    .map((s) => ({ ...s, level: toLevel(s.count), levelLabel: LEVEL_LABELS[toLevel(s.count)] }))
    .sort((a, b) => b.level - a.level || b.count - a.count);
}
