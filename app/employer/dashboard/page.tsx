import { AppShell } from "@/components/shared/AppShell";
import { EmployerDashboardView } from "@/components/employer/EmployerDashboardView";
import { getDemoEmployer } from "@/data/demo-users";

export default function EmployerDashboardPage() {
  const employer = getDemoEmployer();

  return (
    <AppShell variant="employer" title="Главная">
      <EmployerDashboardView employer={employer} />
    </AppShell>
  );
}
