import { redirect } from "next/navigation";
import { getSessionUser, getCurrentTeenOnboarded } from "@/lib/supabase/auth";
import { roleHomePath } from "@/lib/auth";
import { OnboardingFlow } from "@/components/teen/onboarding/OnboardingFlow";

/**
 * F0.6 — онбординг при первом входе подростка.
 * Гейт: только залогиненный подросток с onboarded=false; остальных уводим в кабинет/логин.
 */
export default async function TeenOnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "teen") redirect(roleHomePath(user.role));

  const onboarded = await getCurrentTeenOnboarded();
  if (onboarded) redirect("/teen/dashboard");

  return <OnboardingFlow teenName={user.name} />;
}
