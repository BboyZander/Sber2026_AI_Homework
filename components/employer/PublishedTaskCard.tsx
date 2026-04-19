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
        <span className="text-base font-semibold leading-snug text-ink sm:text-lg">{task.title}</span>
        <StatusBadge kind="task" status={task.status} />
      </div>
      <p className="mb-0 mt-2 text-sm text-sub">
        {CATEGORY_LABELS[task.category]} · {WORK_FORMAT_LABELS[task.workFormat]} · {task.durationLabel}
        {ageLabel ? <> · {ageLabel}</> : null} · {taskPaymentEmployerSummary(task)} · +{task.rewardXp} XP
      </p>
    </Link>
  );
}
