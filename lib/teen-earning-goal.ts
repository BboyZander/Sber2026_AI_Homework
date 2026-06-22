/**
 * Личная цель заработка подростка: хранится в Supabase (teen_profiles.earning_goal_amount).
 * Используется блоком «Заработано» на Главной для круговой диаграммы прогресса и онбордингом (F0.6).
 * Раньше жила в localStorage — перенесена в БД при F0.6 (остаток F16.2).
 */
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_TEEN_EARNING_GOAL_RUB = 5000;

/** Текущая цель заработка в рублях для залогиненного подростка (фолбэк — дефолт). */
export async function getTeenEarningGoal(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_TEEN_EARNING_GOAL_RUB;

  const { data } = await supabase
    .from("teen_profiles")
    .select("earning_goal_amount")
    .eq("id", user.id)
    .maybeSingle();

  const v = data?.earning_goal_amount;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : DEFAULT_TEEN_EARNING_GOAL_RUB;
}

/** Сохранить новую цель заработка в профиль подростка. */
export async function setTeenEarningGoal(goalRub: number): Promise<void> {
  const safe = Math.round(goalRub);
  if (!Number.isFinite(safe) || safe <= 0) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("teen_profiles").update({ earning_goal_amount: safe }).eq("id", user.id);
}
