"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicationStatus } from "@/lib/constants";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import {
  TEEN_APPLICATIONS_EVENT,
  TEEN_APPLICATIONS_EXTRA_KEY,
  TEEN_APPLICATIONS_OVERRIDES_KEY,
  TEEN_APPLICATIONS_WITHDRAWN_KEY,
  canWithdrawApplication,
  getApplications,
  getCurrentTeenId,
  pushTeenToast,
  updateApplicationStatus,
  withdrawApplication,
} from "@/lib/teen-flow";
import { TEEN_CONFIRM, TEEN_SAFETY_TIPS, TEEN_TOASTS } from "@/lib/ui-copy";
import { getTaskByIdForFlow } from "@/lib/employer-flow";
import { ApplicationCard } from "@/components/teen/ApplicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionTitle } from "@/components/shared/SectionTitle";

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
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out active:scale-95 sm:text-sm ${
        active
          ? "border-accent/50 bg-accent/20 text-ink shadow-md shadow-accent/15 ring-1 ring-accent/30"
          : "border-edge bg-panel-muted/85 text-sub hover:border-edge-strong hover:bg-raised/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/** Активная работа (F7.2): принят и ждёт выполнения / ждёт подтверждения. */
const ACTIVE_STATUSES: ApplicationStatus[] = ["accepted", "submitted"];
/** История откликов (F7.2): отправлен / отклонён / оплачен. */
const HISTORY_STATUSES: ApplicationStatus[] = ["applied", "rejected", "paid"];

export function TeenApplicationsView() {
  const [list, setList] = useState<ReturnType<typeof getApplications>>([]);
  const [filter, setFilter] = useState<ApplicationStatus | "all">("all");
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setList(getApplications());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === TEEN_APPLICATIONS_EXTRA_KEY ||
        e.key === TEEN_APPLICATIONS_WITHDRAWN_KEY ||
        e.key === TEEN_APPLICATIONS_OVERRIDES_KEY
      ) {
        refresh();
      }
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener(TEEN_APPLICATIONS_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, onCustom);
    };
  }, [refresh]);

  const active = useMemo(
    () => list.filter((a) => ACTIVE_STATUSES.includes(a.status)),
    [list],
  );
  const history = useMemo(
    () => list.filter((a) => HISTORY_STATUSES.includes(a.status)),
    [list],
  );
  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((a) => a.status === filter);
  }, [history, filter]);

  function resetFilter() {
    setFilter("all");
  }

  const teenId = getCurrentTeenId();

  function handleWithdraw(app: (typeof list)[number]) {
    if (
      !window.confirm(TEEN_CONFIRM.withdrawFromList)
    ) {
      return;
    }
    withdrawApplication(app, teenId);
    refresh();
  }

  function handleMarkCompleted(app: (typeof list)[number]) {
    const ok = updateApplicationStatus(app.id, "submitted");
    refresh();
    if (ok) pushTeenToast(TEEN_TOASTS.markedCompleted);
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-xl bg-panel-muted/50" />
        <div className="h-32 animate-pulse rounded-2xl bg-panel-muted/50" />
      </div>
    );
  }

  return (
    <div className="ui-stack">
      {list.length === 0 ? (
        <EmptyState
          emoji="📬"
          title="Пока без откликов"
          description="Зайди в каталог, выбери задачу и нажми «Откликнуться» — и она появится в этом списке."
          action={
            <Link href="/teen/dashboard" className="ui-btn-primary no-underline hover:no-underline">
              Открыть каталог
            </Link>
          }
        />
      ) : (
        <>
          <section className="space-y-3">
            <SectionTitle title="Сейчас в работе" />
            {active.length > 0 ? (
              <details className="ui-card border-edge text-sub-deep">
                <summary className="cursor-pointer text-sm font-medium text-sub transition hover:text-ink">
                  🛡️ Безопасность в работе
                </summary>
                <ul className="m-0 mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed">
                  {TEEN_SAFETY_TIPS.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            {active.length === 0 ? (
              <p className="m-0 text-sm text-sub">
                Сейчас нет активной работы — загляни в каталог и откликнись на новую задачу.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                <AnimatePresence>
                  {active.map((app, i) => (
                    <motion.li
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: Math.min(i * 0.05, 0.2),
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                    >
                      <ApplicationCard
                        application={app}
                        task={getTaskByIdForFlow(app.taskId) ?? undefined}
                        showMarkCompleted={app.status === "accepted"}
                        onMarkCompleted={() => handleMarkCompleted(app)}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>

          {history.length > 0 ? (
            <section className="space-y-3">
              <SectionTitle title="История откликов" />

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-sub">Статус</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                    Все ({history.length})
                  </FilterChip>
                  {HISTORY_STATUSES.map((st) => {
                    const count = history.filter((a) => a.status === st).length;
                    return (
                      <FilterChip
                        key={st}
                        active={filter === st}
                        onClick={() => setFilter(filter === st ? "all" : st)}
                      >
                        {APPLICATION_STATUS_LABELS[st]} ({count})
                      </FilterChip>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {filteredHistory.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EmptyState
                      emoji="🏷️"
                      title="В этом статусе пусто"
                      description="Смени фильтр или покажи все отклики."
                      action={
                        <button type="button" onClick={resetFilter} className="ui-btn-primary border-0">
                          Показать все
                        </button>
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.ul
                    key="list"
                    className="m-0 flex list-none flex-col gap-4 p-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AnimatePresence>
                      {filteredHistory.map((app, i) => (
                        <motion.li
                          key={app.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            duration: 0.28,
                            delay: Math.min(i * 0.05, 0.2),
                            ease: [0.22, 1, 0.36, 1] as const,
                          }}
                        >
                          <ApplicationCard
                            application={app}
                            task={getTaskByIdForFlow(app.taskId) ?? undefined}
                            showWithdraw={canWithdrawApplication(app)}
                            onWithdraw={() => handleWithdraw(app)}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                )}
              </AnimatePresence>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
