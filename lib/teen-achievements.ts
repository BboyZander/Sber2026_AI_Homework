import type { Application } from "@/types/application";
import type { Task } from "@/types/task";
import type { TeenProfile } from "@/types/user";

export interface ComputedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedLabel?: string;
  progress?: { current: number; max: number };
}

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function computeAchievements(
  apps: Application[],
  teen: TeenProfile,
  tasksById: Record<string, Task>,
): ComputedAchievement[] {
  const sorted = [...apps].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const completed = apps.filter((a) => a.status === "submitted" || a.status === "paid");
  const firstApp = sorted[0];
  const firstAccepted = sorted.find(
    (a) => a.status === "accepted" || a.status === "submitted" || a.status === "paid",
  );
  const firstPaid = sorted.find((a) => a.status === "paid");

  const categorySet = new Set<string>();
  for (const a of apps.filter((a) => a.status !== "rejected")) {
    const task = tasksById[a.taskId];
    if (task?.category) categorySet.add(task.category);
  }

  const hasProfile = !!(teen.city && teen.interests?.length);
  const completedCount = completed.length;
  const categoryCount = categorySet.size;

  return [
    {
      id: "first-step",
      title: "Первый шаг",
      description: "Отправил первый отклик в Траектории",
      icon: "🌱",
      unlocked: apps.length >= 1,
      unlockedLabel: firstApp ? shortDate(firstApp.createdAt) : undefined,
    },
    {
      id: "profile-set",
      title: "Профиль в деле",
      description: "Заполнен город и интересы — основа для подбора задач",
      icon: "⚙️",
      unlocked: hasProfile,
      unlockedLabel: hasProfile ? "Заполнен" : undefined,
    },
    {
      id: "in-team",
      title: "В команде",
      description: "Отклик принят: задача в работе",
      icon: "🤝",
      unlocked: !!firstAccepted,
      unlockedLabel: firstAccepted ? shortDate(firstAccepted.createdAt) : undefined,
    },
    {
      id: "closed-loop",
      title: "Закрытый цикл",
      description: "Задача выполнена и оплачена",
      icon: "💰",
      unlocked: !!firstPaid,
      unlockedLabel: firstPaid ? shortDate(firstPaid.paidAt ?? firstPaid.createdAt) : undefined,
    },
    {
      id: "streak-5",
      title: "Серия ×5",
      description: "Завершить 5 задач",
      icon: "⚡",
      unlocked: completedCount >= 5,
      unlockedLabel: completedCount >= 5 ? `${completedCount} задач` : undefined,
      progress: completedCount < 5 ? { current: completedCount, max: 5 } : undefined,
    },
    {
      id: "variety",
      title: "Разнообразие",
      description: "Откликнуться на задачи из трёх разных категорий",
      icon: "🌟",
      unlocked: categoryCount >= 3,
      unlockedLabel: categoryCount >= 3 ? "3+ категории" : undefined,
      progress: categoryCount < 3 ? { current: categoryCount, max: 3 } : undefined,
    },
  ];
}
