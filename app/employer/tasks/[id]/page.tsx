import { AppShell } from "@/components/shared/AppShell";
import { EmployerTaskDetailView } from "@/components/employer/EmployerTaskDetailView";

export default async function EmployerTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell variant="employer" title="Задача">
      <EmployerTaskDetailView taskId={id} />
    </AppShell>
  );
}
