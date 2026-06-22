import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { resetDemoContent } from "@/supabase/seed/demo-content";

/**
 * Сброс демо-контента к зафиксированному состоянию (задачи + отклики/избранное).
 * ⚠️ Демо-эндпоинт: стирает и пересоздаёт данные. Доступ — любой залогиненный
 *    пользователь. На проде такой эндпоинт включать нельзя.
 */
export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  try {
    const result = await resetDemoContent(service, user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "reset failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
