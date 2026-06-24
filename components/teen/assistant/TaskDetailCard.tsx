"use client";

import Link from "next/link";
import type { AgentTaskDetail } from "@/lib/agent/contract";

export function TaskDetailCard({ detail }: { detail: AgentTaskDetail }) {
  const { task, description, whatToDo, completionCriteria, contactPerson, location } = detail;
  return (
    <div className="rounded-xl border border-edge-strong bg-panel p-3.5">
      <p className="m-0 text-sm font-semibold leading-snug text-ink">{task.title}</p>
      <p className="mt-1 text-sm font-medium text-ink">{task.paymentLabel}</p>

      <dl className="mt-2.5 grid grid-cols-2 gap-1.5">
        <div className="rounded-lg border border-edge bg-panel-muted/60 px-2 py-1.5">
          <dt className="text-[0.65rem] text-sub">Категория</dt>
          <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{task.categoryLabel}</dd>
        </div>
        <div className="rounded-lg border border-edge bg-panel-muted/60 px-2 py-1.5">
          <dt className="text-[0.65rem] text-sub">Формат</dt>
          <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{task.workFormatLabel}</dd>
        </div>
        <div className="rounded-lg border border-edge bg-panel-muted/60 px-2 py-1.5">
          <dt className="text-[0.65rem] text-sub">Длительность</dt>
          <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{task.durationLabel}</dd>
        </div>
        {location ? (
          <div className="rounded-lg border border-edge bg-panel-muted/60 px-2 py-1.5">
            <dt className="text-[0.65rem] text-sub">Адрес</dt>
            <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{location}</dd>
          </div>
        ) : null}
      </dl>

      {description ? <p className="mt-2.5 m-0 text-xs leading-relaxed text-sub">{description}</p> : null}

      {whatToDo ? (
        <div className="mt-2.5">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide text-sub">Что делать</p>
          <p className="mt-0.5 m-0 text-xs leading-relaxed text-ink">{whatToDo}</p>
        </div>
      ) : null}

      {completionCriteria ? (
        <div className="mt-2">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wide text-sub">Критерий выполнения</p>
          <p className="mt-0.5 m-0 text-xs leading-relaxed text-ink">{completionCriteria}</p>
        </div>
      ) : null}

      {contactPerson ? (
        <p className="mt-2 m-0 text-xs text-sub">По вопросам: {contactPerson}</p>
      ) : null}

      <Link
        href={`/teen/tasks/${task.id}`}
        className="mt-2.5 inline-block text-xs font-medium text-accent underline-offset-2 transition hover:text-accent-bright hover:underline"
      >
        Открыть задачу →
      </Link>
    </div>
  );
}
