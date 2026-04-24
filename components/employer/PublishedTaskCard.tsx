import Link from "next/link";
import type { Task } from "@/types/task";
import { CATEGORY_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { formatTaskAgeRange } from "@/lib/task-age";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function PublishedTaskCard({ task }: { task: Task }) {
  const ageLabel = formatTaskAgeRange(task);

  return (
    <Link
      href={`/employer/tasks/${task.id}`}
      className="ui-card-interactive block text-inherit no-underline"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-base font-bold leading-snug text-ink sm:text-[1.05rem]">{task.title}</span>
        <StatusBadge kind="task" status={task.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sub">
        <span className="font-semibold text-ink">{taskPaymentEmployerSummary(task)}</span>
        <span className="text-sub-deep">·</span>
        <span>{CATEGORY_LABELS[task.category]}</span>
        <span className="text-sub-deep">·</span>
        <span>{WORK_FORMAT_LABELS[task.workFormat]}</span>
        <span className="text-sub-deep">·</span>
        <span>{task.durationLabel}</span>
        {ageLabel ? (
          <>
            <span className="text-sub-deep">·</span>
            <span>{ageLabel}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
