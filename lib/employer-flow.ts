"use client";

import { getDemoEmployer } from "@/data/demo-users";
import { getDemoUserById, getMockSession } from "@/lib/auth";
import {
  EMPLOYER_TASKS_EVENT,
  appendEmployerTask,
  deleteEmployerTask,
  editEmployerTask,
  getAllTasksMerged,
  getMergedTaskById,
  getEmployerTasks as getStoredEmployerTasks,
  notifyEmployerTasksChanged,
  setTaskStatus,
} from "@/lib/employer-tasks-storage";
import type { EmployerProfile } from "@/types/user";
import type { Task, TaskPaymentType } from "@/types/task";
import { getEmployerProfileMerged } from "@/lib/employer-profile";
import { EMPLOYER_TOASTS } from "@/lib/ui-copy";
import { withNormalizedTaskPayment } from "@/lib/task-payment";
import { getAllMergedApplications } from "@/lib/teen-applications-storage";
import type { EngagementType, MinorComplianceStatus, PhysicalLoadLevel } from "@/lib/constants";

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
  engagementType: EngagementType;
  startDateTime: string;
  durationHours: number;
  weeklyHoursExpected: number;
  duringSchoolPeriodAllowed: boolean;
  duringVacationAllowed: boolean;
  requiresMedicalExam: boolean;
  physicalLoadLevel: PhysicalLoadLevel;
  isOutdoor: boolean;
  minorComplianceStatus: MinorComplianceStatus;
  minorComplianceReasons: string[];
  status?: Task["status"];
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
    | "engagementType"
    | "startDateTime"
    | "durationHours"
    | "weeklyHoursExpected"
    | "duringSchoolPeriodAllowed"
    | "duringVacationAllowed"
    | "requiresMedicalExam"
    | "physicalLoadLevel"
    | "isOutdoor"
    | "minorComplianceStatus"
    | "minorComplianceReasons"
    | "status"
  >
>;

export type EmployerTaskViewStatus =
  | "draft"
  | "open"
  | "with_application"
  | "in_progress"
  | "completed";

export function getCurrentEmployerId(): string {
  if (typeof window === "undefined") return getDemoEmployer().id;
  const s = getMockSession();
  if (s?.role === "employer") return s.userId;
  return getDemoEmployer().id;
}

export function getEmployerTasks(employerId?: string): Task[] {
  return getStoredEmployerTasks(employerId ?? getCurrentEmployerId());
}

function taskIdsWithAppliedResponses(): Set<string> {
  const out = new Set<string>();
  for (const app of getAllMergedApplications()) {
    if (app.status === "applied") out.add(app.taskId);
  }
  return out;
}

export function getEmployerTaskViewStatus(
  task: Task,
  hasAppliedResponse: boolean = false,
): EmployerTaskViewStatus {
  if (task.status === "open" && hasAppliedResponse) return "with_application";
  return task.status;
}

export function getEmployerTaskStats(employerId?: string) {
  const tasks = getEmployerTasks(employerId);
  const summary = {
    total: tasks.length,
    draft: 0,
    open: 0,
    with_application: 0,
    in_progress: 0,
    completed: 0,
  };
  const withResponses = taskIdsWithAppliedResponses();
  for (const t of tasks) {
    const view = getEmployerTaskViewStatus(t, withResponses.has(t.id));
    summary[view] += 1;
  }
  return summary;
}

export function getPublishedTasksForTeen(): Task[] {
  return getAllTasksMerged().filter((t) => t.status === "open");
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
    status: payload.status ?? "open",
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
    engagementType: payload.engagementType,
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
    createdAt: new Date().toISOString(),
  };
  const task = withNormalizedTaskPayment(raw);

  appendEmployerTask(task);
  emitEmployerToast(task.status === "draft" ? EMPLOYER_TOASTS.draftSaved : EMPLOYER_TOASTS.publish);
  return task;
}

export function editTask(taskId: string, patch: EmployerTaskPatch): Task | null {
  const updated = editEmployerTask(taskId, patch);
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
  if (!current) return null;
  const nextStatus: Task["status"] = current.status === "completed" ? "open" : "completed";
  const updated = setTaskStatus(taskId, nextStatus);
  if (updated) {
    emitEmployerToast(nextStatus === "completed" ? EMPLOYER_TOASTS.closed : EMPLOYER_TOASTS.reopened);
  }
  return updated;
}

export function canMutateTask(taskId: string): boolean {
  const task = getTaskByIdForFlow(taskId);
  if (!task) return false;
  return task.employerId === getCurrentEmployerId();
}

export function setTaskStatusForFlow(taskId: string, status: Task["status"]): Task | null {
  return setTaskStatus(taskId, status);
}

export function refreshEmployerFlowViews() {
  notifyEmployerTasksChanged();
}
