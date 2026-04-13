import { AppShell } from "@/components/shared/AppShell";
import { TeenDashboardContent } from "@/components/teen/TeenDashboardContent";
import { teenDashboardStats } from "@/data/teen-dashboard";
import { getDemoTeen } from "@/data/demo-users";

export default function TeenDashboardPage() {
  const teen = getDemoTeen();
  const stats = teenDashboardStats(teen);

  return (
    <AppShell variant="teen" title="Главная">
      <TeenDashboardContent teen={teen} stats={stats} />
    </AppShell>
  );
}
