import { AppShell } from "@/components/shared/AppShell";
import { TeenEmployerPublicProfileView } from "@/components/teen/TeenEmployerPublicProfileView";

export default async function TeenEmployerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell variant="teen" title="Заказчик">
      <TeenEmployerPublicProfileView employerId={id} />
    </AppShell>
  );
}
