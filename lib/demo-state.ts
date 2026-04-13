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

const DEMO_STORAGE_KEYS = [
  EMPLOYER_TASKS_EXTRA_KEY,
  TEEN_APPLICATIONS_EXTRA_KEY,
  TEEN_APPLICATIONS_WITHDRAWN_KEY,
  TEEN_APPLICATIONS_OVERRIDES_KEY,
] as const;

export function clearDemoPersistedState(): void {
  if (typeof window === "undefined") return;
  for (const key of DEMO_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
  notifyEmployerTasksChanged();
  notifyTeenApplicationsChanged();
}
