import Link from "next/link";
import { demoTasks } from "@/data/demo-tasks";
import { TaskCard } from "@/components/shared/TaskCard";
import { SectionTitle } from "@/components/shared/SectionTitle";

export function RecommendedTasks() {
  const published = demoTasks.filter((t) => t.status === "open").slice(0, 3);

  return (
    <section>
      <SectionTitle
        title="Рекомендуемые задачи"
        action={
          <Link
            href="/teen/tasks"
            className="text-sm font-medium text-accent transition hover:text-accent-bright no-underline hover:no-underline"
          >
            Все задачи →
          </Link>
        }
      />
      <div className="stack">
        {published.map((task) => (
          <TaskCard key={task.id} task={task} href={`/teen/tasks/${task.id}`} />
        ))}
      </div>
    </section>
  );
}

