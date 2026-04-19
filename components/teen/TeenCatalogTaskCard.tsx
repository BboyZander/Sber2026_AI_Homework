import type { ReactNode } from "react";
import Link from "next/link";
import type { Task } from "@/types/task";
import {
  CATEGORY_LABELS,
  WORK_FORMAT_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { formatTaskAgeRange } from "@/lib/task-age";
import { taskPaymentTeenEstimatedTotalLine, taskPaymentTeenPrimaryLine } from "@/lib/task-payment";

function MetaPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sky" | "emerald" }) {
  const tones = {
    neutral: "border-edge bg-panel-muted/50 text-sub",
    sky: "border-accent/30 bg-accent/10 text-accent-bright",
    emerald: "border-accent-dark/30 bg-accent/12 text-accent-bright",
  };
  return (
    <span
      className={`inline-flex min-h-[1.375rem] items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function TeenCatalogTaskCard({ task }: { task: Task }) {
  const ageLabel = formatTaskAgeRange(task);
  const payPrimary = taskPaymentTeenPrimaryLine(task);
  const payExtra = taskPaymentTeenEstimatedTotalLine(task);

  return (
    <article className="ui-card-interactive group flex flex-col text-inherit">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xs font-medium uppercase tracking-wider text-sub">Заказчик</span>
        <Link
          href={`/teen/employer/${task.employerId}`}
          className="text-sm font-semibold text-accent underline-offset-2 hover:text-accent-bright hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {task.employerName}
        </Link>
      </div>

      <Link href={`/teen/tasks/${task.id}`} className="block text-inherit no-underline">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug text-ink sm:text-lg">{task.title}</h3>
          <MetaPill tone="sky">{CATEGORY_LABELS[task.category]}</MetaPill>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ageLabel ? <MetaPill tone="neutral">{ageLabel}</MetaPill> : null}
          <MetaPill tone={task.workFormat === "online" ? "emerald" : "neutral"}>
            {WORK_FORMAT_LABELS[task.workFormat]}
          </MetaPill>
          <MetaPill>⏱ {task.durationLabel}</MetaPill>
          <MetaPill tone="sky">{payPrimary}</MetaPill>
          <MetaPill>+{task.rewardXp} XP</MetaPill>
        </div>
        {payExtra ? (
          <p className="m-0 mt-2 text-xs font-medium text-sub-deep">{payExtra}</p>
        ) : null}

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-sub transition-colors group-hover:text-sub">
          {task.description}
        </p>
      </Link>

      {task.location || task.deadline ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sub">
          {task.location ? <span className="text-sub-deep">{task.location}</span> : null}
          {task.location && task.deadline ? <span className="text-sub-deep">·</span> : null}
          {task.deadline ? (
            <span className="text-sub-deep">до {formatDate(task.deadline)}</span>
          ) : null}
        </div>
      ) : null}

      <Link
        href={`/teen/tasks/${task.id}`}
        className="mb-0 mt-3 text-xs font-medium text-accent/90 no-underline transition group-hover:text-accent-bright"
      >
        Открыть задачу →
      </Link>
    </article>
  );
}
