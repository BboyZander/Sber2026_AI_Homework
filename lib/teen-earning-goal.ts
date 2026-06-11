/**
 * Личная цель заработка подростка (демо): хранится в localStorage по teenId.
 * Используется блоком «Заработано» на Главной для круговой диаграммы прогресса.
 */

const GOAL_KEY = "trajectory-teen-earning-goal-v1";

export const TEEN_EARNING_GOAL_EVENT = "trajectory-teen-earning-goal";
export const DEFAULT_TEEN_EARNING_GOAL_RUB = 5000;

type GoalsMap = Record<string, number>;

function readMap(): GoalsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(GOAL_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const out: GoalsMap = {};
    for (const [teenId, value] of Object.entries(data as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) out[teenId] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: GoalsMap) {
  window.localStorage.setItem(GOAL_KEY, JSON.stringify(map));
}

/** Текущая цель подростка в рублях (демо: «сколько хочу заработать»). */
export function getTeenEarningGoal(teenId: string): number {
  const v = readMap()[teenId];
  return typeof v === "number" ? v : DEFAULT_TEEN_EARNING_GOAL_RUB;
}

/** Сохранить новую цель и оповестить подписчиков (диаграмма на Главной). */
export function setTeenEarningGoal(teenId: string, goalRub: number): void {
  if (typeof window === "undefined") return;
  const safe = Math.round(goalRub);
  if (!Number.isFinite(safe) || safe <= 0) return;
  const map = readMap();
  map[teenId] = safe;
  writeMap(map);
  window.dispatchEvent(new CustomEvent(TEEN_EARNING_GOAL_EVENT, { detail: { teenId } }));
}
