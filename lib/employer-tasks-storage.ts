"use client";

import type { Task } from "@/types/task";
import { demoTasks, tasksByEmployer } from "@/data/demo-tasks";

const EXTRA_KEY = "trajectory-employer-tasks-extra-v1";

export const EMPLOYER_TASKS_EXTRA_KEY = EXTRA_KEY;
export const EMPLOYER_TASKS_EVENT = "trajectory-employer-tasks";

function readExtra(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXTRA_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Task[]) : [];
  } catch {
    return [];
  }
}

function writeExtra(tasks: Task[]) {
  window.localStorage.setItem(EXTRA_KEY, JSON.stringify(tasks));
}

export function notifyEmployerTasksChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EMPLOYER_TASKS_EVENT));
}

export function getEmployerTasks(employerId: string): Task[] {
  const demo = tasksByEmployer(employerId);
  if (typeof window === "undefined") {
    return [...demo].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const extras = readExtra().filter((t) => t.employerId === employerId);
  const merged = [...demo, ...extras];
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function appendEmployerTask(task: Task) {
  if (typeof window === "undefined") return;
  const extras = readExtra();
  if (extras.some((t) => t.id === task.id)) return;
  writeExtra([task, ...extras]);
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
    updated = { ...t, ...patch, id: t.id, employerId: t.employerId, createdAt: t.createdAt };
    return updated;
  });
  if (!updated) return null;
  writeExtra(next);
  notifyEmployerTasksChanged();
  return updated;
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
  if (typeof window === "undefined") return [...demoTasks];
  const extras = readExtra();
  return [...demoTasks, ...extras].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMergedTaskById(taskId: string): Task | null {
  const all = getAllTasksMerged();
  return all.find((t) => t.id === taskId) ?? null;
}
