"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task";
import {
  CATEGORY_LABELS,
  DURATION_BUCKET_LABELS,
  type DurationBucket,
  type TaskCategory,
  type WorkFormat,
} from "@/lib/constants";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBar } from "@/components/shared/SearchBar";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TeenCatalogSkeletonList } from "@/components/shared/Skeleton";
import { TeenCatalogTaskCard } from "@/components/teen/TeenCatalogTaskCard";
import { TeenTaskFiltersDrawer, teenCatalogDrawerDefaults, type DrawerFilterState } from "@/components/teen/TeenTaskFiltersDrawer";
import { TeenTasksCatalogActiveChips, type ActiveChip } from "@/components/teen/TeenTasksCatalogActiveChips";
import { getTeenProfile, PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-store";
import {
  filterTeenCatalogTasks,
  type TeenCatalogAgeFit,
  type TeenCatalogPaySort,
} from "@/lib/teen-task-catalog-filter";

function QuickChip({
  active,
  children,
  onClick,
  disabled,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 touch-manipulation rounded-full border px-3 py-2 text-xs font-medium transition will-change-transform active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 sm:py-1.5 sm:text-sm ${
        active
          ? "border-accent/50 bg-accent/20 text-ink shadow-sm shadow-accent/15 ring-1 ring-accent/30"
          : "border-edge bg-panel-muted/85 text-sub hover:border-edge-strong hover:text-ink"
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
  const [paySort, setPaySort] = useState<TeenCatalogPaySort>("none");
  const [ageFitMode, setAgeFitMode] = useState<TeenCatalogAgeFit>("all");
  const [teenAge, setTeenAge] = useState<number | undefined>(undefined);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDraft, setDrawerDraft] = useState<DrawerFilterState>(teenCatalogDrawerDefaults);

  useEffect(() => {
    function syncAge() {
      const a = getTeenProfile().age;
      const n = typeof a === "number" && Number.isFinite(a) ? a : undefined;
      setTeenAge(n);
      if (n === undefined) {
        setAgeFitMode((m) => (m === "mine" ? "all" : m));
      }
    }
    syncAge();
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "teen") syncAge();
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
  }, []);

  const filterInput = useMemo(
    () => ({
      query,
      category,
      workFormat,
      duration,
      paySort,
      ageFitMode,
      teenAge,
    }),
    [query, category, workFormat, duration, paySort, ageFitMode, teenAge],
  );

  const filtered = useMemo(() => filterTeenCatalogTasks(tasks, filterInput), [tasks, filterInput]);

  const hiddenPanelFilterCount = useMemo(() => {
    let n = 0;
    if (category !== null) n++;
    if (workFormat === "offline") n++;
    if (duration === "long") n++;
    if (paySort === "low") n++;
    return n;
  }, [category, workFormat, duration, paySort]);

  const hasActiveFilters = useMemo(() => {
    return (
      query.trim() !== "" ||
      category !== null ||
      workFormat !== "all" ||
      duration !== "all" ||
      paySort !== "none" ||
      ageFitMode === "mine"
    );
  }, [query, category, workFormat, duration, paySort, ageFitMode]);

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory(null);
    setWorkFormat("all");
    setDuration("all");
    setPaySort("none");
    setAgeFitMode("all");
    setDrawerDraft(teenCatalogDrawerDefaults);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerDraft({
      ageFitMode,
      category,
      workFormat,
      duration,
      paySort,
    });
    setDrawerOpen(true);
  }, [ageFitMode, category, workFormat, duration, paySort]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const applyDrawer = useCallback(() => {
    const fit =
      drawerDraft.ageFitMode === "mine" && typeof teenAge !== "number" ? "all" : drawerDraft.ageFitMode;
    setAgeFitMode(fit);
    setCategory(drawerDraft.category);
    setWorkFormat(drawerDraft.workFormat);
    setDuration(drawerDraft.duration);
    setPaySort(drawerDraft.paySort);
    setDrawerOpen(false);
  }, [drawerDraft, teenAge]);

  const resetAllFromDrawer = useCallback(() => {
    resetFilters();
    setDrawerOpen(false);
  }, [resetFilters]);

  const activeChips: ActiveChip[] = useMemo(() => {
    const chips: ActiveChip[] = [];
    const q = query.trim();
    if (q) {
      const short = q.length > 28 ? `${q.slice(0, 28)}…` : q;
      chips.push({
        id: "search",
        label: `Поиск: ${short}`,
        onRemove: () => setQuery(""),
      });
    }
    if (ageFitMode === "mine") {
      chips.push({
        id: "mine",
        label: "Подходит мне",
        onRemove: () => setAgeFitMode("all"),
      });
    }
    if (workFormat === "online") {
      chips.push({
        id: "online",
        label: "Онлайн",
        onRemove: () => setWorkFormat("all"),
      });
    }
    if (duration === "short") {
      chips.push({
        id: "short",
        label: DURATION_BUCKET_LABELS.short,
        onRemove: () => setDuration("all"),
      });
    }
    if (paySort === "high") {
      chips.push({
        id: "pay-high",
        label: "Выше оплата",
        onRemove: () => setPaySort("none"),
      });
    }
    if (category) {
      chips.push({
        id: `cat-${category}`,
        label: CATEGORY_LABELS[category],
        onRemove: () => setCategory(null),
      });
    }
    if (workFormat === "offline") {
      chips.push({
        id: "offline",
        label: "Офлайн",
        onRemove: () => setWorkFormat("all"),
      });
    }
    if (duration === "long") {
      chips.push({
        id: "long",
        label: DURATION_BUCKET_LABELS.long,
        onRemove: () => setDuration("all"),
      });
    }
    if (paySort === "low") {
      chips.push({
        id: "pay-low",
        label: "Ниже оплата",
        onRemove: () => setPaySort("none"),
      });
    }
    return chips;
  }, [query, ageFitMode, workFormat, duration, paySort, category]);

  return (
    <div className="ui-stack">
      <header className="space-y-1">
        <SectionTitle title="Задачи" />
        <p className="text-sm text-sub">Поиск и карточки — расширенные фильтры в пару нажатий.</p>
      </header>

      <SearchBar
        placeholder="Название, описание или компания"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 sm:flex-1">
          <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:px-0">
            <QuickChip
              active={ageFitMode === "mine"}
              disabled={loading || typeof teenAge !== "number"}
              title={
                typeof teenAge !== "number"
                  ? "Сначала укажите возраст в профиле — тогда можно включить отбор «Подходит мне»"
                  : undefined
              }
              onClick={() => setAgeFitMode(ageFitMode === "mine" ? "all" : "mine")}
            >
              Подходит мне
            </QuickChip>
            <QuickChip
              active={workFormat === "online"}
              disabled={loading}
              onClick={() => setWorkFormat(workFormat === "online" ? "all" : "online")}
            >
              Онлайн
            </QuickChip>
            <QuickChip
              active={duration === "short"}
              disabled={loading}
              onClick={() => setDuration(duration === "short" ? "all" : "short")}
            >
              {DURATION_BUCKET_LABELS.short}
            </QuickChip>
            <QuickChip
              active={paySort === "high"}
              disabled={loading}
              onClick={() => setPaySort(paySort === "high" ? "none" : "high")}
            >
              Выше оплата
            </QuickChip>
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={openDrawer}
          className="ui-btn-ghost shrink-0 self-start border border-edge px-4 py-2 text-sm font-medium sm:self-center"
        >
          Фильтры
          {hiddenPanelFilterCount > 0 ? ` (${hiddenPanelFilterCount})` : ""}
        </button>
      </div>

      <TeenTasksCatalogActiveChips chips={activeChips} />

      <p className="text-sm text-sub">
        {loading ? (
          <span className="text-sub-deep">Загружаем каталог…</span>
        ) : tasks.length > 0 ? (
          <>
            Найдено:{" "}
            <span className="font-medium text-ink">
              {filtered.length} из {tasks.length}
            </span>
          </>
        ) : (
          <>
            Найдено: <span className="font-medium text-ink">0 задач</span>
          </>
        )}
      </p>
      {!loading &&
      tasks.length > 0 &&
      ageFitMode === "mine" &&
      typeof teenAge === "number" &&
      filtered.length < tasks.length ? (
        <p className="m-0 text-xs leading-relaxed text-sub">
          Под фильтром «Подходит мне» скрыты задачи с другим возрастным диапазоном или помеченные как недоступные для
          несовершеннолетних.
        </p>
      ) : null}

      <TeenTaskFiltersDrawer
        open={drawerOpen}
        draft={drawerDraft}
        setDraft={setDrawerDraft}
        onApply={applyDrawer}
        onResetAll={resetAllFromDrawer}
        onClose={closeDrawer}
        disabled={loading}
        teenAge={teenAge}
      />

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
