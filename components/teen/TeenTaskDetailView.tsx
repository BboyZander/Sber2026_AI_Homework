"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task";
import {
  CATEGORY_LABELS,
  DURATION_BUCKET_LABELS,
  MINOR_COMPLIANCE_STATUS_LABELS,
  WORK_FORMAT_LABELS,
} from "@/lib/constants";
import {
  TEEN_APPLICATIONS_EVENT,
  TEEN_FLOW_TOAST_EVENT,
  applyToTask,
  canWithdrawApplication,
  getApplications,
  getCurrentTeenId,
  withdrawApplication,
  type TeenFlowToastDetail,
} from "@/lib/teen-flow";
import { formatDate } from "@/lib/helpers";
import { currentMinorPeriod, getMinorComplianceResult } from "@/lib/minor-compliance";
import { getTeenProfile, PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-store";
import { formatTaskAgeRange, taskHasDefinedAgeRange, teenCanRespondByAge } from "@/lib/task-age";
import { taskPaymentTeenEstimatedTotalLine, taskPaymentTeenPrimaryLine } from "@/lib/task-payment";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TEEN_CONFIRM, TEEN_TOASTS } from "@/lib/ui-copy";

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
  const [teenAge, setTeenAge] = useState<number | undefined>(() => {
    const a = getTeenProfile().age;
    return typeof a === "number" && Number.isFinite(a) ? a : undefined;
  });

  const liveCompliance = useMemo(
    () =>
      getMinorComplianceResult(
        {
          minAge: task.minAge,
          maxAge: task.maxAge,
          engagementType: task.engagementType,
          startDateTime: task.startDateTime,
          durationHours: task.durationHours,
          duringSchoolPeriodAllowed: task.duringSchoolPeriodAllowed,
          duringVacationAllowed: task.duringVacationAllowed,
          requiresMedicalExam: task.requiresMedicalExam,
          physicalLoadLevel: task.physicalLoadLevel,
          isOutdoor: task.isOutdoor,
        },
        currentMinorPeriod(),
      ),
    [
      task.minAge,
      task.maxAge,
      task.engagementType,
      task.startDateTime,
      task.durationHours,
      task.duringSchoolPeriodAllowed,
      task.duringVacationAllowed,
      task.requiresMedicalExam,
      task.physicalLoadLevel,
      task.isOutdoor,
    ],
  );

  const complianceBlocked =
    task.minorComplianceStatus === "blocked" || liveCompliance.status === "blocked";
  const ageOk = teenCanRespondByAge(task, teenAge);
  const applyAllowed = ageOk && !complianceBlocked;

  useEffect(() => {
    function syncAge() {
      const a = getTeenProfile().age;
      setTeenAge(typeof a === "number" && Number.isFinite(a) ? a : undefined);
    }
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "teen") syncAge();
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
  }, []);

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
    if (!ageOk) {
      window.dispatchEvent(
        new CustomEvent<TeenFlowToastDetail>(TEEN_FLOW_TOAST_EVENT, {
          detail: { message: TEEN_TOASTS.applyBlockedAge },
        }),
      );
      return;
    }
    if (complianceBlocked) {
      window.dispatchEvent(
        new CustomEvent<TeenFlowToastDetail>(TEEN_FLOW_TOAST_EVENT, {
          detail: { message: TEEN_TOASTS.applyBlockedCompliance },
        }),
      );
      return;
    }
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

  const ctaLabel = applied
    ? "Отклик отправлен"
    : applyBusy
      ? "Отправляем…"
      : complianceBlocked
        ? "Недоступно по правилам"
        : !ageOk
          ? taskHasDefinedAgeRange(task) && typeof teenAge !== "number"
            ? "Укажите возраст в профиле"
            : "Не подходит по возрасту"
          : "Откликнуться";
  const ctaDisabled = applied || applyBusy || !applyAllowed;

  const applyBlockedHint = (() => {
    if (applied || applyBusy) return null;
    if (complianceBlocked) {
      const reasons =
        task.minorComplianceStatus === "blocked" && task.minorComplianceReasons.length > 0
          ? task.minorComplianceReasons
          : liveCompliance.reasons;
      return reasons.length > 0 ? reasons[0] : TEEN_TOASTS.applyBlockedCompliance;
    }
    if (!ageOk) {
      if (taskHasDefinedAgeRange(task) && typeof teenAge !== "number") {
        return (
          <>
            Чтобы откликнуться, укажи возраст в{" "}
            <Link href="/teen/profile" className="font-medium text-accent underline-offset-2 hover:underline">
              профиле
            </Link>
            .
          </>
        );
      }
      return "Твой возраст из профиля не входит в диапазон этой задачи.";
    }
    return null;
  })();

  const ageRangeLabel = formatTaskAgeRange(task);

  const payPrimary = taskPaymentTeenPrimaryLine(task);
  const payExtra = taskPaymentTeenEstimatedTotalLine(task);

  const summaryRows = [
    { label: "Оплата", value: payPrimary, accent: true as const },
    ...(payExtra ? [{ label: "Ориентир", value: payExtra, accent: false as const }] : []),
    { label: "Опыт", value: `+${task.rewardXp} XP`, accent: false as const },
    { label: "Формат", value: WORK_FORMAT_LABELS[task.workFormat], accent: false as const },
    { label: "Длительность", value: task.durationLabel, accent: false as const },
    {
      label: "Занятость",
      value: DURATION_BUCKET_LABELS[task.durationBucket],
      accent: false as const,
    },
    ...(ageRangeLabel
      ? [{ label: "Возраст", value: ageRangeLabel, accent: false as const }]
      : []),
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
          {applyBlockedHint ? (
            <p className="m-0 text-center text-xs leading-relaxed text-sub">{applyBlockedHint}</p>
          ) : null}
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
        title={typeof applyBlockedHint === "string" ? applyBlockedHint : undefined}
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
          {ageRangeLabel ? (
            <span className="rounded-lg border border-edge bg-panel-muted/50 px-2.5 py-1 text-xs font-medium text-sub">
              {ageRangeLabel}
            </span>
          ) : null}
          <span className="text-xs text-sub">
            {WORK_FORMAT_LABELS[task.workFormat]} · {task.durationLabel}
          </span>
        </div>

        <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
          {task.title}
        </h1>
        <p className="mt-2 text-sm text-sub">
          Заказчик:{" "}
          <Link
            href={`/teen/employer/${task.employerId}`}
            className="font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
          >
            {task.employerName}
          </Link>
        </p>
        <p className="mt-1.5 m-0">
          <Link
            href={`/teen/employer/${task.employerId}`}
            className="text-xs font-medium text-accent/90 underline-offset-2 hover:text-accent-bright hover:underline"
          >
            Карточка компании: реквизиты и описание →
          </Link>
        </p>

        <div className="mt-4 space-y-1 lg:hidden">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-lg font-bold text-ink">{payPrimary}</span>
            <span className="text-sub-deep">·</span>
            <span className="text-sub">{task.durationLabel}</span>
            <span className="text-sub-deep">·</span>
            <span className="text-accent-bright/90">+{task.rewardXp} XP</span>
          </div>
          {payExtra ? <p className="m-0 text-xs text-sub-deep">{payExtra}</p> : null}
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
              <p className="mt-2 m-0 text-lg font-semibold text-ink">
                <Link
                  href={`/teen/employer/${task.employerId}`}
                  className="text-ink underline-offset-2 transition hover:text-accent-bright hover:underline"
                >
                  {task.employerName}
                </Link>
              </p>
              <p className="mt-2 m-0 text-sm leading-relaxed text-sub">{employerTagline}</p>
              <p className="mt-3 m-0">
                <Link
                  href={`/teen/employer/${task.employerId}`}
                  className="text-xs font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
                >
                  Открыть полную карточку компании →
                </Link>
              </p>
            </section>

            {task.minorComplianceStatus !== "passed" ? (
              <section className="ui-card border-edge">
                <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Ограничения 14–17</h2>
                <p className="m-0 mt-2 text-sm text-ink">
                  Статус: {MINOR_COMPLIANCE_STATUS_LABELS[task.minorComplianceStatus]}
                </p>
                {task.minorComplianceReasons.length > 0 ? (
                  <ul className="m-0 mt-2 list-disc pl-5 text-sm text-sub">
                    {task.minorComplianceReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}
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
          {applyBlockedHint ? (
            <p className="m-0 text-center text-xs leading-relaxed text-sub">{applyBlockedHint}</p>
          ) : null}
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
