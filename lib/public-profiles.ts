import { getDemoUserById } from "@/lib/auth";
import { getEmployerProfileMerged } from "@/lib/employer-profile";
import { getTeenProfileMerged } from "@/lib/teen-profile";
import type { EmployerProfile, TeenProfile } from "@/types/user";

/** Профиль работодателя из демо-справочника + localStorage (только в браузере после гидрации). */
export function getPublicEmployerProfile(employerId: string): EmployerProfile | null {
  const u = getDemoUserById(employerId);
  if (!u || u.role !== "employer") return null;
  const { login: _l, password: _p, ...rest } = u;
  return getEmployerProfileMerged(rest as EmployerProfile);
}

/** Профиль подростка из демо-справочника + localStorage. */
export function getPublicTeenProfile(teenId: string): TeenProfile | null {
  const u = getDemoUserById(teenId);
  if (!u || u.role !== "teen") return null;
  const { login: _l, password: _p, ...rest } = u;
  return getTeenProfileMerged(rest as TeenProfile);
}
