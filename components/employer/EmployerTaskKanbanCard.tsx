"use client";

import { CATEGORY_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import type { Task } from "@/types/task";

type Props = {
  task: Task;
  selected: boolean;
  applicantCount: number;
  onClick: () => void;
};

function pluralApps(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} отклик`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} отклика`;
  return `${n} откликов`;
}

export function EmployerTaskKanbanCard({ task, selected, applicantCount, onClick }: Props) {
  const now = Date.now();
  const deadlineMs = task.deadline ? new Date(task.deadline).getTime() : null;
  const isUrgent = deadlineMs !== null && deadlineMs > now && deadlineMs - now < 3 * 24 * 3600 * 1000;
  const isOverdue = deadlineMs !== null && deadlineMs < now && task.status !== "completed";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-accent/50 bg-accent-soft ring-1 ring-accent/30"
          : "border-edge bg-panel hover:border-accent/25 hover:bg-panel-muted/60"
      }`}
    >
      {/* Title */}
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{task.title}</p>

      {/* Pay */}
      <p className="mt-1 text-xs font-medium text-ink">{taskPaymentEmployerSummary(task)}</p>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-panel-muted px-1.5 py-0.5 text-[0.65rem] text-sub">
          {CATEGORY_LABELS[task.category]}
        </span>
        <span className="text-[0.65rem] text-sub">{WORK_FORMAT_LABELS[task.workFormat]}</span>
      </div>

      {/* Badges row */}
      {(applicantCount > 0 || isUrgent || isOverdue || task.deadline) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {applicantCount > 0 && (
            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-accent-bright">
              {pluralApps(applicantCount)}
            </span>
          )}
          {isOverdue && (
            <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[0.65rem] font-semibold text-rose-300">
              Просрочено
            </span>
          )}
          {isUrgent && !isOverdue && (
            <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-300">
              До {formatDate(task.deadline!)}
            </span>
          )}
          {task.deadline && !isUrgent && !isOverdue && task.status !== "completed" && (
            <span className="text-[0.65rem] text-sub">до {formatDate(task.deadline)}</span>
          )}
        </div>
      )}
    </button>
  );
}
