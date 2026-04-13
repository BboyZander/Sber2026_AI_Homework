"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PublishedTaskCard } from "@/components/employer/PublishedTaskCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EmployerTaskListSkeleton } from "@/components/shared/Skeleton";
import type { Task } from "@/types/task";
import {
  EMPLOYER_TASKS_EVENT,
  EMPLOYER_TASKS_EXTRA_KEY,
  getEmployerTaskStats,
  getEmployerTaskViewStatus,
  getEmployerTasks,
} from "@/lib/employer-flow";
import { EMPLOYER_TASK_VIEW_FILTER_LABELS } from "@/lib/ui-copy";

type ViewStatus = "published" | "active" | "completed";

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
        active
          ? "border-accent/50 bg-accent-soft text-accent-bright ring-1 ring-accent/30"
          : "border-edge bg-panel-muted/70 text-sub hover:border-edge-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function EmployerTasksView() {
  const [list, setList] = useState<Task[]>([]);
  const [filter, setFilter] = useState<ViewStatus | "all">("all");
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setList(getEmployerTasks());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EMPLOYER_TASKS_EXTRA_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EMPLOYER_TASKS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EMPLOYER_TASKS_EVENT, refresh);
    };
  }, [refresh]);

  const mapped = useMemo(
    () =>
      list.map((task) => ({
        task,
        viewStatus: getEmployerTaskViewStatus(task),
      })),
    [list],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return mapped;
    return mapped.filter((x) => x.viewStatus === filter);
  }, [filter, mapped]);

  const counts = useMemo(() => {
    const s = getEmployerTaskStats();
    return {
      all: s.total,
      published: s.published,
      active: s.active,
      completed: s.completed,
    };
  }, [list]);

  if (!mounted) {
    return (
      <div className="ui-stack">
        <div className="h-9 max-w-xs animate-pulse rounded-xl bg-panel-muted/70" />
        <EmployerTaskListSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="ui-stack">
      <SectionTitle title="Задачи" action={<CTAButton href="/employer/tasks/new">Новая задача</CTAButton>} />

      <div className="ui-card border-edge-strong bg-panel-muted/75">
        <p className="m-0 text-sm text-sub">
          Всего: <span className="font-semibold text-ink">{counts.all}</span> · Активные:{" "}
          <span className="font-semibold text-ink">{counts.active}</span>
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Статус</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Все ({counts.all})
          </FilterChip>
          {(Object.keys(EMPLOYER_TASK_VIEW_FILTER_LABELS) as ViewStatus[]).map((s) => (
            <FilterChip
              key={s}
              active={filter === s}
              onClick={() => setFilter((prev) => (prev === s ? "all" : s))}
            >
              {EMPLOYER_TASK_VIEW_FILTER_LABELS[s]} ({counts[s]})
            </FilterChip>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {list.length === 0 ? (
              <EmptyState
                emoji="📋"
                title="Задач пока нет"
                description="Создайте первую — после публикации она появится здесь и в каталоге подростка."
                action={<CTAButton href="/employer/tasks/new">Создать задачу</CTAButton>}
              />
            ) : (
              <EmptyState
                emoji="🔍"
                title="Нет задач с таким статусом"
                description="Смените фильтр или откройте полный список."
                action={
                  <button type="button" className="ui-btn-ghost border-0" onClick={() => setFilter("all")}>
                    Все задачи
                  </button>
                }
              />
            )}
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            className="m-0 flex list-none flex-col gap-3 p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence>
              {filtered.map((x, i) => (
                <motion.li
                  key={x.task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(i * 0.04, 0.2) }}
                >
                  <PublishedTaskCard task={x.task} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
