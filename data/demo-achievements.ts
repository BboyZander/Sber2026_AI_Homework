import type { Achievement } from "@/types/achievement";

export const demoAchievements: Achievement[] = [
  {
    id: "ach-first-task",
    title: "Первый шаг",
    description: "Отправил первый отклик в Траектории",
    icon: "◆",
    xpReward: 10,
    unlockedAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: "ach-profile",
    title: "Профиль в деле",
    description: "Город, возраст и интересы — база для подбора задач",
    icon: "◇",
    xpReward: 25,
    unlockedAt: "2026-04-02T12:00:00.000Z",
  },
  {
    id: "ach-in-progress",
    title: "В команде",
    description: "Отклик принят: задача в статусе «в работе»",
    icon: "⬡",
    xpReward: 40,
    unlockedAt: "2026-04-08T14:00:00.000Z",
  },
  {
    id: "ach-paid",
    title: "Закрытый цикл",
    description: "Выплата по задаче отмечена как обработанная",
    icon: "✦",
    xpReward: 60,
    unlockedAt: "2026-04-10T16:30:00.000Z",
  },
  {
    id: "ach-streak",
    title: "Серия ×5",
    description: "Завершить пять задач подряд без просрочки",
    icon: "○",
    xpReward: 120,
  },
  {
    id: "ach-catalog",
    title: "Исследователь каталога",
    description: "Откликнуться на задачи из трёх разных категорий",
    icon: "△",
    xpReward: 35,
  },
];
