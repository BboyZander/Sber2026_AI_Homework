import { AppShell } from "@/components/shared/AppShell";
import { EmployerCabinetView } from "@/components/employer/EmployerCabinetView";
import { getDemoEmployer } from "@/data/demo-users";

export default function EmployerProfilePage() {
  const employer = getDemoEmployer();

  return (
    <AppShell variant="employer" title="Данные кабинета">
      <EmployerCabinetView initialEmployer={employer} />
    </AppShell>
  );
}
