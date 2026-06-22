import type { SupabaseClient } from "@supabase/supabase-js";

export function resetDemoContent(
  supabase: SupabaseClient,
  currentTeenId?: string,
): Promise<{ tasks: number; applications: number; favorites: number }>;
