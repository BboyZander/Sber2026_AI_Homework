"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { WORK_FORMAT_LABELS } from "@/lib/constants";
import { formatRub } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/client";
import { rowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { TEEN_FAVORITES_EVENT, getFavoriteIdsCached, loadFavorites } from "@/lib/teen-favorites-client";
import { EmptyState } from "@/components/shared/EmptyState";

export function TeenFavoritesTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  async function syncFavorites() {
    const ids = getFavoriteIdsCached();
    if (ids.length === 0) {
      setTasks([]);
      setReady(true);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("tasks").select("*").in("id", ids);
    const loaded = ((data ?? []) as TaskRow[]).map(rowToTask);
    // Сохраняем порядок избранного (по ids)
    const byId = new Map(loaded.map((t) => [t.id, t]));
    setTasks(ids.map((id) => byId.get(id)).filter((t): t is Task => t != null));
    setReady(true);
  }

  useEffect(() => {
    void loadFavorites().then(() => syncFavorites());
    window.addEventListener(TEEN_FAVORITES_EVENT, syncFavorites);
    return () => window.removeEventListener(TEEN_FAVORITES_EVENT, syncFavorites);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-panel-muted/50" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        emoji="🔖"
        title="Нет сохранённых задач"
        description="Нажми ♡ на карточке задачи, чтобы добавить её сюда."
        action={
          <Link href="/teen/dashboard" className="ui-btn-primary no-underline hover:no-underline">
            В каталог
          </Link>
        }
      />
    );
  }

  return (
    <div className="ui-card border-edge-strong p-0 overflow-hidden">
      <ul className="m-0 list-none p-0 divide-y divide-edge/60">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={`/teen/tasks/${task.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-inherit no-underline transition hover:bg-panel-muted/40"
            >
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-medium text-ink">{task.title}</p>
                <p className="m-0 mt-0.5 truncate text-xs text-sub">
                  {task.employerName}
                  {" · "}
                  {WORK_FORMAT_LABELS[task.workFormat]}
                  {" · "}
                  {task.durationLabel}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="m-0 text-sm font-semibold tabular-nums text-accent-bright">{formatRub(task.payRub)}</p>
              </div>
              <span className="shrink-0 text-xs text-sub-deep">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
