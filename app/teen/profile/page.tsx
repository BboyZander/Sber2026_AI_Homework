import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { TeenProfileView } from "@/components/teen/TeenProfileView";
import { getServerTeenProfile } from "@/lib/supabase/queries";

export default async function TeenProfilePage() {
  const teen = await getServerTeenProfile();
  if (!teen) redirect("/login");

  return (
    <AppShell variant="teen" title="Профиль">
      <TeenProfileView initialTeen={teen} />
    </AppShell>
  );
}
