"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";
import { CATEGORY_LABELS, DURATION_BUCKET_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import {
  TEEN_APPLICATIONS_EVENT,
  applyToTask,
  canWithdrawApplication,
  getApplications,
  getCurrentTeenId,
  withdrawApplication,
} from "@/lib/teen-flow";
import { formatDate, formatRub } from "@/lib/helpers";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TEEN_CONFIRM } from "@/lib/ui-copy";

export function TeenTaskDetailView({
  task,
  employerTagline,
}: {
  task: Task;
  employerTagline: string;
}) {
  const reduceMotion = useReducedMotion();
  const [applied, setApplied] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  const syncApplied = useCallback(() => {
    if (typeof window === "undefined") return;
    const teenId = getCurrentTeenId();
    setApplied(getApplications(teenId).some((a) => a.taskId === task.id));
  }, [task.id]);

  useEffect(() => {
    setMounted(true);
    syncApplied();
    window.addEventListener(TEEN_APPLICATIONS_EVENT, syncApplied);
    return () => window.removeEventListener(TEEN_APPLICATIONS_EVENT, syncApplied);
  }, [syncApplied]);

  function handleApply() {
    if (applied || applyBusy) return;
    setApplyBusy(true);
    window.setTimeout(() => {
      const { added } = applyToTask(task.id);
      if (added) setApplied(true);
      syncApplied();
      setApplyBusy(false);
    }, 260);
  }

  const teenId = getCurrentTeenId();
  const currentApp =
    mounted && typeof window !== "undefined"
      ? getApplications(teenId).find((a) => a.taskId === task.id)
      : undefined;
  const canWithdraw = Boolean(currentApp && canWithdrawApplication(currentApp));

  function handleWithdraw() {
    if (!currentApp) return;
    if (
      !window.confirm(TEEN_CONFIRM.withdrawFromTask)
    ) {
      return;
    }
    withdrawApplication(currentApp, teenId);
    syncApplied();
  }

  const ctaLabel = applied ? "Отклик отправлен" : applyBusy ? "Отправляем…" : "Откликнуться";
  const ctaDisabled = applied || applyBusy;

  const summaryRows = [
    { label: "Оплата", value: formatRub(task.payRub), accent: true as const },
    { label: "Опыт", value: `+${task.rewardXp} XP`, accent: false as const },
    { label: "Формат", value: WORK_FORMAT_LABELS[task.workFormat], accent: false as const },
    { label: "Длительность", value: task.durationLabel, accent: false as const },
    {
      label: "Занятость",
      value: DURATION_BUCKET_LABELS[task.durationBucket],
      accent: false as const,
    },
    ...(task.deadline
      ? [{ label: "Срок", value: formatDate(task.deadline), accent: false as const }]
      : []),
  ];

  function SummaryCard({ className = "" }: { className?: string }) {
    return (
      <div className={`ui-card border-edge ${className}`}>
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">
          Кратко о задаче
        </p>
        <dl className="mt-4 space-y-3">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-xs text-sub">{row.label}</dt>
              <dd
                className={`text-right text-sm font-medium ${
                  row.accent ? "text-lg font-bold text-accent" : "text-ink"
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 hidden space-y-3 lg:block">
          <ApplyButton />
          {applied && canWithdraw ? (
            <button
              type="button"
              onClick={handleWithdraw}
              className="w-full text-center text-sm font-medium text-rose-300/90 underline-offset-2 transition hover:text-rose-200 hover:underline"
            >
              Отозвать отклик
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function ApplyButton({ fullWidth = true }: { fullWidth?: boolean }) {
    return (
      <motion.button
        type="button"
        disabled={ctaDisabled}
        onClick={handleApply}
        whileTap={reduceMotion || ctaDisabled ? undefined : { scale: 0.98 }}
        className={`rounded-xl bg-gradient-to-r from-accent to-accent-dark py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:brightness-100 ${
          fullWidth ? "w-full" : ""
        }`}
      >
        {ctaLabel}
      </motion.button>
    );
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <StatusBadge kind="task" status={task.status} />
          <span className="rounded-lg border border-edge bg-panel-muted/50 px-2.5 py-1 text-xs font-medium text-sub">
            {CATEGORY_LABELS[task.category]}
          </span>
          <span className="text-xs text-sub">
            {WORK_FORMAT_LABELS[task.workFormat]} · {task.durationLabel}
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
          {task.title}
        </h1>
        <p className="mt-2 text-sm text-sub">Заказчик: {task.employerName}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm lg:hidden">
          <span className="text-lg font-bold text-ink">{formatRub(task.payRub)}</span>
          <span className="text-sub-deep">·</span>
          <span className="text-sub">{task.durationLabel}</span>
          <span className="text-sub-deep">·</span>
          <span className="text-accent-bright/90">+{task.rewardXp} XP</span>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
          <div className="min-w-0 space-y-8">
            <section>
              <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">
                Описание
              </h2>
              <p className="mt-3 m-0 text-base leading-relaxed text-sub">{task.description}</p>
            </section>

            {task.location ? (
              <section className="ui-card border-edge">
                <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">
                  Где
                </h2>
                <p className="mt-2 m-0 text-base font-medium text-ink">{task.location}</p>
                <p className="mt-1 m-0 text-sm text-sub">
                  {task.workFormat === "online"
                    ? "Онлайн — уточните у работодателя, как подключиться."
                    : "Офлайн — приходите в указанную точку в согласованное время."}
                </p>
              </section>
            ) : null}

            <section className="ui-card border-accent/20 bg-accent-soft">
              <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-accent-bright">
                Работодатель
              </h2>
              <p className="mt-2 m-0 text-lg font-semibold text-ink">{task.employerName}</p>
              <p className="mt-2 m-0 text-sm leading-relaxed text-sub">{employerTagline}</p>
            </section>

            <AnimatePresence>
              {mounted && applied ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3 rounded-xl border border-accent/35 bg-accent-soft px-4 py-3"
                >
                  <span className="text-xl" aria-hidden>
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-sm font-semibold text-accent-bright">Отклик отправлен</p>
                    <p className="mt-1 m-0 text-xs text-sub">
                      В полной версии работодатель увидит его в кабинете. Статус смотри в{" "}
                      <Link href="/teen/applications" className="font-medium text-accent hover:underline">
                        Откликах
                      </Link>
                      .
                    </p>
                    {canWithdraw ? (
                      <button
                        type="button"
                        onClick={handleWithdraw}
                        className="mt-2 text-xs font-medium text-rose-300/90 underline-offset-2 transition hover:text-rose-200 hover:underline"
                      >
                        Отозвать отклик
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <p className="m-0 text-xs text-sub-deep">
              В демо суммы и сроки примерные. Итоговые условия — после связи с заказчиком.
            </p>
          </div>

          <aside className="mt-10 hidden lg:mt-0 lg:block">
            <div className="sticky top-[calc(var(--header-h)+1rem)] space-y-4">
              <SummaryCard />
            </div>
          </aside>

          <div className="mt-8 lg:hidden">
            <SummaryCard />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-edge bg-canvas/90 px-4 pt-3 backdrop-blur-lg lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-2">
          <ApplyButton />
          {applied && canWithdraw ? (
            <button
              type="button"
              onClick={handleWithdraw}
              className="py-1 text-center text-sm font-medium text-rose-300/90 underline-offset-2 transition hover:text-rose-200 hover:underline"
            >
              Отозвать отклик
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
