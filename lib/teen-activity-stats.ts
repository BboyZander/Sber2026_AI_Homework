import type { Application } from "@/types/application";
import type { Task } from "@/types/task";
import { getTaskByIdForFlow } from "@/lib/employer-flow";
import { taskComparablePayRub } from "@/lib/task-payment";

/**
 * Статистика активности подростка. По умолчанию задачи берутся из демо-слоя;
 * для реальных данных передай resolveTask (например, lookup по карте задач Supabase).
 */
export function computeTeenActivityStats(
  apps: Application[],
  resolveTask: (taskId: string) => Task | null | undefined = getTaskByIdForFlow,
) {
  const applicationsCount = apps.length;
  const completedTasksCount = apps.filter(
    (a) => a.status === "submitted" || a.status === "paid",
  ).length;
  let earnedDemoRub = 0;
  let earnedDemoXp = 0;
  for (const a of apps) {
    if (a.status !== "paid") continue;
    const t = resolveTask(a.taskId);
    earnedDemoRub += t ? taskComparablePayRub(t) : 0;
    earnedDemoXp += t?.rewardXp ?? 0;
  }
  return { applicationsCount, completedTasksCount, earnedDemoRub, earnedDemoXp };
}
