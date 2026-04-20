import type { Application } from "@/types/application";

/**
 * Отклики демо-подростка u1, согласованы со статусами задач в demo-tasks:
 * tdemo-08/09 — open + applied; tdemo-10–12 — in_progress + accepted; tdemo-13–15 — completed + paid.
 */
export const demoApplications: Application[] = [
  {
    id: "app-tdemo-08",
    taskId: "tdemo-08",
    teenId: "u1",
    status: "applied",
    message: "Могу в любой день после 15:00, опыт на стойках есть.",
    createdAt: "2026-04-12T10:00:00.000Z",
  },
  {
    id: "app-tdemo-09",
    taskId: "tdemo-09",
    teenId: "u1",
    status: "applied",
    message: "Аккуратен, внимателен к дедлайнам.",
    createdAt: "2026-04-13T09:15:00.000Z",
  },
  {
    id: "app-tdemo-10",
    taskId: "tdemo-10",
    teenId: "u1",
    status: "accepted",
    createdAt: "2026-04-11T08:00:00.000Z",
  },
  {
    id: "app-tdemo-11",
    taskId: "tdemo-11",
    teenId: "u1",
    status: "accepted",
    createdAt: "2026-04-11T08:05:00.000Z",
  },
  {
    id: "app-tdemo-12",
    taskId: "tdemo-12",
    teenId: "u1",
    status: "accepted",
    createdAt: "2026-04-12T14:00:00.000Z",
  },
  {
    id: "app-tdemo-13",
    taskId: "tdemo-13",
    teenId: "u1",
    status: "paid",
    createdAt: "2026-03-28T16:00:00.000Z",
  },
  {
    id: "app-tdemo-14",
    taskId: "tdemo-14",
    teenId: "u1",
    status: "paid",
    createdAt: "2026-03-29T12:00:00.000Z",
  },
  {
    id: "app-tdemo-15",
    taskId: "tdemo-15",
    teenId: "u1",
    status: "paid",
    createdAt: "2026-03-30T10:30:00.000Z",
  },
];

export function applicationsByTeen(teenId: string): Application[] {
  return demoApplications.filter((a) => a.teenId === teenId);
}
