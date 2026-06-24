import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServerTeenProfile } from "@/lib/supabase/queries";
import { isAgentEnabled } from "@/lib/agent/guard";
import type { AgentStatusResponse } from "@/lib/agent/contract";

/** Видимость FAB ассистента: ключ задан + флаг включён + пользователь — подросток. */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json<AgentStatusResponse>({ enabled: false });
  }

  const teen = await getServerTeenProfile();
  if (!teen) {
    return NextResponse.json<AgentStatusResponse>({ enabled: false });
  }

  const enabled = await isAgentEnabled();
  return NextResponse.json<AgentStatusResponse>({ enabled });
}
