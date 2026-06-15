"use client";

import { useEffect, useState } from "react";
import { TeenTasksCatalog } from "@/components/teen/TeenTasksCatalog";
import { createClient } from "@/lib/supabase/client";
import { rowToTask, type TaskRow } from "@/lib/supabase/mappers";
import type { Task } from "@/types/task";

export function TeenTasksCatalogView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      // RLS отдаёт открытые задачи авторизованному подростку (cookie-сессия).
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error && data) setTasks((data as TaskRow[]).map(rowToTask));
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  return <TeenTasksCatalog tasks={tasks} loading={!ready} />;
}
