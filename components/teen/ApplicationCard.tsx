import Link from "next/link";
import type { Application } from "@/types/application";
import type { Task } from "@/types/task";
import { APPLICATION_STATUS_HINTS } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import { taskPaymentTeenPrimaryLine } from "@/lib/task-payment";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ApplicationCard({
  application,
  task,
  showWithdraw,
  onWithdraw,
}: {
  application: Application;
  task: Task | undefined;
  showWithdraw?: boolean;
  onWithdraw?: () => void;
}) {
  const hint = APPLICATION_STATUS_HINTS[application.status];

  return (
    <div className="ui-card transition-all duration-300 hover:border-edge-strong hover:shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/teen/tasks/${application.taskId}`}
            className="font-semibold text-ink underline-offset-2 transition-colors hover:text-accent-bright hover:underline"
          >
            {task?.title ?? `Задача ${application.taskId}`}
          </Link>
          <p className="mt-1 text-xs text-sub">Отправлено {formatDate(application.createdAt)}</p>
        </div>
        <StatusBadge kind="application" status={application.status} />
      </div>
      <p className="mb-0 mt-3 text-sm leading-relaxed text-sub">{hint}</p>
      {application.message ? (
        <p className="mb-0 mt-2 border-t border-edge/80 pt-2 text-sm text-sub">
          «{application.message}»
        </p>
      ) : null}
      {task ? (
        <p className="mb-0 mt-2 text-xs text-sub-deep">
          <Link
            href={`/teen/employer/${task.employerId}`}
            className="font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
          >
            {task.employerName}
          </Link>
          {` · ${taskPaymentTeenPrimaryLine(task)}`}
        </p>
      ) : null}
      {showWithdraw && onWithdraw ? (
        <div className="mt-4 border-t border-edge/80 pt-3">
          <button
            type="button"
            onClick={onWithdraw}
            className="text-sm font-medium text-rose-300/90 underline-offset-2 transition hover:text-rose-200 hover:underline"
          >
            Отозвать отклик
          </button>
          <p className="mt-1.5 m-0 text-xs text-sub-deep">
            Пока статус «Отклик отправлен» или «Отклик отклонён», отклик можно снять из списка. В остальных
            случаях — только через работодателя.
          </p>
        </div>
      ) : null}
    </div>
  );
}
