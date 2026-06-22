export type TierId = "newcomer" | "trainee" | "experienced" | "pro";

export interface Tier {
  id: TierId;
  label: string;
  icon: string;
  description: string;
  minTasks: number;
}

export const TIERS: Tier[] = [
  { id: "newcomer",    label: "Новичок",  icon: "🌱", description: "Ещё нет опыта — самое время начать",            minTasks: 0  },
  { id: "trainee",     label: "Стажёр",   icon: "⭐",  description: "Есть первые задачи — работодатели замечают тебя", minTasks: 1  },
  { id: "experienced", label: "Опытный",  icon: "🔥", description: "Проверенный исполнитель",                         minTasks: 5  },
  { id: "pro",         label: "Профи",    icon: "💎", description: "Топ-исполнитель",                                 minTasks: 13 },
];

export interface TierProgress {
  current: Tier;
  next: Tier | null;
  tasksToNext: number;
  progressPct: number;
  completedCount: number;
}

function pluralTasks(n: number): string {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return `${n} задач`;
  if (m10 === 1) return `${n} задача`;
  if (m10 >= 2 && m10 <= 4) return `${n} задачи`;
  return `${n} задач`;
}

export function formatTasksToNext(n: number): string {
  return `ещё ${pluralTasks(n)}`;
}

export function computeTierProgress(completedCount: number): TierProgress {
  let currentIdx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (completedCount >= TIERS[i].minTasks) currentIdx = i;
    else break;
  }
  const current = TIERS[currentIdx];
  const next = TIERS[currentIdx + 1] ?? null;

  if (!next) {
    return { current, next: null, tasksToNext: 0, progressPct: 100, completedCount };
  }

  const rangeLen = next.minTasks - current.minTasks;
  const done = completedCount - current.minTasks;
  return {
    current,
    next,
    tasksToNext: next.minTasks - completedCount,
    progressPct: Math.round((done / rangeLen) * 100),
    completedCount,
  };
}
