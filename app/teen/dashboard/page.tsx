import { AppShell } from "@/components/shared/AppShell";
import { TeenHomeView } from "@/components/teen/TeenHomeView";
import { getDemoTeen } from "@/data/demo-users";

export default function TeenDashboardPage() {
  const teen = getDemoTeen();

  return (
    <AppShell variant="teen" title="Главная">
      <TeenHomeView teen={teen} />
    </AppShell>
  );
}
