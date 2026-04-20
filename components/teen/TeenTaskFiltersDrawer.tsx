"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import {
  CATEGORY_LABELS,
  DURATION_BUCKET_LABELS,
  TASK_CATEGORIES,
  WORK_FORMAT_LABELS,
  type DurationBucket,
  type TaskCategory,
  type WorkFormat,
} from "@/lib/constants";
import type { TeenCatalogAgeFit, TeenCatalogPaySort } from "@/lib/teen-task-catalog-filter";

export type DrawerFilterState = {
  ageFitMode: TeenCatalogAgeFit;
  category: TaskCategory | null;
  workFormat: WorkFormat | "all";
  duration: DurationBucket | "all";
  paySort: TeenCatalogPaySort;
};

export const teenCatalogDrawerDefaults: DrawerFilterState = {
  ageFitMode: "all",
  category: null,
  workFormat: "all",
  duration: "all",
  paySort: "none",
};

function Chip({
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
      className={`touch-manipulation rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:text-[0.8125rem] ${
        active
          ? "border-accent/50 bg-accent/18 text-ink ring-1 ring-accent/25"
          : "border-edge bg-panel-muted/70 text-sub hover:border-edge-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-edge/80 py-3 last:border-0">
      <h3 className="m-0 text-[0.7rem] font-semibold uppercase tracking-wider text-sub">{title}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function TeenTaskFiltersDrawer({
  open,
  draft,
  setDraft,
  onApply,
  onResetAll,
  onClose,
  disabled,
  teenAge,
}: {
  open: boolean;
  draft: DrawerFilterState;
  setDraft: (next: DrawerFilterState | ((p: DrawerFilterState) => DrawerFilterState)) => void;
  onApply: () => void;
  onResetAll: () => void;
  onClose: () => void;
  disabled?: boolean;
  teenAge?: number;
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть фильтры"
            className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teen-filters-drawer-title"
            className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[min(88dvh,720px)] flex-col rounded-t-2xl border border-edge bg-canvas shadow-2xl sm:inset-x-auto sm:bottom-0 sm:left-auto sm:right-0 sm:top-[var(--header-h)] sm:h-[calc(100dvh-var(--header-h))] sm:max-h-none sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:border-l sm:border-t-0"
            initial={reduceMotion ? false : { opacity: 0, y: 24, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 24, x: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-edge px-4 py-3 sm:px-5">
              <h2 id="teen-filters-drawer-title" className="m-0 text-base font-semibold text-ink">
                Фильтры
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border-0 bg-transparent px-2 py-1 text-sm text-sub transition hover:bg-panel-muted/60 hover:text-ink"
                aria-label="Закрыть"
              >
                Закрыть
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 sm:px-5">
              {draft.ageFitMode === "mine" && teenAge === undefined ? (
                <p className="m-0 mt-3 rounded-lg border border-edge bg-panel-muted/40 px-3 py-2 text-xs text-sub">
                  Укажи возраст в профиле — тогда отбор «Подходит моему возрасту» заработает.
                </p>
              ) : null}

              <Section title="Возраст">
                <Chip
                  active={draft.ageFitMode === "all"}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, ageFitMode: "all" }))}
                >
                  Все
                </Chip>
                <Chip
                  active={draft.ageFitMode === "mine"}
                  disabled={disabled || teenAge === undefined}
                  title={
                    teenAge === undefined
                      ? "Сначала укажите возраст в профиле"
                      : undefined
                  }
                  onClick={() =>
                    setDraft((d) => ({ ...d, ageFitMode: d.ageFitMode === "mine" ? "all" : "mine" }))
                  }
                >
                  Подходит моему возрасту
                </Chip>
              </Section>

              <Section title="Категория">
                <Chip
                  active={draft.category === null}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, category: null }))}
                >
                  Все
                </Chip>
                {TASK_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    active={draft.category === cat}
                    disabled={disabled}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        category: d.category === cat ? null : cat,
                      }))
                    }
                  >
                    {CATEGORY_LABELS[cat]}
                  </Chip>
                ))}
              </Section>

              <Section title="Формат">
                <Chip
                  active={draft.workFormat === "all"}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, workFormat: "all" }))}
                >
                  Все
                </Chip>
                {(Object.keys(WORK_FORMAT_LABELS) as WorkFormat[]).map((f) => (
                  <Chip
                    key={f}
                    active={draft.workFormat === f}
                    disabled={disabled}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        workFormat: d.workFormat === f ? "all" : f,
                      }))
                    }
                  >
                    {WORK_FORMAT_LABELS[f]}
                  </Chip>
                ))}
              </Section>

              <Section title="Длительность">
                <Chip
                  active={draft.duration === "all"}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, duration: "all" }))}
                >
                  Все
                </Chip>
                <Chip
                  active={draft.duration === "short"}
                  disabled={disabled}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      duration: d.duration === "short" ? "all" : "short",
                    }))
                  }
                >
                  {DURATION_BUCKET_LABELS.short}
                </Chip>
                <Chip
                  active={draft.duration === "long"}
                  disabled={disabled}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      duration: d.duration === "long" ? "all" : "long",
                    }))
                  }
                >
                  {DURATION_BUCKET_LABELS.long}
                </Chip>
              </Section>

              <Section title="Сортировка по оплате">
                <Chip
                  active={draft.paySort === "none"}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, paySort: "none" }))}
                >
                  По умолчанию
                </Chip>
                <Chip
                  active={draft.paySort === "high"}
                  disabled={disabled}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      paySort: d.paySort === "high" ? "none" : "high",
                    }))
                  }
                >
                  Сначала выше оплата
                </Chip>
                <Chip
                  active={draft.paySort === "low"}
                  disabled={disabled}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      paySort: d.paySort === "low" ? "none" : "low",
                    }))
                  }
                >
                  Сначала ниже оплата
                </Chip>
              </Section>
            </div>

            <div className="shrink-0 border-t border-edge bg-canvas/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onResetAll}
                  className="ui-btn-ghost min-h-[2.75rem] flex-1 border border-edge px-4 py-2.5 text-sm sm:min-h-0 sm:py-2"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onApply}
                  className="ui-btn-primary min-h-[2.75rem] flex-1 border-0 px-4 py-2.5 text-sm sm:min-h-0 sm:py-2"
                >
                  Применить
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
