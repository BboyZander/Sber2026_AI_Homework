import { StatCard } from "@/components/shared/StatCard";
import type { Task } from "@/types/task";

export function DashboardStats({ tasks }: { tasks: Task[] }) {
  const published = tasks.filter((t) => t.status === "published").length;
  const drafts = tasks.filter((t) => t.status === "draft").length;

  return (
    <div className="grid-cards">
      <StatCard label="В ленте" value={published} />
      <StatCard label="Черновики" value={drafts} />
      <StatCard label="Всего задач" value={tasks.length} />
    </div>
  );
}
