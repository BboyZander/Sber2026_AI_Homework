import { StatCard } from "@/components/shared/StatCard";
import type { Task } from "@/types/task";

export function DashboardStats({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status === "open").length;
  const drafts = tasks.filter((t) => t.status === "draft").length;

  return (
    <div className="grid-cards">
      <StatCard label="Открытые" value={open} />
      <StatCard label="Черновики" value={drafts} />
      <StatCard label="Всего задач" value={tasks.length} />
    </div>
  );
}
