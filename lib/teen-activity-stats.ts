import type { Application } from "@/types/application";
import { getTaskByIdForFlow } from "@/lib/employer-flow";

export function computeTeenActivityStats(apps: Application[]) {
  const applicationsCount = apps.length;
  const completedTasksCount = apps.filter(
    (a) => a.status === "completed" || a.status === "paid",
  ).length;
  let earnedDemoRub = 0;
  let earnedDemoXp = 0;
  for (const a of apps) {
    if (a.status !== "paid") continue;
    const t = getTaskByIdForFlow(a.taskId);
    earnedDemoRub += t?.payRub ?? 0;
    earnedDemoXp += t?.rewardXp ?? 0;
  }
  return { applicationsCount, completedTasksCount, earnedDemoRub, earnedDemoXp };
}
