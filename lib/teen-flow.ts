/**
 * Единая точка входа для сценария подростка: отклики, счётчики, localStorage.
 * Нижний слой — `teen-applications-storage`; отсюда деривируем UI и тосты.
 */

import type { Application } from "@/types/application";
import { getMockSession } from "@/lib/auth";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import {
  appendTeenApplication,
  getApplicationsForTask as getTaskApplications,
  getMergedApplicationsForTeen,
  notifyTeenApplicationsChanged,
  setApplicationStatus,
  withdrawTeenApplication,
} from "@/lib/teen-applications-storage";
import { TEEN_TOASTS } from "@/lib/ui-copy";

export const TEEN_FLOW_TOAST_EVENT = "trajectory-teen-flow-toast";

export type TeenFlowToastDetail = { message: string };

export {
  TEEN_APPLICATIONS_EVENT,
  TEEN_APPLICATIONS_EXTRA_KEY,
  TEEN_APPLICATIONS_OVERRIDES_KEY,
  TEEN_APPLICATIONS_WITHDRAWN_KEY,
  canWithdrawApplication,
  getMergedApplicationsForTeen,
} from "@/lib/teen-applications-storage";

/** ID подростка для демо-сессии (или u1 до входа / вне teen). */
export function getCurrentTeenId(): string {
  if (typeof window === "undefined") return "u1";
  const s = getMockSession();
  return s?.role === "teen" ? s.userId : "u1";
}

/** Все отклики текущего подростка: демо + localStorage, с учётом отозванных. */
export function getApplications(teenId?: string): Application[] {
  return getMergedApplicationsForTeen(teenId ?? getCurrentTeenId());
}

/** Статистика активности для дашборда и профиля (те же правила, что на /teen/profile). */
export function getApplicationStats(teenId?: string) {
  return computeTeenActivityStats(getApplications(teenId));
}

export function getApplicationsForTask(taskId: string): Application[] {
  return getTaskApplications(taskId);
}

/**
 * Откликнуться на задачу из карточки/деталки. Пишет в localStorage и шлёт события.
 * @returns результат: добавлено ли (false если уже был отклик).
 */
export function applyToTask(taskId: string): { added: boolean } {
  if (typeof window === "undefined") return { added: false };
  const teenId = getCurrentTeenId();
  const added = appendTeenApplication(teenId, taskId);
  if (added) {
    window.dispatchEvent(
      new CustomEvent<TeenFlowToastDetail>(TEEN_FLOW_TOAST_EVENT, {
        detail: {
          message: TEEN_TOASTS.applySuccess,
        },
      }),
    );
  }
  return { added };
}

/** Отозвать отклик (sent / awaiting / rejected), синхронизация через TEEN_APPLICATIONS_EVENT. */
export function withdrawApplication(app: Application, teenId?: string): void {
  withdrawTeenApplication(teenId ?? getCurrentTeenId(), app);
}

export function updateApplicationStatus(appId: string, status: Application["status"]): boolean {
  return setApplicationStatus(appId, status);
}

/** Показать тост в сценарии подростка (например после действия на экране). */
export function pushTeenToast(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<TeenFlowToastDetail>(TEEN_FLOW_TOAST_EVENT, {
      detail: { message },
    }),
  );
}

/** Явное уведомление подписчиков (например после миграции данных). */
export function refreshTeenFlowViews(): void {
  notifyTeenApplicationsChanged();
}
