// Серверные запросы к Supabase (для server components / server actions).
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rowToApplication, rowToTask, type ApplicationRow, type TaskRow } from "@/lib/supabase/mappers";
import type { Task } from "@/types/task";
import type { Application } from "@/types/application";
import type { EmployerCustomerType, EmployerProfile, TeenPreferredTaskFormat, TeenProfile } from "@/types/user";
import type { TaskCategory } from "@/lib/constants";

/** Открытые задачи для каталога подростка. Рейтинг работодателя подтягивается вторым запросом (E5). */
export async function getOpenTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const tasks = (data ?? []) as TaskRow[];

  // Собираем уникальные employer_id и подтягиваем рейтинги одним запросом.
  const employerIds = [...new Set(tasks.map((t) => t.employer_id))];
  const ratingMap = new Map<string, { rating: number | null; reviews_count: number | null }>();
  if (employerIds.length > 0) {
    const { data: eps } = await supabase
      .from("employer_profiles")
      .select("id, rating, reviews_count")
      .in("id", employerIds);
    for (const ep of (eps ?? []) as { id: string; rating: number | null; reviews_count: number | null }[]) {
      ratingMap.set(ep.id, { rating: ep.rating, reviews_count: ep.reviews_count });
    }
  }

  return tasks.map((r) => {
    const ep = ratingMap.get(r.employer_id);
    return rowToTask({
      ...r,
      employer_rating: ep?.rating ?? null,
      employer_reviews_count: ep?.reviews_count ?? null,
    });
  });
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

/** Профиль текущего залогиненного подростка (для server components). */
export async function getServerTeenProfile(): Promise<TeenProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: base } = await supabase
    .from("profiles")
    .select("name, email, city, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!base || base.role !== "teen") return null;

  const { data: tp } = await supabase
    .from("teen_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const t = (tp ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    email: (base.email as string) ?? "",
    name: base.name as string,
    role: "teen",
    city: (base.city as string) ?? undefined,
    age: (t.age as number) ?? undefined,
    xp: (t.xp as number) ?? 0,
    level: (t.level as number) ?? 1,
    interests: (t.interests as string[]) ?? undefined,
    preferredTaskFormat: (t.preferred_task_format as TeenPreferredTaskFormat) ?? undefined,
    completedTasksCount: (t.completed_tasks_count as number) ?? undefined,
    onboarded: (t.onboarded as boolean) ?? false,
    motivation: (t.motivation as string[]) ?? undefined,
    weekendAvailability: (t.weekend_availability as boolean) ?? undefined,
    earningGoal:
      t.earning_goal_title != null || t.earning_goal_amount != null
        ? {
            title: (t.earning_goal_title as string) ?? undefined,
            amount: (t.earning_goal_amount as number) ?? undefined,
          }
        : undefined,
  };
}

/** Публичный профиль работодателя для server components (E5). */
export async function getServerEmployerProfile(employerId: string): Promise<EmployerProfile | null> {
  const supabase = await createClient();

  const { data: base } = await supabase
    .from("profiles")
    .select("name, email, city, role")
    .eq("id", employerId)
    .maybeSingle();
  if (!base || base.role !== "employer") return null;

  const { data: emp } = await supabase
    .from("employer_profiles")
    .select("*")
    .eq("id", employerId)
    .maybeSingle();
  const e = (emp ?? {}) as Record<string, unknown>;

  return {
    id: employerId,
    email: (base.email as string) ?? "",
    name: base.name as string,
    role: "employer",
    city: (base.city as string) ?? undefined,
    companyName: (e.company_name as string) ?? (base.name as string),
    inn: (e.inn as string) ?? undefined,
    innIp: (e.inn_ip as string) ?? undefined,
    ogrn: (e.ogrn as string) ?? undefined,
    ogrnip: (e.ogrnip as string) ?? undefined,
    verified: (e.verified as boolean) ?? undefined,
    customerType: (e.customer_type as EmployerCustomerType) ?? undefined,
    taskCategories: (e.task_categories as TaskCategory[]) ?? undefined,
    cabinetDescription: (e.cabinet_description as string) ?? undefined,
    cabinetTags: (e.cabinet_tags as string[]) ?? undefined,
    rating: (e.rating as number) ?? undefined,
    reviewsCount: (e.reviews_count as number) ?? undefined,
  };
}

/** Id избранных задач подростка. */
export async function getTeenFavoriteTaskIds(teenId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("task_id").eq("teen_id", teenId);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { task_id: string }).task_id);
}
