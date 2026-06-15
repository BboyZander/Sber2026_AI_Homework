// Серверные запросы к Supabase (для server components / server actions).
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rowToApplication, rowToTask, type ApplicationRow, type TaskRow } from "@/lib/supabase/mappers";
import type { Task } from "@/types/task";
import type { Application } from "@/types/application";

/** Открытые задачи для каталога подростка. */
export async function getOpenTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as TaskRow[]).map(rowToTask);
}

/** Одна задача по id (любой статус, в рамках RLS). */
export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToTask(data as TaskRow) : null;
}

/** Отклики подростка. */
export async function getTeenApplications(teenId: string): Promise<Application[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("teen_id", teenId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ApplicationRow[]).map(rowToApplication);
}

/** Id избранных задач подростка. */
export async function getTeenFavoriteTaskIds(teenId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("task_id").eq("teen_id", teenId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { task_id: string }).task_id);
}
