// Гейт доступа к ИИ-ассистенту: личный ключ — нужна защита от чужого расхода.
// Три уровня: (1) ключ задан, (2) рантайм-флаг включён в БД, (3) дневной лимит не превышен.
import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const DEFAULT_DAILY_LIMIT = 30;

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export function isAgentKeyConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Рантайм-флаг из app_settings (флипается через Supabase dashboard, без редеплоя). */
export async function isAgentFlagEnabled(): Promise<boolean> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("app_settings")
    .select("bool_value")
    .eq("key", "ai_agent_enabled")
    .maybeSingle();
  return Boolean((data as { bool_value: boolean } | null)?.bool_value);
}

export async function isAgentEnabled(): Promise<boolean> {
  return isAgentKeyConfigured() && (await isAgentFlagEnabled());
}

function dailyLimit(): number {
  const raw = Number(process.env.AI_AGENT_DAILY_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DAILY_LIMIT;
}

/**
 * Инкремент дневного счётчика сообщений подростка. Возвращает { allowed, count, limit }.
 * Использует service-role, чтобы избежать гонки RLS-чтение/запись из браузерного клиента.
 */
export async function checkAndIncrementAgentUsage(
  teenId: string,
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const limit = dailyLimit();
  const service = getServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await service
    .from("agent_usage")
    .select("count")
    .eq("teen_id", teenId)
    .eq("day", today)
    .maybeSingle();

  const nextCount = ((existing as { count: number } | null)?.count ?? 0) + 1;

  if (nextCount > limit) {
    return { allowed: false, count: nextCount - 1, limit };
  }

  await service
    .from("agent_usage")
    .upsert({ teen_id: teenId, day: today, count: nextCount }, { onConflict: "teen_id,day" });

  return { allowed: true, count: nextCount, limit };
}
