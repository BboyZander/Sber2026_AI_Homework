"use client";

import type { Task } from "@/types/task";
import { demoTasks, tasksByEmployer } from "@/data/demo-tasks";
import { withNormalizedTaskPayment } from "@/lib/task-payment";
import { normalizeTaskStatus, type TaskStatus } from "@/lib/constants";

const EXTRA_KEY = "trajectory-employer-tasks-extra-v1";
const OVERRIDES_KEY = "trajectory-employer-tasks-overrides-v1";
const PATCH_OVERRIDES_KEY = "trajectory-employer-tasks-patch-overrides-v1";

export const EMPLOYER_TASKS_EXTRA_KEY = EXTRA_KEY;
export const EMPLOYER_TASKS_OVERRIDES_KEY = OVERRIDES_KEY;
export const EMPLOYER_TASKS_PATCH_OVERRIDES_KEY = PATCH_OVERRIDES_KEY;
export const EMPLOYER_TASKS_EVENT = "trajectory-employer-tasks";

function normalizeTaskCompliance(task: Task): Task {
  return {
    ...task,
    engagementType: task.engagementType ?? "employment",
    startDateTime: task.startDateTime ?? task.deadline ?? task.createdAt,
    durationHours: Number.isFinite(task.durationHours) ? task.durationHours : 2,
    weeklyHoursExpected: Number.isFinite(task.weeklyHoursExpected) ? task.weeklyHoursExpected : 8,
    duringSchoolPeriodAllowed:
      typeof task.duringSchoolPeriodAllowed === "boolean" ? task.duringSchoolPeriodAllowed : true,
    duringVacationAllowed:
      typeof task.duringVacationAllowed === "boolean" ? task.duringVacationAllowed : true,
    requiresMedicalExam: Boolean(task.requiresMedicalExam),
    physicalLoadLevel: task.physicalLoadLevel === "none" ? "none" : "light",
    isOutdoor: Boolean(task.isOutdoor),
    minorComplianceStatus: task.minorComplianceStatus ?? "passed",
    minorComplianceReasons: Array.isArray(task.minorComplianceReasons) ? task.minorComplianceReasons : [],
  };
}

function readExtra(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXTRA_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((row) => {
      const t = row as Task;
      return normalizeTaskCompliance({ ...t, status: normalizeTaskStatus(t.status) });
    });
  } catch {
    return [];
  }
}

function writeExtra(tasks: Task[]) {
  window.localStorage.setItem(EXTRA_KEY, JSON.stringify(tasks));
}

type TaskOverridesMap = Record<string, TaskStatus>;
type TaskPatchOverride = Partial<
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
type TaskPatchOverridesMap = Record<string, TaskPatchOverride>;

function readOverrides(): TaskOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const map = data as Record<string, unknown>;
    const out: TaskOverridesMap = {};
    for (const [taskId, status] of Object.entries(map)) {
      out[taskId] = normalizeTaskStatus(status);
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(map: TaskOverridesMap) {
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
}

function readPatchOverrides(): TaskPatchOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PATCH_OVERRIDES_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    const map = data as Record<string, TaskPatchOverride>;
    const out: TaskPatchOverridesMap = {};
    for (const [taskId, patch] of Object.entries(map)) {
      const p = patch ?? {};
      out[taskId] = {
        ...p,
        status: p.status ? normalizeTaskStatus(p.status) : undefined,
      };
    }
    return out;
  } catch {
    return {};
  }
}

function writePatchOverrides(map: TaskPatchOverridesMap) {
  window.localStorage.setItem(PATCH_OVERRIDES_KEY, JSON.stringify(map));
}

function applyTaskOverrides(tasks: Task[]): Task[] {
  const overrides = readOverrides();
  const patchOverrides = readPatchOverrides();
  return tasks.map((t) => {
    const patch = patchOverrides[t.id];
    const patched = patch ? { ...t, ...patch } : t;
    const next = overrides[t.id];
    return next ? { ...patched, status: next } : patched;
  });
}

export function notifyEmployerTasksChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EMPLOYER_TASKS_EVENT));
}

