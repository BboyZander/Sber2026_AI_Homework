import Link from "next/link";
import type { Task } from "@/types/task";
import { CATEGORY_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { formatTaskAgeRange } from "@/lib/task-age";
import { taskPaymentTeenPrimaryLine } from "@/lib/task-payment";
import { StatusBadge } from "./StatusBadge";

export function TaskCard({
  task,
  href,
}: {
  task: Task;
  href: string;
}) {
  const ageLabel = formatTaskAgeRange(task);
  const pay = taskPaymentTeenPrimaryLine(task);

  return (
    <Link href={href} className="ui-card-interactive block text-inherit no-underline">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-base font-bold leading-snug text-ink sm:text-[1.05rem]">{task.title}</span>
        <StatusBadge kind="task" status={task.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sub">
        <span className="font-semibold text-ink">{pay}</span>
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

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-sub-deep">
        <span>{task.employerName}</span>
        <span>·</span>
        <span>{CATEGORY_LABELS[task.category]}</span>
        {task.deadline ? (
          <>
            <span>·</span>
            <span>до {formatDate(task.deadline)}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
