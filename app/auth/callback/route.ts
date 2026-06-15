import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForCurrentUser } from "@/lib/supabase/auth";
import { roleHomePath } from "@/lib/auth";

/**
 * Завершение входа/регистрации:
 * - confirm e-mail ON: пользователь приходит сюда по ссылке из письма с ?code=...
 * - confirm e-mail OFF: сюда редиректит форма регистрации, сессия уже в cookie.
 * В обоих случаях гарантируем профиль и уводим в кабинет по роли.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const supabase = await createClient();
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const role = await ensureProfileForCurrentUser();
  if (!role) {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}${roleHomePath(role)}`);
}