export function getEmployerTasks(employerId: string): Task[] {
  const demo = tasksByEmployer(employerId);
  if (typeof window === "undefined") {
    return [...demo]
      .map(withNormalizedTaskPayment)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const extras = readExtra().filter((t) => t.employerId === employerId);
  const merged = applyTaskOverrides([...demo, ...extras]);
  return merged
    .map((t) => normalizeTaskCompliance({ ...t, status: normalizeTaskStatus(t.status) }))
    .map(withNormalizedTaskPayment)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function getAllTasksWithOverrides(): Task[] {
  const base = typeof window === "undefined" ? [...demoTasks] : [...demoTasks, ...readExtra()];
  return applyTaskOverrides(base)
    .map((t) => normalizeTaskCompliance({ ...t, status: normalizeTaskStatus(t.status) }))
    .map(withNormalizedTaskPayment)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function appendEmployerTask(task: Task) {
  if (typeof window === "undefined") return;
  const extras = readExtra();
  if (extras.some((t) => t.id === task.id)) return;
  writeExtra([{ ...withNormalizedTaskPayment(task), status: normalizeTaskStatus(task.status) }, ...extras]);
  notifyEmployerTasksChanged();
}

export function isExtraEmployerTask(taskId: string): boolean {
  if (typeof window === "undefined") return false;
  return readExtra().some((t) => t.id === taskId);
}

export function updateEmployerTask(taskId: string, patch: Partial<Task>): Task | null {
  if (typeof window === "undefined") return null;
  const extras = readExtra();
  let updated: Task | null = null;
  const next = extras.map((t) => {
    if (t.id !== taskId) return t;
    updated = withNormalizedTaskPayment({
      ...t,
      ...patch,
      status: normalizeTaskStatus((patch.status ?? t.status) as TaskStatus),
      id: t.id,
      employerId: t.employerId,
      createdAt: t.createdAt,
    });
    return updated;
  });
  if (!updated) return null;
  writeExtra(next);
  notifyEmployerTasksChanged();
  return updated;
}

function updateDemoTaskPatch(taskId: string, patch: Partial<Task>): Task | null {
  if (typeof window === "undefined") return null;
  const base = demoTasks.find((t) => t.id === taskId);
  if (!base) return null;
  const patches = readPatchOverrides();
  const current = patches[taskId] ?? {};
  const merged: TaskPatchOverride = {
    ...current,
    ...patch,
    status: patch.status ? normalizeTaskStatus(patch.status) : current.status,
  };
  patches[taskId] = merged;
  writePatchOverrides(patches);
  notifyEmployerTasksChanged();
  const all = getAllTasksMerged();
  return all.find((t) => t.id === taskId) ?? null;
}

export function editEmployerTask(taskId: string, patch: Partial<Task>): Task | null {
  const updatedExtra = updateEmployerTask(taskId, patch);
  if (updatedExtra) return updatedExtra;
  return updateDemoTaskPatch(taskId, patch);
}

export function setTaskStatus(taskId: string, status: TaskStatus): Task | null {
  if (typeof window === "undefined") return null;
  const updatedExtra = updateEmployerTask(taskId, { status });
  if (updatedExtra) return updatedExtra;
  if (!demoTasks.some((t) => t.id === taskId)) return null;
  const map = readOverrides();
  map[taskId] = normalizeTaskStatus(status);
  writeOverrides(map);
  notifyEmployerTasksChanged();
  const all = getAllTasksMerged();
  return all.find((t) => t.id === taskId) ?? null;
}

export function deleteEmployerTask(taskId: string): boolean {
  if (typeof window === "undefined") return false;
  const extras = readExtra();
  if (!extras.some((t) => t.id === taskId)) return false;
  writeExtra(extras.filter((t) => t.id !== taskId));
  notifyEmployerTasksChanged();
  return true;
}

export function getAllTasksMerged(): Task[] {
  return getAllTasksWithOverrides();
}

export function getMergedTaskById(taskId: string): Task | null {
  const all = getAllTasksMerged();
  return all.find((t) => t.id === taskId) ?? null;
}
