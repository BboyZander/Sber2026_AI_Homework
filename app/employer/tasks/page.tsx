import { AppShell } from "@/components/shared/AppShell";
import { EmployerTasksView } from "@/components/employer/EmployerTasksView";

export default function EmployerTasksPage() {
  return (
    <AppShell variant="employer" title="Мои задачи">
      <EmployerTasksView />
    </AppShell>
  );
}
