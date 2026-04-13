"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Task } from "@/types/task";
import {
  CATEGORY_LABELS,
  DURATION_BUCKET_LABELS,
  TASK_CATEGORIES,
  WORK_FORMAT_LABELS,
  type DurationBucket,
  type TaskCategory,
  type WorkFormat,
} from "@/lib/constants";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBar } from "@/components/shared/SearchBar";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TeenCatalogSkeletonList } from "@/components/shared/Skeleton";
import { TeenCatalogTaskCard } from "@/components/teen/TeenCatalogTaskCard";

type PaySort = "none" | "high" | "low";

function FilterChip({
  active,
  children,
  onClick,
  disabled,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out active:scale-95 sm:text-sm disabled:pointer-events-none disabled:opacity-50 ${
        active
          ? "border-accent/50 bg-accent/20 text-ink shadow-md shadow-accent/15 ring-1 ring-accent/30"
          : "border-edge bg-panel-muted/85 text-sub hover:border-edge-strong hover:bg-raised/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function TeenTasksCatalog({ tasks, loading = false }: { tasks: Task[]; loading?: boolean }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [workFormat, setWorkFormat] = useState<WorkFormat | "all">("all");
  const [duration, setDuration] = useState<DurationBucket | "all">("all");
  const [paySort, setPaySort] = useState<PaySort>("none");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tasks.filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.employerName.toLowerCase().includes(q) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(q)
      );
    });
    if (category) list = list.filter((t) => t.category === category);
    if (workFormat !== "all") list = list.filter((t) => t.workFormat === workFormat);
    if (duration !== "all") list = list.filter((t) => t.durationBucket === duration);
    if (paySort === "high") list = [...list].sort((a, b) => b.payRub - a.payRub);
    else if (paySort === "low") list = [...list].sort((a, b) => a.payRub - b.payRub);
    return list;
  }, [tasks, query, category, workFormat, duration, paySort]);

  function resetFilters() {
    setQuery("");
    setCategory(null);
    setWorkFormat("all");
    setDuration("all");
    setPaySort("none");
  }

  const hasActiveFilters =
    query.trim() !== "" ||
    category !== null ||
    workFormat !== "all" ||
    duration !== "all" ||
    paySort !== "none";

  return (
    <div className="ui-stack">
      <header className="space-y-1">
        <SectionTitle title="Задачи" />
        <p className="text-sm text-sub">
          Фильтры по формату, длительности и оплате. Суммы в демо — для ориентира.
        </p>
      </header>

      <SearchBar
        placeholder="Название, описание или компания"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Категория</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === null} disabled={loading} onClick={() => setCategory(null)}>
            Все
          </FilterChip>
          {TASK_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={category === cat}
              disabled={loading}
              onClick={() => setCategory(category === cat ? null : cat)}
            >
              {CATEGORY_LABELS[cat]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Формат</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={workFormat === "all"} disabled={loading} onClick={() => setWorkFormat("all")}>
            Все
          </FilterChip>
          {(Object.keys(WORK_FORMAT_LABELS) as WorkFormat[]).map((f) => (
            <FilterChip
              key={f}
              active={workFormat === f}
              disabled={loading}
              onClick={() => setWorkFormat(workFormat === f ? "all" : f)}
            >
              {WORK_FORMAT_LABELS[f]}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Длительность</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={duration === "all"} disabled={loading} onClick={() => setDuration("all")}>
            Все
          </FilterChip>
          <FilterChip
            active={duration === "short"}
            disabled={loading}
            onClick={() => setDuration(duration === "short" ? "all" : "short")}
          >
            {DURATION_BUCKET_LABELS.short}
          </FilterChip>
          <FilterChip
            active={duration === "long"}
            disabled={loading}
            onClick={() => setDuration(duration === "long" ? "all" : "long")}
          >
            {DURATION_BUCKET_LABELS.long}
          </FilterChip>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Сортировка по оплате</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={paySort === "none"} disabled={loading} onClick={() => setPaySort("none")}>
            По умолчанию
          </FilterChip>
          <FilterChip
            active={paySort === "high"}
            disabled={loading}
            onClick={() => setPaySort(paySort === "high" ? "none" : "high")}
          >
            Сначала выше оплата
          </FilterChip>
          <FilterChip
            active={paySort === "low"}
            disabled={loading}
            onClick={() => setPaySort(paySort === "low" ? "none" : "low")}
          >
            Сначала ниже оплата
          </FilterChip>
        </div>
      </div>

      <p className="text-sm text-sub">
        {loading ? (
          <span className="text-sub-deep">Загружаем каталог…</span>
        ) : (
          <>
            Найдено: <span className="font-medium text-sub">{filtered.length}</span> из {tasks.length}
          </>
        )}
      </p>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TeenCatalogSkeletonList />
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tasks.length === 0 && !hasActiveFilters ? (
              <EmptyState
                emoji="📋"
                title="В каталоге пока пусто"
                description="В демо сюда попадают только опубликованные задачи. Попроси «работодателя» создать задачу или зайди под demo_employer и опубликуй её — список обновится сразу."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/teen/dashboard" className="ui-btn-primary no-underline hover:no-underline">
                      На главную
                    </Link>
                    <Link
                      href="/login"
                      className="ui-btn-ghost border border-edge px-4 py-2 no-underline hover:no-underline"
                    >
                      Сменить аккаунт
                    </Link>
                  </div>
                }
              />
            ) : (
              <EmptyState
                emoji="🔍"
                title="Ничего не нашлось"
                description={
                  tasks.length === 0
                    ? "С такими фильтрами список пуст. Сбрось их — или дождись новых задач от работодателя."
                    : "Сбрось фильтры или измени запрос."
                }
                action={
                  hasActiveFilters ? (
                    <button type="button" onClick={resetFilters} className="ui-btn-primary border-0">
                      Сбросить фильтры
                    </button>
                  ) : null
                }
              />
            )}
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            className="m-0 flex list-none flex-col gap-4 p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.map((task, i) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(i * 0.04, 0.24),
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <TeenCatalogTaskCard task={task} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
