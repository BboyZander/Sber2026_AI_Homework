import { AppShell } from "@/components/shared/AppShell";
import { TeenTaskDetailPageView } from "@/components/teen/TeenTaskDetailPageView";

export default async function TeenTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell variant="teen" title="Задача">
      <TeenTaskDetailPageView taskId={id} />
    </AppShell>
  );
}
