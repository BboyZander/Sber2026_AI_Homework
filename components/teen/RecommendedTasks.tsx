"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { rowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { getApplicationsCached, loadApplications } from "@/lib/teen-applications-client";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TeenCatalogTaskCard } from "@/components/teen/TeenCatalogTaskCard";
import type { Task } from "@/types/task";

export function RecommendedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      // Сначала отклики — чтобы исключить задачи, по которым уже откликались.
      await loadApplications();
      const appliedTaskIds = new Set(getApplicationsCached().map((a) => a.taskId));

      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(12);
      if (!active) return;
      if (!error && data) {
        const recommended = (data as TaskRow[])
          .map(rowToTask)
          .filter((t) => !appliedTaskIds.has(t.id))
          .slice(0, 3);
        setTasks(recommended);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (tasks.length === 0) return null;

  return (
    <section>
      <SectionTitle title="Рекомендуем тебе" />
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-3">
        {tasks.map((task) => (
          <li key={task.id} className="min-w-0">
            <TeenCatalogTaskCard task={task} />
          </li>
        ))}
      </ul>
    </section>
  );
}
