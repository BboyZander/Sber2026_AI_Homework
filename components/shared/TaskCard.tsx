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

  return (
    <Link href={href} className="ui-card-interactive block text-inherit no-underline">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-base font-semibold leading-snug text-ink sm:text-lg">{task.title}</span>
        <StatusBadge kind="task" status={task.status} />
      </div>
      <p className="mt-2 text-sm text-sub">
        {WORK_FORMAT_LABELS[task.workFormat]} · {task.durationLabel} · {taskPaymentTeenPrimaryLine(task)} · +
        {task.rewardXp} XP
      </p>
      <p className="mt-1 text-xs text-sub">
        {task.employerName} · {CATEGORY_LABELS[task.category]}
        {ageLabel ? <> · {ageLabel}</> : null}
      </p>
      {task.deadline ? (
        <p className="mb-0 mt-1 text-xs text-sub">до {formatDate(task.deadline)}</p>
      ) : null}
    </Link>
  );
}
