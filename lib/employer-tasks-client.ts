// Задачи работодателя на Supabase (клиентский слой, чтение): кэш + событие.
// Мутации (создание/редактирование/статусы) добавим на следующих слайсах.
import { createClient } from "@/lib/supabase/client";
import {
  rowToApplication,
  rowToTask,
  taskToRow,
  type ApplicationRow,
  type TaskRow,
} from "@/lib/supabase/mappers";
import { EMPLOYER_TASKS_EVENT } from "@/lib/employer-tasks-storage";
import type { EmployerTaskPayload } from "@/lib/employer-flow";
import { withNormalizedTaskPayment } from "@/lib/task-payment";
import type { TaskStatus } from "@/lib/constants";
import type { Application } from "@/types/application";
import type { Task } from "@/types/task";

export { EMPLOYER_TASKS_EVENT };

/** Собрать Task из payload формы + базовых полей (id/employer/createdAt/rewardXp). */
function payloadToTask(
  payload: EmployerTaskPayload,
  base: {
    id: string;
    employerId: string;
    employerName: string;
    rewardXp: number;
    createdAt: string;
  },
): Task {
  return {
    ...base,
    payRub: 0, // нормализуется ниже
    title: payload.title.trim(),
    description: payload.description.trim(),
    whatToDo: payload.whatToDo.trim(),
    completionCriteria: payload.completionCriteria.trim(),
    contactPerson: payload.contactPerson.trim(),
    category: payload.category,
    status: payload.status ?? "open",
    paymentType: payload.paymentType,
    paymentAmount: payload.paymentAmount,
    estimatedHours: payload.paymentType === "hourly" ? payload.estimatedHours : undefined,
    workFormat: payload.workFormat,
    durationBucket: payload.durationBucket,
    durationLabel: payload.durationLabel.trim(),
    location: payload.location?.trim() || undefined,
    minAge: payload.minAge,
    maxAge: payload.maxAge,
    engagementType: payload.engagementType,
    hasFixedSchedule: payload.hasFixedSchedule,
    startDateTime: payload.startDateTime,
    durationHours: payload.durationHours,
    weeklyHoursExpected: payload.weeklyHoursExpected,
    duringSchoolPeriodAllowed: payload.duringSchoolPeriodAllowed,
    duringVacationAllowed: payload.duringVacationAllowed,
    requiresMedicalExam: payload.requiresMedicalExam,
    physicalLoadLevel: payload.physicalLoadLevel,
    isOutdoor: payload.isOutdoor,
    minorComplianceStatus: payload.minorComplianceStatus,
    minorComplianceReasons: [...payload.minorComplianceReasons],
    deadline: payload.deadline,
  };
}

/** Создать задачу (employer_id/employer_name — из сессии). */
export async function publishTaskDb(payload: EmployerTaskPayload): Promise<Task | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const draft = payloadToTask(payload, {
    id: "",
    employerId: user.id,
    employerName: (prof?.name as string) ?? "Компания",
    rewardXp: 80,
    createdAt: new Date().toISOString(),
  });
  const normalized = withNormalizedTaskPayment(draft);

  const { data, error } = await supabase.from("tasks").insert(taskToRow(normalized)).select("*").single();
  if (error || !data) return null;
  await loadEmployerTasks();
  return rowToTask(data as TaskRow);
}

/** Отредактировать задачу (по той же форме). */
export async function editTaskDb(
  taskId: string,
  payload: EmployerTaskPayload,
): Promise<Task | null> {
  const existing = await getEmployerTaskById(taskId);
  if (!existing) return null;

  const merged = payloadToTask(payload, {
    id: existing.id,
    employerId: existing.employerId,
    employerName: existing.employerName,
    rewardXp: existing.rewardXp,
    createdAt: existing.createdAt,
  });
  const normalized = withNormalizedTaskPayment(merged);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(taskToRow(normalized))
    .eq("id", taskId)
    .select("*")
    .single();
  if (error || !data) return null;
  await loadEmployerTasks();
  return rowToTask(data as TaskRow);
}

let tasksCache: Task[] = [];
let appliedTaskIds = new Set<string>();
let employerId: string | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EMPLOYER_TASKS_EVENT));
  }
}

async function ensureEmployerId(): Promise<string | null> {
  if (employerId) return employerId;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  employerId = user?.id ?? null;
  return employerId;
}

/** Загрузить задачи работодателя (все статусы) + отклики к ним в кэш. */
export async function loadEmployerTasks(): Promise<void> {
  const supabase = createClient();
  const id = await ensureEmployerId();
  if (!id) {
    tasksCache = [];
    appliedTaskIds = new Set();
    emit();
    return;
  }

  const { data: tRows } = await supabase
    .from("tasks")
    .select("*")
    .eq("employer_id", id)
    .order("created_at", { ascending: false });
  tasksCache = ((tRows ?? []) as TaskRow[]).map(rowToTask);

  // RLS вернёт только отклики к задачам этого работодателя.
  const { data: aRows } = await supabase.from("applications").select("task_id, status");
  appliedTaskIds = new Set(
    ((aRows ?? []) as { task_id: string; status: string }[])
      .filter((r) => r.status === "applied")
      .map((r) => r.task_id),
  );
  emit();
}

export function getEmployerTasksCached(): Task[] {
  return tasksCache;
}

export function taskHasAppliedCached(taskId: string): boolean {
  return appliedTaskIds.has(taskId);
}

export async function getSessionEmployerId(): Promise<string | null> {
  return ensureEmployerId();
}

/** Одна задача по id (для деталки работодателя). */
export async function getEmployerTaskById(taskId: string): Promise<Task | null> {
  const supabase = createClient();
  const { data } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
  return data ? rowToTask(data as TaskRow) : null;
}

/** Отклики к задаче + имена откликнувшихся подростков. */
export async function loadTaskApplicants(
  taskId: string,
): Promise<{ apps: Application[]; names: Record<string, string> }> {
  const supabase = createClient();
  const { data: aRows } = await supabase
    .from("applications")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  const apps = ((aRows ?? []) as ApplicationRow[]).map(rowToApplication);

  const teenIds = [...new Set(apps.map((a) => a.teenId))];
  const names: Record<string, string> = {};
  if (teenIds.length > 0) {
    const { data: pRows } = await supabase.from("profiles").select("id, name").in("id", teenIds);
    for (const p of (pRows ?? []) as { id: string; name: string }[]) names[p.id] = p.name;
  }
  return { apps, names };
}

export async function updateApplicationStatusDb(
  appId: string,
  status: Application["status"],
): Promise<boolean> {
  const supabase = createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  const { error } = await supabase.from("applications").update(patch).eq("id", appId);
  return !error;
}

export async function setTaskStatusDb(taskId: string, status: TaskStatus): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  return !error;
}

export async function deleteTaskDb(taskId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  return !error;
}

export function getEmployerTaskStatsCached() {
  const summary = {
    total: tasksCache.length,
    draft: 0,
    open: 0,
    with_application: 0,
    in_progress: 0,
    completed: 0,
  };
  for (const t of tasksCache) {
    const view =
      t.status === "open" && appliedTaskIds.has(t.id) ? "with_application" : t.status;
    summary[view] += 1;
  }
  return summary;
}
