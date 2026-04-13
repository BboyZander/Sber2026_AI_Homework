"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatXp } from "@/lib/helpers";

export function XPProgress({
  currentXp,
  nextLevelXp,
}: {
  currentXp: number;
  nextLevelXp: number;
}) {
  const reduceMotion = useReducedMotion();
  const pct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className="ui-card">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-xs sm:text-sm">
        <span className="font-medium text-sub">До следующего уровня</span>
        <span className="font-mono text-ink">
          {formatXp(currentXp)} / {formatXp(nextLevelXp)} XP
        </span>
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
    </div>
  );
}
