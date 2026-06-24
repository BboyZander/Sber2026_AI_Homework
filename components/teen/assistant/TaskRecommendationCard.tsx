"use client";

import Link from "next/link";
import type { AgentRecommendation } from "@/lib/agent/contract";

export function TaskRecommendationCard({ recommendation }: { recommendation: AgentRecommendation }) {
  const { task, reasons } = recommendation;
  return (
    <div className="rounded-xl border border-edge bg-panel p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="m-0 text-sm font-semibold leading-snug text-ink">{task.title}</p>
      </div>
      <p className="mt-1 text-xs font-medium text-ink">{task.paymentLabel}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-panel-muted px-1.5 py-0.5 text-[0.65rem] text-sub">
          {task.categoryLabel}
        </span>
        <span className="text-[0.65rem] text-sub">{task.workFormatLabel}</span>
        <span className="text-[0.65rem] text-sub">{task.durationLabel}</span>
      </div>
      {reasons.length > 0 && (
        <ul className="mt-2 m-0 flex list-none flex-col gap-1 p-0">
          {reasons.map((r) => (
            <li key={r.id} className="flex items-start gap-1.5 text-xs text-sub">
              <span aria-hidden>{r.icon}</span>
              <span>{r.text}</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/teen/tasks/${task.id}`}
        className="mt-2 inline-block text-xs font-medium text-accent underline-offset-2 transition hover:text-accent-bright hover:underline"
      >
        Открыть задачу →
      </Link>
    </div>
  );
}
