// Избранное подростка на Supabase (клиентский слой).
// Кэш в памяти + событие — чтобы сохранить синхронные чтения и реактивность UI,
// как в прежнем localStorage-модуле. Запись идёт напрямую через браузер-клиент
// (RLS разрешает подростку управлять только своим избранным).
import { createClient } from "@/lib/supabase/client";

export const TEEN_FAVORITES_EVENT = "trajectory-teen-favorites";

let cache = new Set<string>();
let teenId: string | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TEEN_FAVORITES_EVENT));
  }
}

async function ensureTeenId(): Promise<string | null> {
  if (teenId) return teenId;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  teenId = user?.id ?? null;
  return teenId;
}

/** Загрузить избранное текущего подростка в кэш и оповестить UI. */
export async function loadFavorites(): Promise<void> {
  const supabase = createClient();
  const id = await ensureTeenId();
  if (!id) {
    cache = new Set();
    emit();
    return;
  }
  const { data } = await supabase.from("favorites").select("task_id").eq("teen_id", id);
  cache = new Set((data ?? []).map((r) => (r as { task_id: string }).task_id));
  emit();
}

export function getFavoriteIdsCached(): string[] {
  return [...cache];
}

export function isFavoriteCached(taskId: string): boolean {
  return cache.has(taskId);
}

/** Переключить избранное: оптимистично обновляем кэш, затем пишем в Supabase. */
export async function toggleFavorite(taskId: string): Promise<boolean> {
  const id = await ensureTeenId();
  if (!id) return false;

  const supabase = createClient();
  const willAdd = !cache.has(taskId);

  if (willAdd) cache.add(taskId);
  else cache.delete(taskId);
  emit();

  const { error } = willAdd
    ? await supabase.from("favorites").insert({ teen_id: id, task_id: taskId })
    : await supabase.from("favorites").delete().eq("teen_id", id).eq("task_id", taskId);

  if (error) {
    // Откат при ошибке.
    if (willAdd) cache.delete(taskId);
    else cache.add(taskId);
    emit();
  }
  return cache.has(taskId);
}
