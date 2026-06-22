// Профиль работодателя на Supabase (клиентский слой): кэш + общее событие
// PROFILE_UPDATED_EVENT. Чтение profiles + employer_profiles, запись редактируемых
// полей кабинета (наименование, тип, категории, описание, теги).
import { createClient } from "@/lib/supabase/client";
import { emitProfileUpdated } from "@/lib/profile-sync";
import type { EmployerCustomerType, EmployerProfile } from "@/types/user";
import type { TaskCategory } from "@/lib/constants";

let cache: EmployerProfile | null = null;

async function fetchProfile(): Promise<EmployerProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: base } = await supabase
    .from("profiles")
    .select("name, email, city, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!base || base.role !== "employer") return null;

  const { data: emp } = await supabase
    .from("employer_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const e = (emp ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    email: (base.email as string) ?? "",
    name: base.name as string,
    role: "employer",
    city: (base.city as string) ?? undefined,
    companyName: (e.company_name as string) ?? (base.name as string),
    inn: (e.inn as string) ?? undefined,
    innIp: (e.inn_ip as string) ?? undefined,
    ogrn: (e.ogrn as string) ?? undefined,
    ogrnip: (e.ogrnip as string) ?? undefined,
    verified: (e.verified as boolean) ?? undefined,
    customerType: (e.customer_type as EmployerCustomerType) ?? undefined,
    taskCategories: (e.task_categories as TaskCategory[]) ?? undefined,
    cabinetDescription: (e.cabinet_description as string) ?? undefined,
    cabinetTags: (e.cabinet_tags as string[]) ?? undefined,
    rating: (e.rating as number) ?? undefined,
    reviewsCount: (e.reviews_count as number) ?? undefined,
  };
}

export async function loadEmployerProfile(): Promise<EmployerProfile | null> {
  cache = await fetchProfile();
  if (cache) emitProfileUpdated({ role: "employer", userId: cache.id });
  return cache;
}

export function getEmployerProfileCached(): EmployerProfile | null {
  return cache;
}

export async function updateEmployerProfileFields(patch: Partial<EmployerProfile>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const basePatch: Record<string, unknown> = {};
  if (patch.name !== undefined) basePatch.name = patch.name;
  if (patch.city !== undefined) basePatch.city = patch.city;

  const empPatch: Record<string, unknown> = {};
  if (patch.companyName !== undefined) empPatch.company_name = patch.companyName;
  if (patch.customerType !== undefined) empPatch.customer_type = patch.customerType;
  if (patch.taskCategories !== undefined) empPatch.task_categories = patch.taskCategories;
  if (patch.cabinetDescription !== undefined) {
    empPatch.cabinet_description = patch.cabinetDescription ?? null;
  }
  if (patch.cabinetTags !== undefined) empPatch.cabinet_tags = patch.cabinetTags;

  if (Object.keys(basePatch).length > 0) {
    await supabase.from("profiles").update(basePatch).eq("id", user.id);
  }
  if (Object.keys(empPatch).length > 0) {
    await supabase.from("employer_profiles").update(empPatch).eq("id", user.id);
  }

  await loadEmployerProfile();
}
