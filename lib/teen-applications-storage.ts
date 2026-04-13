import type { Application } from "@/types/application";
import type { ApplicationStatus } from "@/lib/constants";
import { applicationsByTeen, demoApplications } from "@/data/demo-applications";

const EXTRA_KEY = "trajectory-teen-applications-extra-v1";
const WITHDRAWN_KEY = "trajectory-teen-applications-withdrawn-v1";
const OVERRIDES_KEY = "trajectory-teen-applications-overrides-v1";

export const TEEN_APPLICATIONS_EXTRA_KEY = EXTRA_KEY;
export const TEEN_APPLICATIONS_WITHDRAWN_KEY = WITHDRAWN_KEY;
export const TEEN_APPLICATIONS_OVERRIDES_KEY = OVERRIDES_KEY;
export const TEEN_APPLICATIONS_EVENT = "trajectory-teen-applications";

const WITHDRAWABLE_STATUSES: ApplicationStatus[] = ["sent", "awaiting"];

function readExtra(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXTRA_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? (data as Application[]) : [];
  } catch {
    return [];
  }
}

function writeExtra(apps: Application[]) {
  window.localStorage.setItem(EXTRA_KEY, JSON.stringify(apps));
}

type OverridesMap = Record<string, ApplicationStatus>;

function readOverrides(): OverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data as OverridesMap;
  } catch {
    return {};
  }
}

function writeOverrides(map: OverridesMap) {
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
}

type WithdrawnMap = Record<string, string[]>;

function readWithdrawn(): WithdrawnMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WITHDRAWN_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data as WithdrawnMap;
  } catch {
    return {};
  }
}

function writeWithdrawn(map: WithdrawnMap) {
  window.localStorage.setItem(WITHDRAWN_KEY, JSON.stringify(map));
}

function addWithdrawn(teenId: string, taskId: string) {
  const map = readWithdrawn();
  const list = map[teenId] ?? [];
  if (!list.includes(taskId)) map[teenId] = [...list, taskId];
  writeWithdrawn(map);
}

export function notifyTeenApplicationsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TEEN_APPLICATIONS_EVENT));
}

function applyOverrides(apps: Application[]): Application[] {
  const overrides = readOverrides();
  return apps.map((a) => {
    const next = overrides[a.id];
    return next ? { ...a, status: next } : a;
  });
}

/** Демо + отклики из localStorage; extras по taskId перекрывают демо; withdrawn скрывает демо-отклик. */
export function getMergedApplicationsForTeen(teenId: string): Application[] {
  const demo = applicationsByTeen(teenId);
  if (typeof window === "undefined") {
    return [...demo].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const withdrawn = new Set(readWithdrawn()[teenId] ?? []);
  const allExtras = readExtra();
  const extrasForTeen = allExtras.filter((e) => e.teenId === teenId);
  const extraTaskIds = new Set(extrasForTeen.map((e) => e.taskId));

  const fromDemo = demo.filter(
    (a) => !withdrawn.has(a.taskId) && !extraTaskIds.has(a.taskId),
  );
  return [...fromDemo, ...extrasForTeen].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** Все отклики: демо + extras, с учётом withdrawals/overrides и дедупликации по teenId+taskId. */
export function getAllMergedApplications(): Application[] {
  if (typeof window === "undefined") {
    return [...demoApplications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const withdrawn = readWithdrawn();
  const extras = readExtra();

  const extraByTeenTask = new Set(extras.map((e) => `${e.teenId}::${e.taskId}`));
  const demo = demoApplications.filter((a) => {
    const w = new Set(withdrawn[a.teenId] ?? []);
    if (w.has(a.taskId)) return false;
    if (extraByTeenTask.has(`${a.teenId}::${a.taskId}`)) return false;
    return true;
  });

  return applyOverrides([...demo, ...extras]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getApplicationsForTask(taskId: string): Application[] {
  return getAllMergedApplications().filter((a) => a.taskId === taskId);
}

export function canWithdrawApplication(app: Application): boolean {
  return WITHDRAWABLE_STATUSES.includes(app.status);
}

/** Убрать отклик: запись из extras или скрытие демо по taskId. */
export function withdrawTeenApplication(teenId: string, app: Application) {
  if (typeof window === "undefined") return;
  if (!canWithdrawApplication(app)) return;

  const extras = readExtra();
  const extraIdx = extras.findIndex((e) => e.id === app.id && e.teenId === teenId);
  if (extraIdx !== -1) {
    writeExtra(extras.filter((_, i) => i !== extraIdx));
  } else {
    addWithdrawn(teenId, app.taskId);
  }
  notifyTeenApplicationsChanged();
}

/** Добавить отклик после «Откликнуться» (только клиент). @returns true если запись добавлена */
export function appendTeenApplication(teenId: string, taskId: string): boolean {
  if (typeof window === "undefined") return false;
  if (getMergedApplicationsForTeen(teenId).some((a) => a.taskId === taskId)) return false;
  const extras = readExtra();
  if (extras.some((a) => a.teenId === teenId && a.taskId === taskId)) return false;
  const next: Application = {
    id: `ext-${Date.now()}`,
    teenId,
    taskId,
    status: "sent",
    createdAt: new Date().toISOString(),
  };
  writeExtra([...extras, next]);
  notifyTeenApplicationsChanged();
  return true;
}

export function setApplicationStatus(appId: string, status: ApplicationStatus): boolean {
  if (typeof window === "undefined") return false;
  const extras = readExtra();
  const idx = extras.findIndex((a) => a.id === appId);
  if (idx !== -1) {
    const next = [...extras];
    next[idx] = { ...next[idx], status };
    writeExtra(next);
    notifyTeenApplicationsChanged();
    return true;
  }

  if (!demoApplications.some((a) => a.id === appId)) return false;
  const map = readOverrides();
  map[appId] = status;
  writeOverrides(map);
  notifyTeenApplicationsChanged();
  return true;
}
