import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { TeenHomeView } from "@/components/teen/TeenHomeView";
import { getServerTeenProfile } from "@/lib/supabase/queries";

export default async function TeenDashboardPage() {
  const teen = await getServerTeenProfile();
  if (!teen) redirect("/login");

  return (
    <AppShell variant="teen" title="Главная">
      <TeenHomeView teen={teen} />
    </AppShell>
  );
}
