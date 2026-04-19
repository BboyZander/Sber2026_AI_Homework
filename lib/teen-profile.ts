import type { TeenPreferredTaskFormat, TeenProfile } from "@/types/user";
import { getDemoUserById, getMockSession } from "@/lib/auth";
import { TEEN_INTEREST_LABELS } from "@/lib/teen-interest-labels";
import { emitProfileUpdated } from "@/lib/profile-sync";

/** Ключ localStorage для правок профиля подростка (сбрасывается вместе с демо). */
export const TEEN_PROFILE_STORAGE_KEY = "trajectory-teen-profile-overrides";

const STORAGE_KEY = TEEN_PROFILE_STORAGE_KEY;

export const TEEN_PREFERRED_FORMATS = ["online", "offline", "any"] as const;

export const TEEN_PREFERRED_FORMAT_LABELS: Record<TeenPreferredTaskFormat, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  any: "Любой формат",
};

export const TEEN_PROFILE_AGE_MIN = 14;
export const TEEN_PROFILE_AGE_MAX = 17;

export type TeenProfileEditablePatch = {
  name: string;
  age: number;
  city: string;
  interests: string[];
  preferredTaskFormat: TeenPreferredTaskFormat;
};

type StoredMap = Record<string, TeenProfileEditablePatch>;

function readAll(): StoredMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    return data as StoredMap;
  } catch {
    return {};
  }
}

function writeAll(map: StoredMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getTeenInterestCodes(): string[] {
  return Object.keys(TEEN_INTEREST_LABELS);
}

export function loadTeenProfilePatch(teenId: string): TeenProfileEditablePatch | null {
  const all = readAll();
  const p = all[teenId];
  if (!p || typeof p.name !== "string") return null;
  return p;
}

export function saveTeenProfilePatch(teenId: string, patch: TeenProfileEditablePatch): void {
  const all = readAll();
  all[teenId] = patch;
  writeAll(all);
  emitProfileUpdated({ role: "teen", userId: teenId });
}

/** Слить демо-профиль с сохранёнными правками из localStorage. */
export function getTeenProfileMerged(base: TeenProfile): TeenProfile {
  const p = loadTeenProfilePatch(base.id);
  if (!p) return base;
  return {
    ...base,
    name: p.name.trim() || base.name,
    age: p.age,
    city: p.city.trim() ? p.city.trim() : undefined,
    interests: [...p.interests],
    preferredTaskFormat: p.preferredTaskFormat,
  };
}

export function validateTeenProfilePatch(values: {
  name: string;
  ageStr: string;
  city: string;
  interests: string[];
  preferredTaskFormat: TeenPreferredTaskFormat;
}): { ok: true; patch: TeenProfileEditablePatch } | { ok: false; ageError?: string; nameError?: string } {
  const name = values.name.trim();
  if (!name) {
    return { ok: false, nameError: "Укажи имя." };
  }
  const age = Number.parseInt(values.ageStr.replace(/\s/g, ""), 10);
  if (!Number.isFinite(age) || age < TEEN_PROFILE_AGE_MIN || age > TEEN_PROFILE_AGE_MAX) {
    return {
      ok: false,
      ageError: `Возраст — от ${TEEN_PROFILE_AGE_MIN} до ${TEEN_PROFILE_AGE_MAX} лет.`,
    };
  }
  const allowed = new Set(getTeenInterestCodes());
  const interests = values.interests.filter((c) => allowed.has(c));
  const fmt = TEEN_PREFERRED_FORMATS.includes(values.preferredTaskFormat)
    ? values.preferredTaskFormat
    : ("any" as TeenPreferredTaskFormat);

  return {
    ok: true,
    patch: {
      name,
      age,
      city: values.city.trim(),
      interests,
      preferredTaskFormat: fmt,
    },
  };
}

export function profilePatchFromTeen(teen: TeenProfile): TeenProfileEditablePatch {
  return {
    name: teen.name,
    age: teen.age ?? TEEN_PROFILE_AGE_MIN,
    city: teen.city ?? "",
    interests: teen.interests?.length ? [...teen.interests] : [],
    preferredTaskFormat: teen.preferredTaskFormat ?? "any",
  };
}

/** Демо-профиль подростка из сессии + merge с localStorage (клиент). */
export function resolveSessionTeen(fallback: TeenProfile): TeenProfile {
  if (typeof window === "undefined") return fallback;
  const s = getMockSession();
  if (s?.role !== "teen") return fallback;
  const u = getDemoUserById(s.userId);
  if (!u || u.role !== "teen") return fallback;
  const { login: _l, password: _p, ...rest } = u;
  return getTeenProfileMerged(rest as TeenProfile);
}
