import { AppShell } from "@/components/shared/AppShell";
import { EmployerTeenPublicProfileView } from "@/components/employer/EmployerTeenPublicProfileView";

export default async function EmployerTeenPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell variant="employer" title="Профиль подростка">
      <EmployerTeenPublicProfileView teenId={id} />
    </AppShell>
  );
}
