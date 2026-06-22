"use client";

import { motion, useReducedMotion } from "framer-motion";
import { computeTierProgress, formatTasksToNext } from "@/lib/teen-tier";

export function TierProgress({ completedCount }: { completedCount: number }) {
  const reduceMotion = useReducedMotion();
  const tier = computeTierProgress(completedCount);
  const pct = tier.progressPct;

  return (
    <div className="ui-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{tier.current.icon}</span>
          <div>
            <p className="m-0 text-base font-bold text-ink">{tier.current.label}</p>
            <p className="m-0 text-xs text-sub">{tier.current.description}</p>
          </div>
        </div>
        {tier.next ? (
          <div className="shrink-0 text-right">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">До «{tier.next.label}»</p>
            <p className="m-0 text-sm font-semibold text-ink">{formatTasksToNext(tier.tasksToNext)}</p>
          </div>
        ) : null}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-raised ring-1 ring-white/5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-dark shadow-sm shadow-accent/30"
          initial={reduceMotion ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }
          }
        />
      </div>
      <p className="m-0 mt-2 text-xs leading-relaxed text-sub">
        {tier.next
          ? "Завершай задачи — они формируют твой опыт и открывают доступ к более серьёзным предложениям."
          : "Ты достиг максимального статуса!"}
      </p>
    </div>
  );
}

/** @deprecated используй TierProgress */
export function XPProgress(_: { currentXp: number; nextLevelXp: number }) {
  return null;
}
