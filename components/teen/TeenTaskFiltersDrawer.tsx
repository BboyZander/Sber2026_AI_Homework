"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import {
  CATEGORY_LABELS,
  PAYMENT_TYPE_LABELS,
  TASK_CATEGORIES,
  TASK_PAYMENT_TYPES,
  WORK_FORMAT_LABELS,
  type TaskCategory,
  type WorkFormat,
} from "@/lib/constants";
import { maxShiftHoursForTeenAge } from "@/lib/minor-compliance";
import type {
  TeenCatalogAgeFit,
  TeenCatalogPaymentFilter,
  TeenCatalogSchedule,
  TeenCatalogSort,
  TeenCatalogWeekday,
} from "@/lib/teen-task-catalog-filter";

export type DrawerFilterState = {
  ageFitMode: TeenCatalogAgeFit;
  category: TaskCategory | null;
  workFormat: WorkFormat | "all";
  /** «До скольких часов ищу подработку» (F2.3); null — без ограничения. */
  maxDurationHours: number | null;
  paymentType: TeenCatalogPaymentFilter;
  weekday: TeenCatalogWeekday;
  /** Время задано точно / гибкий график (F2.6). */
  schedule: TeenCatalogSchedule;
  sort: TeenCatalogSort;
};

export const teenCatalogDrawerDefaults: DrawerFilterState = {
  ageFitMode: "all",
  category: null,
  workFormat: "all",
  maxDurationHours: null,
  paymentType: "all",
  weekday: "all",
  schedule: "all",
  sort: "recommended",
};

const SORT_OPTIONS: { value: TeenCatalogSort; label: string }[] = [
  { value: "recommended", label: "Рекомендуем" },
  { value: "pay_high", label: "Сначала дороже" },
  { value: "pay_low", label: "Сначала дешевле" },
  { value: "new", label: "Сначала новые" },
  { value: "soonest", label: "Ближайшие по дате" },
];

const WEEKDAY_OPTIONS: { value: TeenCatalogWeekday; label: string }[] = [
  { value: "all", label: "Любой" },
  { value: "weekday", label: "Будни" },
  { value: "weekend", label: "Выходные" },
];

const SCHEDULE_OPTIONS: { value: TeenCatalogSchedule; label: string }[] = [
  { value: "all", label: "Любой" },
  { value: "fixed", label: "Время задано" },
  { value: "flexible", label: "Гибкий график" },
];

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

/** Свободный фильтр длительности (F2.3): «до скольких часов ищу подработку», с лимитом по возрасту (ТК РФ). */
function DurationHoursFilter({
  value,
  onChange,
  teenAge,
  disabled,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  teenAge?: number;
  disabled?: boolean;
}) {
  const inputId = useId();
  const legalMax = maxShiftHoursForTeenAge(teenAge);
  const [draftText, setDraftText] = useState(value === null ? "" : String(value));
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    setDraftText(value === null ? "" : String(value));
  }, [value]);

  function commit(raw: string) {
    const trimmed = raw.trim().replace(",", ".");
    if (!trimmed) {
      setWarning(null);
      onChange(null);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setWarning(null);
      setDraftText("");
      onChange(null);
      return;
    }
    if (parsed > legalMax) {
      setWarning(
        `По закону смена для твоего возраста не может быть длиннее ${legalMax} ч — показываем подработки в этих пределах.`,
      );
      setDraftText(String(legalMax));
      onChange(legalMax);
      return;
    }
    setWarning(null);
    onChange(parsed);
  }

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-xs text-sub">
        До скольких часов в смену ищу подработку
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={1}
          max={legalMax}
          step={0.5}
          placeholder={`напр. 2`}
          value={draftText}
          disabled={disabled}
          onChange={(e) => setDraftText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          className="w-24 rounded-lg border border-edge bg-panel px-3 py-1.5 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2 disabled:opacity-50"
        />
        <span className="text-xs text-sub-deep">часов</span>
      </div>
      {warning ? (
        <p className="m-0 mt-1.5 text-xs leading-relaxed text-rose-300">{warning}</p>
      ) : (
        <p className="m-0 mt-1.5 text-xs leading-relaxed text-sub-deep">
          {typeof teenAge === "number"
            ? `По Трудовому кодексу для твоего возраста смена не длиннее ${legalMax} ч — выше выбрать не получится.`
            : "Лимит зависит от возраста (4–7 ч по ТК РФ): укажи его в профиле — посчитаем точнее."}
        </p>
      )}
    </div>
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
                <DurationHoursFilter
                  value={draft.maxDurationHours}
                  onChange={(next) => setDraft((d) => ({ ...d, maxDurationHours: next }))}
                  teenAge={teenAge}
                  disabled={disabled}
                />
              </Section>

              <Section title="День недели">
                {WEEKDAY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={draft.weekday === opt.value}
                    disabled={disabled}
                    onClick={() => setDraft((d) => ({ ...d, weekday: opt.value }))}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </Section>

              <Section title="График работы">
                {SCHEDULE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={draft.schedule === opt.value}
                    disabled={disabled}
                    onClick={() => setDraft((d) => ({ ...d, schedule: opt.value }))}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </Section>

              <Section title="Вид оплаты">
                <Chip
                  active={draft.paymentType === "all"}
                  disabled={disabled}
                  onClick={() => setDraft((d) => ({ ...d, paymentType: "all" }))}
                >
                  Любой
                </Chip>
                {TASK_PAYMENT_TYPES.map((pt) => (
                  <Chip
                    key={pt}
                    active={draft.paymentType === pt}
                    disabled={disabled}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        paymentType: d.paymentType === pt ? "all" : pt,
                      }))
                    }
                  >
                    {PAYMENT_TYPE_LABELS[pt]}
                  </Chip>
                ))}
              </Section>

              <Section title="Сортировка">
                {SORT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    active={draft.sort === opt.value}
                    disabled={disabled}
                    onClick={() => setDraft((d) => ({ ...d, sort: opt.value }))}
                  >
                    {opt.label}
                  </Chip>
                ))}
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
