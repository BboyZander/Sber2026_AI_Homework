/**
 * Единое событие обновления профиля (подросток / работодатель) для синхронизации UI без смены маршрута.
 */

export const PROFILE_UPDATED_EVENT = "trajectory-profile-updated";

export type ProfileUpdatedDetail = {
  role: "teen" | "employer";
  userId: string;
};

export function emitProfileUpdated(detail: ProfileUpdatedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, { detail }));
}
