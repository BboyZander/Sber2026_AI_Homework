import { AppShell } from "@/components/shared/AppShell";
import { TeenApplicationsView } from "@/components/teen/TeenApplicationsView";

export default function TeenApplicationsPage() {
  return (
    <AppShell variant="teen" title="Отклики">
      <TeenApplicationsView />
    </AppShell>
  );
}
