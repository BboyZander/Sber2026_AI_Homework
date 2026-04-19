import type { ApplicationStatus, TaskStatus } from "@/lib/constants";
import { APPLICATION_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";

type Status = TaskStatus | ApplicationStatus;

const taskTone: Record<TaskStatus, string> = {
  draft: "border-sub-deep/30 bg-panel-muted/80 text-sub",
  published: "border-accent/35 bg-accent-soft text-accent-bright",
  closed: "border-rose-500/30 bg-rose-500/15 text-rose-300",
};

const appTone: Record<ApplicationStatus, string> = {
  sent: "border-accent/40 bg-accent-soft text-accent-bright",
  awaiting: "border-accent/35 bg-accent/10 text-accent-bright",
  rejected: "border-rose-500/45 bg-rose-500/15 text-rose-200",
  in_progress: "border-accent-dark/45 bg-accent/12 text-accent-bright",
  completed: "border-accent/45 bg-accent/18 text-ink",
  paid: "border-accent-dark/50 bg-accent/22 text-ink",
};

export function StatusBadge({
  kind,
  status,
}: {
  kind: "task" | "application";
  status: Status;
}) {
  const label =
    kind === "task"
      ? TASK_STATUS_LABELS[status as TaskStatus]
      : APPLICATION_STATUS_LABELS[status as ApplicationStatus];
  const toneClass =
    kind === "task"
      ? taskTone[status as TaskStatus]
      : appTone[status as ApplicationStatus];

  return (
    <span className={`ui-badge normal-case tracking-normal ${toneClass}`}>{label}</span>
  );
}
