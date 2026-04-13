import { AppShell } from "@/components/shared/AppShell";
import { TeenProfileView } from "@/components/teen/TeenProfileView";
import { getDemoTeen } from "@/data/demo-users";

export default function TeenProfilePage() {
  const teen = getDemoTeen();

  return (
    <AppShell variant="teen" title="Профиль">
      <TeenProfileView initialTeen={teen} />
    </AppShell>
  );
}
