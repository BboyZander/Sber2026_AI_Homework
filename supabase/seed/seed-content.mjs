// CLI-сидер демо-контента (задачи + отклики/избранное) к зафиксированному состоянию.
// Запуск: node --env-file=.env.local supabase/seed/seed-content.mjs
// Требует seed-users.mjs (учётки/профили). Идемпотентно.

import { createClient } from "@supabase/supabase-js";
import { resetDemoContent } from "./demo-content.mjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Нет env (запускай с --env-file=.env.local)");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

resetDemoContent(supabase)
  .then((r) => console.log("Демо-контент сброшен:", r))
  .catch((err) => {
    console.error("Ошибка:", err.message ?? err);
    process.exit(1);
  });
