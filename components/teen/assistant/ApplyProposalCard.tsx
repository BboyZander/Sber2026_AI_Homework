"use client";

import { useState } from "react";
import { confirmAgentApplyProposal } from "@/lib/agent-client";
import type { AgentApplyProposal } from "@/lib/agent/contract";

export function ApplyProposalCard({ proposal }: { proposal: AgentApplyProposal }) {
  const { task, allowed, blockReason } = proposal;
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleApply() {
    setState("sending");
    const ok = await confirmAgentApplyProposal(task.id);
    setState(ok ? "sent" : "idle");
  }

  return (
    <div className="rounded-xl border border-edge bg-panel p-3">
      <p className="m-0 text-sm font-semibold leading-snug text-ink">{task.title}</p>
      <p className="mt-1 text-xs font-medium text-ink">{task.paymentLabel}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-panel-muted px-1.5 py-0.5 text-[0.65rem] text-sub">
          {task.categoryLabel}
        </span>
        <span className="text-[0.65rem] text-sub">{task.workFormatLabel}</span>
      </div>

      {!allowed ? (
        <p className="mt-2 m-0 text-xs font-medium text-rose-300">
          {blockReason ?? "Недоступно для отклика"}
        </p>
      ) : state === "sent" ? (
        <p className="mt-2 m-0 text-xs font-medium text-emerald-400">Отклик отправлен ✓</p>
      ) : (
        <button
          type="button"
          onClick={handleApply}
          disabled={state === "sending"}
          className="ui-btn-primary mt-2 w-full justify-center px-3 py-2 text-xs disabled:opacity-60"
        >
          {state === "sending" ? "Отправляем…" : "Откликнуться"}
        </button>
      )}
    </div>
  );
}
