// Профиль подростка на Supabase (клиентский слой): кэш в памяти + общее событие
// PROFILE_UPDATED_EVENT (из profile-sync), чтобы синхронные чтения и реактивность
// работали как прежде. Чтение из profiles + teen_profiles, запись — туда же.
import { createClient } from "@/lib/supabase/client";
import { emitProfileUpdated } from "@/lib/profile-sync";
import type { TeenPreferredTaskFormat, TeenProfile } from "@/types/user";

let cache: TeenProfile | null = null;

async function fetchProfile(): Promise<TeenProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: base } = await supabase
    .from("profiles")
    .select("name, email, city, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!base || base.role !== "teen") return null;

  const { data: tp } = await supabase
    .from("teen_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const t = (tp ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    email: (base.email as string) ?? "",
    name: base.name as string,
    role: "teen",
    avatarUrl: (base.avatar_url as string) ?? undefined,
    city: (base.city as string) ?? undefined,
    age: (t.age as number) ?? undefined,
    xp: (t.xp as number) ?? 0,
    level: (t.level as number) ?? 1,
    interests: (t.interests as string[]) ?? undefined,
    preferredTaskFormat: (t.preferred_task_format as TeenPreferredTaskFormat) ?? undefined,
    completedTasksCount: (t.completed_tasks_count as number) ?? undefined,
    onboarded: (t.onboarded as boolean) ?? false,
    motivation: (t.motivation as string[]) ?? undefined,
    weekendAvailability: (t.weekend_availability as boolean) ?? undefined,
    earningGoal:
      t.earning_goal_title != null || t.earning_goal_amount != null
        ? {
            title: (t.earning_goal_title as string) ?? undefined,
            amount: (t.earning_goal_amount as number) ?? undefined,
          }
        : undefined,
    homeAddress: (t.home_address as string) ?? undefined,
    homeLat: (t.home_lat as number) ?? undefined,
    homeLng: (t.home_lng as number) ?? undefined,
    searchRadiusKm: (t.search_radius_km as number) ?? undefined,
  };
}

/** Загрузить профиль в кэш и оповестить UI. */
export async function loadTeenProfile(): Promise<TeenProfile | null> {
  cache = await fetchProfile();
  if (cache) emitProfileUpdated({ role: "teen", userId: cache.id });
  return cache;
}

export function getTeenProfileCached(): TeenProfile | null {
  return cache;
}

/** Обновить редактируемые поля профиля (имя/город → profiles, остальное → teen_profiles). */
export async function updateTeenProfileFields(patch: Partial<TeenProfile>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const basePatch: Record<string, unknown> = {};
  if (patch.name !== undefined) basePatch.name = patch.name;
  if (patch.city !== undefined) basePatch.city = patch.city;

  const tpPatch: Record<string, unknown> = {};
  if (patch.age !== undefined) tpPatch.age = patch.age;
  if (patch.interests !== undefined) tpPatch.interests = patch.interests;
  if (patch.preferredTaskFormat !== undefined) {
    tpPatch.preferred_task_format = patch.preferredTaskFormat;
  }
  if (patch.onboarded !== undefined) tpPatch.onboarded = patch.onboarded;
  if (patch.motivation !== undefined) tpPatch.motivation = patch.motivation;
  if (patch.weekendAvailability !== undefined) {
    tpPatch.weekend_availability = patch.weekendAvailability;
  }
  if (patch.earningGoal !== undefined) {
    tpPatch.earning_goal_title = patch.earningGoal.title ?? null;
    tpPatch.earning_goal_amount = patch.earningGoal.amount ?? null;
  }
  if (patch.homeAddress !== undefined) tpPatch.home_address = patch.homeAddress || null;
  if (patch.homeLat !== undefined) tpPatch.home_lat = patch.homeLat ?? null;
  if (patch.homeLng !== undefined) tpPatch.home_lng = patch.homeLng ?? null;
  if (patch.searchRadiusKm !== undefined) tpPatch.search_radius_km = patch.searchRadiusKm ?? null;

  if (Object.keys(basePatch).length > 0) {
    await supabase.from("profiles").update(basePatch).eq("id", user.id);
  }
  if (Object.keys(tpPatch).length > 0) {
    await supabase.from("teen_profiles").update(tpPatch).eq("id", user.id);
  }

  await loadTeenProfile();
}
