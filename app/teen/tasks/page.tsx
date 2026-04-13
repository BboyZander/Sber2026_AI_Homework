import { AppShell } from "@/components/shared/AppShell";
import { TeenTasksCatalogView } from "@/components/teen/TeenTasksCatalogView";

export default function TeenTasksPage() {
  return (
    <AppShell variant="teen" title="Задачи">
      <TeenTasksCatalogView />
    </AppShell>
  );
}
