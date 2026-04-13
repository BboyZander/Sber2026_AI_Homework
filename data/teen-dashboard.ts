import { applicationsByTeen } from "@/data/demo-applications";
import type { TeenProfile } from "@/types/user";

/** Порог XP для полоски «до следующего уровня» (демо). */
export function nextLevelXpTarget(level: number, currentXp: number): number {
  const step = 120 + level * 60;
  const target = Math.ceil((currentXp + 1) / step) * step;
  return Math.max(target, currentXp + 40);
}

export function teenApplicationsCount(teenId: string): number {
  return applicationsByTeen(teenId).length;
}

export function teenDashboardStats(teen: TeenProfile) {
  return {
    level: teen.level,
    xp: teen.xp,
    applicationsCount: teenApplicationsCount(teen.id),
    completedTasksCount: teen.completedTasksCount ?? 0,
    nextLevelXp: nextLevelXpTarget(teen.level, teen.xp),
  };
}
