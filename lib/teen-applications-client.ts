// Отклики подростка на Supabase (клиентский слой, только чтение).
// Кэш в памяти + событие — для синхронных чтений и реактивности карточек.
// Мутации (отклик/отзыв) добавим на слайсе детальной страницы и «В работе».
import { createClient } from "@/lib/supabase/client";
import { rowToApplication, type ApplicationRow } from "@/lib/supabase/mappers";
import type { Application } from "@/types/application";

export const TEEN_APPLICATIONS_EVENT = "trajectory-teen-applications";

let cache: Application[] = [];
let teenId: string | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TEEN_APPLICATIONS_EVENT));
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

/** Загрузить отклики текущего подростка в кэш и оповестить UI. */
export async function loadApplications(): Promise<void> {
  const supabase = createClient();
  const id = await ensureTeenId();
  if (!id) {
    cache = [];
    emit();
    return;
  }
  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("teen_id", id)
    .order("created_at", { ascending: false });
  cache = ((data ?? []) as ApplicationRow[]).map(rowToApplication);
  emit();
}

export function getApplicationsCached(): Application[] {
  return cache;
}

export function getApplicationForTaskCached(taskId: string): Application | null {
  return cache.find((a) => a.taskId === taskId) ?? null;
}

/** Отозвать можно отклик в статусе applied/rejected (как в прежнем потоке). */
export function canWithdraw(app: Application): boolean {
  return app.status === "applied" || app.status === "rejected";
}

/** Откликнуться на задачу. false, если уже есть отклик или нет сессии. */
export async function applyToTask(taskId: string): Promise<{ added: boolean }> {
  const id = await ensureTeenId();
  if (!id) return { added: false };
  if (getApplicationForTaskCached(taskId)) return { added: false };

  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .insert({ teen_id: id, task_id: taskId, status: "applied" });
  if (error) return { added: false };

  await loadApplications();
  return { added: true };
}

/** Отметить выполненным: отклик accepted → submitted (ждёт подтверждения). */
export async function markSubmitted(taskId: string): Promise<boolean> {
  const id = await ensureTeenId();
  if (!id) return false;
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status: "submitted" })
    .eq("teen_id", id)
    .eq("task_id", taskId);
  if (error) return false;
  await loadApplications();
  return true;
}

/** Отозвать отклик (удаляет строку отклика). */
export async function withdrawApplication(taskId: string): Promise<void> {
  const id = await ensureTeenId();
  if (!id) return;
  const supabase = createClient();
  await supabase.from("applications").delete().eq("teen_id", id).eq("task_id", taskId);
  await loadApplications();
}
