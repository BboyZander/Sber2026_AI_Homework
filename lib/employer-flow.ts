"use client";

import { getDemoEmployer } from "@/data/demo-users";
import { getDemoUserById, getMockSession } from "@/lib/auth";
import {
  EMPLOYER_TASKS_EVENT,
  appendEmployerTask,
  deleteEmployerTask,
  getAllTasksMerged,
  getMergedTaskById,
  getEmployerTasks as getStoredEmployerTasks,
  isExtraEmployerTask,
  notifyEmployerTasksChanged,
  updateEmployerTask,
} from "@/lib/employer-tasks-storage";
import type { EmployerProfile } from "@/types/user";
import type { Task, TaskPaymentType } from "@/types/task";
import { getEmployerProfileMerged } from "@/lib/employer-profile";
import { EMPLOYER_TOASTS } from "@/lib/ui-copy";
import { withNormalizedTaskPayment } from "@/lib/task-payment";

export const EMPLOYER_FLOW_TOAST_EVENT = "trajectory-employer-flow-toast";

export type EmployerFlowToastDetail = { message: string };

export { EMPLOYER_TASKS_EVENT, EMPLOYER_TASKS_EXTRA_KEY } from "@/lib/employer-tasks-storage";

export type EmployerTaskPayload = {
  title: string;
  description: string;
  category: Task["category"];
  workFormat: Task["workFormat"];
  durationBucket: Task["durationBucket"];
  durationLabel: string;
  paymentType: TaskPaymentType;
  paymentAmount: number;
  estimatedHours?: number;
  location?: string;
  deadline?: string;
  minAge?: number;
  maxAge?: number;
};

export type EmployerTaskPatch = Partial<
  Pick<
    Task,
    | "title"
    | "description"
    | "category"
    | "workFormat"
    | "durationBucket"
    | "durationLabel"
    | "paymentType"
    | "paymentAmount"
    | "estimatedHours"
    | "payRub"
    | "location"
    | "deadline"
    | "minAge"
    | "maxAge"
    | "status"
  >
>;

export type EmployerTaskViewStatus = "published" | "active" | "completed";

export function getCurrentEmployerId(): string {
  if (typeof window === "undefined") return getDemoEmployer().id;
  const s = getMockSession();
  if (s?.role === "employer") return s.userId;
  return getDemoEmployer().id;
}

export function getEmployerTasks(employerId?: string): Task[] {
  return getStoredEmployerTasks(employerId ?? getCurrentEmployerId());
}

export function getEmployerTaskViewStatus(task: Task): EmployerTaskViewStatus {
  if (task.status === "closed") return "completed";
  const ageMs = Date.now() - new Date(task.createdAt).getTime();
  return ageMs < 1000 * 60 * 60 * 24 ? "published" : "active";
}

export function getEmployerTaskStats(employerId?: string) {
  const tasks = getEmployerTasks(employerId);
  const summary = {
    total: tasks.length,
    published: 0,
    active: 0,
    completed: 0,
  };
  for (const t of tasks) {
    const view = getEmployerTaskViewStatus(t);
    summary[view] += 1;
  }
  return summary;
}

export function getPublishedTasksForTeen(): Task[] {
  return getAllTasksMerged().filter((t) => t.status === "published");
}

export function getTaskByIdForFlow(taskId: string): Task | null {
  return getMergedTaskById(taskId);
}

function emitEmployerToast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<EmployerFlowToastDetail>(EMPLOYER_FLOW_TOAST_EVENT, {
      detail: { message },
    }),
  );
}

/** Тост из UI (смена статуса отклика и т.п.). */
export function pushEmployerToast(message: string): void {
  emitEmployerToast(message);
}

export function publishTask(payload: EmployerTaskPayload): Task {
  const employerId = getCurrentEmployerId();
  const employer = getDemoUserById(employerId);
  let employerName = getDemoEmployer().companyName;
  if (employer && employer.role === "employer") {
    const { login: _l, password: _p, ...rest } = employer;
    employerName = getEmployerProfileMerged(rest as EmployerProfile).companyName;
  }

  const raw: Task = {
    id: `local-task-${Date.now()}`,
    employerId,
    employerName,
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category,
    status: "published",
    rewardXp: 80,
    paymentType: payload.paymentType,
    paymentAmount: payload.paymentAmount,
    estimatedHours: payload.paymentType === "hourly" ? payload.estimatedHours : undefined,
    payRub: 0,
    workFormat: payload.workFormat,
    durationBucket: payload.durationBucket,
    durationLabel: payload.durationLabel.trim(),
    location: payload.location?.trim() || undefined,
    minAge: payload.minAge,
    maxAge: payload.maxAge,
    deadline: payload.deadline,
    createdAt: new Date().toISOString(),
  };
  const task = withNormalizedTaskPayment(raw);

  appendEmployerTask(task);
  emitEmployerToast(EMPLOYER_TOASTS.publish);
  return task;
}

export function editTask(taskId: string, patch: EmployerTaskPatch): Task | null {
  const updated = updateEmployerTask(taskId, patch);
  if (updated) emitEmployerToast(EMPLOYER_TOASTS.edit);
  return updated;
}

export function removeTask(taskId: string): boolean {
  const ok = deleteEmployerTask(taskId);
  if (ok) emitEmployerToast(EMPLOYER_TOASTS.remove);
  return ok;
}

export function toggleTaskClosed(taskId: string): Task | null {
  const current = getTaskByIdForFlow(taskId);
  if (!current || !isExtraEmployerTask(taskId)) return null;
  const nextStatus: Task["status"] = current.status === "closed" ? "published" : "closed";
  const updated = updateEmployerTask(taskId, { status: nextStatus });
  if (updated) {
    emitEmployerToast(nextStatus === "closed" ? EMPLOYER_TOASTS.closed : EMPLOYER_TOASTS.reopened);
  }
  return updated;
}

export function canMutateTask(taskId: string): boolean {
  return isExtraEmployerTask(taskId);
}

export function refreshEmployerFlowViews() {
  notifyEmployerTasksChanged();
}
