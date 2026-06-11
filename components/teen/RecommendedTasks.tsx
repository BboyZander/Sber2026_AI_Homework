import { demoTasks } from "@/data/demo-tasks";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TeenCatalogTaskCard } from "@/components/teen/TeenCatalogTaskCard";

export function RecommendedTasks() {
  const published = demoTasks.filter((t) => t.status === "open").slice(0, 3);

  if (published.length === 0) return null;

  return (
    <section>
      <SectionTitle title="Рекомендуем тебе" />
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-3">
        {published.map((task) => (
          <li key={task.id} className="min-w-0">
            <TeenCatalogTaskCard task={task} />
          </li>
        ))}
      </ul>
    </section>
  );
}
