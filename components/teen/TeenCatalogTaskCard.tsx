"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Task } from "@/types/task";
import {
  CATEGORY_LABELS,
  MINOR_COMPLIANCE_STATUS_LABELS,
  WORK_FORMAT_LABELS,
  type ApplicationStatus,
} from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { formatTaskAgeRange } from "@/lib/task-age";
import { taskPaymentTeenEstimatedTotalLine, taskPaymentTeenPrimaryLine } from "@/lib/task-payment";
import { StarRating } from "@/components/shared/StarRating";
import {
  TEEN_APPLICATIONS_EVENT,
  getApplicationForTaskCached,
} from "@/lib/teen-applications-client";
import { TEEN_FAVORITES_EVENT, isFavoriteCached, toggleFavorite } from "@/lib/teen-favorites-client";
import { StatusBadge } from "@/components/shared/StatusBadge";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
    >
      <path d="M9.653 16.682a.75.75 0 00.694 0c.243-.127.622-.332 1.073-.606.901-.548 2.103-1.368 3.296-2.42C16.95 11.93 19 9.658 19 7.25 19 5.026 17.227 3.25 15 3.25c-1.36 0-2.563.671-3.293 1.7l-.707.997-.707-.997c-.73-1.029-1.933-1.7-3.293-1.7C4.773 3.25 3 5.026 3 7.25c0 2.408 2.05 4.68 4.284 6.406 1.193 1.052 2.395 1.872 3.296 2.42.451.274.83.479 1.073.606z" />
    </svg>
  );
}

function MetaPill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "sky" | "emerald";
  className?: string;
}) {
  const tones = {
    neutral: "border-edge bg-panel-muted/50 text-sub",
    sky: "border-accent/30 bg-accent/10 text-accent-bright",
    emerald: "border-accent-dark/30 bg-accent/12 text-accent-bright",
  };
  return (
    <span
      className={`inline-flex min-h-[1.375rem] items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Маркетплейс-карточка вакансии (формат Ozon/WB): растягивается на всю высоту
 * ячейки сетки, цена вынесена крупно, ключевые бейджи — компактным рядом.
 */
export function TeenCatalogTaskCard({ task }: { task: Task }) {
  const ageLabel = formatTaskAgeRange(task);
  const payPrimary = taskPaymentTeenPrimaryLine(task);
  const payExtra = taskPaymentTeenEstimatedTotalLine(task);

  const [appliedStatus, setAppliedStatus] = useState<ApplicationStatus | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    function sync() {
      setAppliedStatus(getApplicationForTaskCached(task.id)?.status ?? null);
    }
    sync();
    window.addEventListener(TEEN_APPLICATIONS_EVENT, sync);
    return () => window.removeEventListener(TEEN_APPLICATIONS_EVENT, sync);
  }, [task.id]);

  useEffect(() => {
    function sync() {
      setIsFavorite(isFavoriteCached(task.id));
    }
    sync();
    window.addEventListener(TEEN_FAVORITES_EVENT, sync);
    return () => window.removeEventListener(TEEN_FAVORITES_EVENT, sync);
  }, [task.id]);

  function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    void toggleFavorite(task.id);
  }

  return (
    <article className="ui-card-interactive group flex h-full min-w-0 flex-col p-3 text-inherit sm:p-5">
      {/* Категория + формат (на мобильном — только категория, чтобы не дробить ряд) */}
      <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
        <MetaPill tone="sky">{CATEGORY_LABELS[task.category]}</MetaPill>
        <div className="flex items-center gap-1.5">
          {appliedStatus ? (
            <StatusBadge kind="application" status={appliedStatus} />
          ) : (
            <MetaPill tone={task.workFormat === "online" ? "emerald" : "neutral"} className="hidden sm:inline-flex">
              {WORK_FORMAT_LABELS[task.workFormat]}
            </MetaPill>
          )}
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            aria-pressed={isFavorite}
            className={`flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-lg border transition active:scale-90 ${
              isFavorite
                ? "border-rose-400/40 bg-rose-400/10 text-rose-400"
                : "border-edge bg-panel-muted/50 text-sub-deep hover:text-rose-400"
            }`}
          >
            <HeartIcon filled={isFavorite} />
          </button>
        </div>
      </div>

      {/* Заголовок + заказчик */}
      <Link href={`/teen/tasks/${task.id}`} className="block text-inherit no-underline">
        <h3 className="line-clamp-2 min-h-[2.2rem] text-sm font-semibold leading-snug text-ink sm:min-h-[2.6rem] sm:text-base">
          {task.title}
        </h3>
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <Link
          href={`/teen/employer/${task.employerId}`}
          className="line-clamp-1 text-xs font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
        >
          {task.employerName}
        </Link>
        {task.employerRating != null ? (
          <StarRating rating={task.employerRating} compact />
        ) : null}
      </div>

      {/* Цена крупно */}
      <Link href={`/teen/tasks/${task.id}`} className="mt-2 block text-inherit no-underline sm:mt-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-bold leading-none text-accent-bright sm:text-xl">{payPrimary}</span>
          <span className="text-xs font-medium text-sub-deep">+{task.rewardXp} XP</span>
        </div>
        {payExtra ? <p className="m-0 mt-1 hidden text-xs font-medium text-sub-deep sm:block">{payExtra}</p> : null}
      </Link>

      {/* Бейджи (на мобильном — только длительность, остальное скрываем ради компактности) */}
      <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
        <MetaPill>⏱ {task.durationLabel}</MetaPill>
        {!task.hasFixedSchedule ? (
          <MetaPill tone="emerald" className="hidden sm:inline-flex">🕊 Гибкий график</MetaPill>
        ) : null}
        {ageLabel ? <MetaPill tone="neutral" className="hidden sm:inline-flex">{ageLabel}</MetaPill> : null}
        {task.minorComplianceStatus === "warning" ? (
          <MetaPill tone="neutral" className="hidden sm:inline-flex">{MINOR_COMPLIANCE_STATUS_LABELS.warning}</MetaPill>
        ) : null}
      </div>

      {/* Короткое описание — скрыто на мобильном, чтобы карточка оставалась компактной в 2 колонки */}
      <Link href={`/teen/tasks/${task.id}`} className="hidden text-inherit no-underline sm:block">
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sub">{task.description}</p>
      </Link>

      {/* Низ карточки: локация/срок (только на широких экранах) + переход */}
      <div className="mt-auto pt-2 sm:pt-3">
        {task.location || task.deadline ? (
          <div className="hidden flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sub-deep sm:flex">
            {task.location ? <span>{task.location}</span> : null}
            {task.location && task.deadline ? <span>·</span> : null}
            {task.deadline ? <span>до {formatDate(task.deadline)}</span> : null}
          </div>
        ) : null}
        <Link
          href={`/teen/tasks/${task.id}`}
          className="mt-1 inline-block text-xs font-medium text-accent/90 no-underline transition group-hover:text-accent-bright sm:mt-2"
        >
          Открыть вакансию →
        </Link>
      </div>
    </article>
  );
}
