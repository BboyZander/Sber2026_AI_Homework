/**
 * Единая точка доступа к client-side профилям (демо + localStorage).
 * Низлежащие модули: `teen-profile`, `employer-profile`; событие синка — `profile-sync`.
 */

import { getDemoEmployer, getDemoTeen } from "@/data/demo-users";
import {
  getEmployerProfileMerged,
  resolveSessionEmployer,
  saveEmployerProfilePatch,
  type EmployerCabinetPatch,
  EMPLOYER_PROFILE_STORAGE_KEY,
} from "@/lib/employer-profile";
import { getCurrentEmployerId } from "@/lib/employer-flow";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
  emitProfileUpdated,
} from "@/lib/profile-sync";
import {
  getTeenProfileMerged,
  resolveSessionTeen,
  saveTeenProfilePatch,
  type TeenProfileEditablePatch,
  TEEN_PROFILE_STORAGE_KEY,
} from "@/lib/teen-profile";
import { getCurrentTeenId } from "@/lib/teen-flow";
import type { EmployerProfile, TeenProfile } from "@/types/user";

export { PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail, emitProfileUpdated } from "@/lib/profile-sync";

/** Ключи localStorage для сброса демо и документации. */
export const PROFILE_STORAGE_KEYS = {
  teen: TEEN_PROFILE_STORAGE_KEY,
  employer: EMPLOYER_PROFILE_STORAGE_KEY,
} as const;

/** Текущий профиль подростка: демо + сохранённые правки; на сервере — только демо. */
export function getTeenProfile(): TeenProfile {
  const base = getDemoTeen();
  if (typeof window === "undefined") return base;
  return resolveSessionTeen(base);
}

/** Сохранить правки профиля подростка (тот же id, что в mock-сессии или u1). */
export function updateTeenProfile(patch: TeenProfileEditablePatch, teenId: string = getCurrentTeenId()): void {
  saveTeenProfilePatch(teenId, patch);
}

/** Слить демо-профиль подростка с localStorage (явный base — для SSR/тестов). */
export function mergeTeenProfile(base: TeenProfile): TeenProfile {
  return getTeenProfileMerged(base);
}

/** Текущий профиль работодателя: демо + сохранённые правки. */
export function getEmployerProfile(): EmployerProfile {
  const base = getDemoEmployer();
  if (typeof window === "undefined") return base;
  return resolveSessionEmployer(base);
}

/** Сохранить данные кабинета работодателя. */
export function updateEmployerProfile(patch: EmployerCabinetPatch, employerId: string = getCurrentEmployerId()): void {
  saveEmployerProfilePatch(employerId, patch);
}

export function mergeEmployerProfile(base: EmployerProfile): EmployerProfile {
  return getEmployerProfileMerged(base);
}
