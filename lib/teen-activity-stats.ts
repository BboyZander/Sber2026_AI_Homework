import type { Application } from "@/types/application";
import type { Task } from "@/types/task";
import { getTaskByIdForFlow } from "@/lib/employer-flow";
import { taskComparablePayRub } from "@/lib/task-payment";

function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

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
  let earnedThisMonthRub = 0;
  let expectedRub = 0;
  for (const a of apps) {
    const t = resolveTask(a.taskId);
    const payRub = t ? taskComparablePayRub(t) : 0;
    if (a.status === "paid") {
      earnedDemoRub += payRub;
      earnedDemoXp += t?.rewardXp ?? 0;
      const dateForMonth = a.paidAt ?? a.createdAt;
      if (isCurrentMonth(dateForMonth)) earnedThisMonthRub += payRub;
    }
    if (a.status === "accepted" || a.status === "submitted") {
      expectedRub += payRub;
    }
  }
  return { applicationsCount, completedTasksCount, earnedDemoRub, earnedDemoXp, earnedThisMonthRub, expectedRub };
}
