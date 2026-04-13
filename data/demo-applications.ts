import type { Application } from "@/types/application";

export const demoApplications: Application[] = [
  {
    id: "app-1",
    taskId: "task-1",
    teenId: "u1",
    status: "awaiting",
    message: "Готов выйти в удобное для вас время после школы.",
    createdAt: "2026-04-10T11:00:00.000Z",
  },
  {
    id: "app-2",
    taskId: "task-2",
    teenId: "u1",
    status: "in_progress",
    createdAt: "2026-04-08T16:20:00.000Z",
  },
  {
    id: "app-3",
    taskId: "task-6",
    teenId: "u1",
    status: "sent",
    createdAt: "2026-04-11T09:00:00.000Z",
  },
  {
    id: "app-4",
    taskId: "task-8",
    teenId: "u1",
    status: "completed",
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "app-5",
    taskId: "task-4",
    teenId: "u1",
    status: "paid",
    createdAt: "2026-03-28T15:00:00.000Z",
  },
];

export function applicationsByTeen(teenId: string): Application[] {
  return demoApplications.filter((a) => a.teenId === teenId);
}
