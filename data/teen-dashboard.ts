import { applicationsByTeen } from "@/data/demo-applications";
import { getTaskById } from "@/data/demo-tasks";
import type { Application } from "@/types/application";
import { taskComparablePayRub } from "@/lib/task-payment";
import type { TeenProfile } from "@/types/user";

/** Порог XP для полоски «до следующего уровня» (демо). */
export function nextLevelXpTarget(level: number, currentXp: number): number {
  const step = 120 + level * 60;
  const target = Math.ceil((currentXp + 1) / step) * step;
  return Math.max(target, currentXp + 40);
}

export type TeenActivityTotals = {
  applicationsCount: number;
  completedTasksCount: number;
  earnedDemoRub: number;
  earnedDemoXp: number;
};

export type TeenDashboardDisplayStats = {
  level: number;
  /** Базовый XP из профиля + XP с задач со статусом «Оплачено» (как на странице профиля). */
  xp: number;
  applicationsCount: number;
  completedTasksCount: number;
  nextLevelXp: number;
  earnedDemoRub: number;
};

/** Только демо-задачи из кода — для SSR без клиентского `getTaskByIdForFlow`. */
export function computeTeenActivityTotalsDemoTasks(apps: Application[]): TeenActivityTotals {
  const applicationsCount = apps.length;
  const completedTasksCount = apps.filter(
    (a) => a.status === "submitted" || a.status === "paid",
  ).length;
  let earnedDemoRub = 0;
  let earnedDemoXp = 0;
  for (const a of apps) {
    if (a.status !== "paid") continue;
    const t = getTaskById(a.taskId);
    earnedDemoRub += t ? taskComparablePayRub(t) : 0;
    earnedDemoXp += t?.rewardXp ?? 0;
  }
  return { applicationsCount, completedTasksCount, earnedDemoRub, earnedDemoXp };
}

export function toDashboardDisplayStats(teen: TeenProfile, activity: TeenActivityTotals): TeenDashboardDisplayStats {
  const currentXp = teen.xp + activity.earnedDemoXp;
  return {
    level: teen.level,
    xp: currentXp,
    applicationsCount: activity.applicationsCount,
    completedTasksCount: activity.completedTasksCount,
    nextLevelXp: nextLevelXpTarget(teen.level, currentXp),
    earnedDemoRub: activity.earnedDemoRub,
  };
}

export function teenApplicationsCount(teenId: string): number {
  return applicationsByTeen(teenId).length;
}

export function teenDashboardStats(teen: TeenProfile): TeenDashboardDisplayStats {
  return toDashboardDisplayStats(teen, computeTeenActivityTotalsDemoTasks(applicationsByTeen(teen.id)));
}
