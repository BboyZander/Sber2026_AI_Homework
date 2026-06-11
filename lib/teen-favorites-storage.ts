/** Избранные задачи подростка (E8): localStorage по образцу teen-applications-storage. */

const FAVORITES_KEY = "trajectory-teen-favorites-v1";

export const TEEN_FAVORITES_KEY = FAVORITES_KEY;
export const TEEN_FAVORITES_EVENT = "trajectory-teen-favorites";

type FavoritesMap = Record<string, string[]>;

function readFavorites(): FavoritesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data as FavoritesMap;
  } catch {
    return {};
  }
}

function writeFavorites(map: FavoritesMap) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(map));
}

function notifyFavoritesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TEEN_FAVORITES_EVENT));
}

export function getFavoriteTaskIds(teenId: string): string[] {
  return readFavorites()[teenId] ?? [];
}

export function isFavoriteTask(teenId: string, taskId: string): boolean {
  return getFavoriteTaskIds(teenId).includes(taskId);
}

/** Переключает избранное и возвращает новое состояние (true — теперь в избранном). */
export function toggleFavoriteTask(teenId: string, taskId: string): boolean {
  if (typeof window === "undefined") return false;
  const map = readFavorites();
  const list = map[teenId] ?? [];
  const idx = list.indexOf(taskId);
  const isNowFavorite = idx === -1;
  map[teenId] = isNowFavorite ? [...list, taskId] : list.filter((id) => id !== taskId);
  writeFavorites(map);
  notifyFavoritesChanged();
  return isNowFavorite;
}
