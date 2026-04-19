/**
 * Локальное состояние демо (localStorage). Сессия и тема не трогаем.
 * После сброса остаются только зашитые в коде demo-задачи и demo-отклики.
 */

import { EMPLOYER_TASKS_EXTRA_KEY, notifyEmployerTasksChanged } from "@/lib/employer-tasks-storage";
import {
  notifyTeenApplicationsChanged,
  TEEN_APPLICATIONS_EXTRA_KEY,
  TEEN_APPLICATIONS_OVERRIDES_KEY,
  TEEN_APPLICATIONS_WITHDRAWN_KEY,
} from "@/lib/teen-applications-storage";
import { getDemoEmployer, getDemoTeen } from "@/data/demo-users";
import { emitProfileUpdated } from "@/lib/profile-sync";
import { PROFILE_STORAGE_KEYS } from "@/lib/profile-store";

const DEMO_STORAGE_KEYS = [
  EMPLOYER_TASKS_EXTRA_KEY,
  TEEN_APPLICATIONS_EXTRA_KEY,
  TEEN_APPLICATIONS_WITHDRAWN_KEY,
  TEEN_APPLICATIONS_OVERRIDES_KEY,
  PROFILE_STORAGE_KEYS.teen,
  PROFILE_STORAGE_KEYS.employer,
] as const;

export function clearDemoPersistedState(): void {
  if (typeof window === "undefined") return;
  for (const key of DEMO_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
  notifyEmployerTasksChanged();
  notifyTeenApplicationsChanged();
  emitProfileUpdated({ role: "teen", userId: getDemoTeen().id });
  emitProfileUpdated({ role: "employer", userId: getDemoEmployer().id });
}
