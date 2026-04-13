import type { UserRole } from "@/lib/constants";
import { demoUsers } from "@/data/demo-users";

const SESSION_KEY = "demo-mock-session";
const LEGACY_USER_ID_KEY = "demo-auth-user-id";

export type MockSession = {
  userId: string;
  role: UserRole;
};

function readSessionJson(): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "userId" in data &&
      "role" in data &&
      typeof (data as MockSession).userId === "string" &&
      ((data as MockSession).role === "teen" || (data as MockSession).role === "employer")
    ) {
      return data as MockSession;
    }
    return null;
  } catch {
    return null;
  }
}

/** Прочитать мок-сессию (только в браузере). */
export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  const current = readSessionJson();
  if (current) return current;

  const legacyId = window.localStorage.getItem(LEGACY_USER_ID_KEY);
  if (!legacyId) return null;
  const user = getDemoUserById(legacyId);
  if (!user) {
    window.localStorage.removeItem(LEGACY_USER_ID_KEY);
    return null;
  }
  const migrated: MockSession = { userId: user.id, role: user.role };
  setMockSession(migrated);
  window.localStorage.removeItem(LEGACY_USER_ID_KEY);
  return migrated;
}

/** Сохранить сессию после успешного демо-логина. */
export function setMockSession(session: MockSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.removeItem(LEGACY_USER_ID_KEY);
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LEGACY_USER_ID_KEY);
}

/** @deprecated Используйте getMockSession(). */
export function getStoredUserId(): string | null {
  return getMockSession()?.userId ?? null;
}

/** @deprecated Используйте setMockSession. */
export function setStoredUserId(userId: string): void {
  const user = getDemoUserById(userId);
  if (user) setMockSession({ userId: user.id, role: user.role });
}

/** @deprecated Используйте clearMockSession. */
export function clearStoredUser(): void {
  clearMockSession();
}

export function getStoredRole(): UserRole | null {
  return getMockSession()?.role ?? null;
}

/**
 * Заготовка под защиту маршрутов: если пользователь не вошёл или зашёл не в тот раздел —
 * куда отправить. Вызывать из client layout / guard (пока необязательно).
 */
export function redirectPathForSectionGuard(
  section: "teen" | "employer",
): string | null {
  const session = getMockSession();
  if (!session) return "/login";
  const need: UserRole = section === "teen" ? "teen" : "employer";
  if (session.role !== need) return roleHomePath(session.role);
  return null;
}

/** Допустимы только записи из `demoUsers` (никакой «регистрации»). */
export function getDemoUserByCredentials(
  login: string,
  password: string,
): (typeof demoUsers)[number] | null {
  const normalized = login.trim().toLowerCase();
  const user = demoUsers.find(
    (u) => u.login.toLowerCase() === normalized && u.password === password,
  );
  return user ?? null;
}

/** Редирект после успешного демо-входа по логину. */
export function redirectPathAfterDemoLogin(user: (typeof demoUsers)[number]): string {
  const l = user.login.toLowerCase();
  if (l === "demo_teen") return "/teen/dashboard";
  if (l === "demo_employer") return "/employer/dashboard";
  return roleHomePath(user.role);
}

export function getDemoUserById(id: string): (typeof demoUsers)[number] | null {
  return demoUsers.find((u) => u.id === id) ?? null;
}

export function roleHomePath(role: UserRole): string {
  return role === "teen" ? "/teen/dashboard" : "/employer/dashboard";
}
