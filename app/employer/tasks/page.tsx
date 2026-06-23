import { Suspense } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { EmployerKanbanBoard } from "@/components/employer/EmployerKanbanBoard";

export default function EmployerTasksPage() {
  return (
    <AppShell variant="employer" title="Мои задачи" fullWidth>
      <Suspense fallback={null}>
        <EmployerKanbanBoard />
      </Suspense>
    </AppShell>
  );
}
