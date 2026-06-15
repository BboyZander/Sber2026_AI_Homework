import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
};

/**
 * Текущий пользователь из реальной сессии Supabase + строка profiles.
 * Возвращает null, если не залогинен или профиль ещё не создан.
 * Использовать в server components / route handlers.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const role: UserRole = profile.role === "employer" ? "employer" : "teen";
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role,
  };
}

/**
 * Гарантирует наличие строк профиля для текущего пользователя.
 * Идемпотентно: если профиль уже есть — ничего не создаёт.
 * Роль/имя берутся из user_metadata, заданных при signUp.
 * Возвращает роль пользователя или null, если сессии нет.
 */
export async function ensureProfileForCurrentUser(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) {
    return existing.role === "employer" ? "employer" : "teen";
  }

  const meta = (user.user_metadata ?? {}) as { name?: string; role?: string };
  const role: UserRole = meta.role === "employer" ? "employer" : "teen";
  const name =
    typeof meta.name === "string" && meta.name.trim()
      ? meta.name.trim()
      : (user.email ?? "Пользователь");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    name,
    role,
  });
  if (profileError) throw profileError;

  // Для работодателя поле «Имя» в форме — это наименование компании.
  const { error: extError } =
    role === "teen"
      ? await supabase.from("teen_profiles").insert({ id: user.id })
      : await supabase.from("employer_profiles").insert({ id: user.id, company_name: name });
  if (extError) throw extError;

  return role;
}
