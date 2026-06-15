import type { SupabaseClient } from "@supabase/supabase-js";

export function resetDemoContent(
  supabase: SupabaseClient,
): Promise<{ tasks: number; applications: number; favorites: number }>;
