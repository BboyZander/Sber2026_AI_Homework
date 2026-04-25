"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Achievement } from "@/types/achievement";
import { formatDate } from "@/lib/helpers";

export function AchievementCard({ achievement, index = 0 }: { achievement: Achievement; index?: number }) {
  const reduceMotion = useReducedMotion();
  const locked = !achievement.unlockedAt;
  const delay = reduceMotion ? 0 : Math.min(index * 0.07, 0.42);

  return (
    <>
      <details
        className={`group rounded-2xl border shadow-lg shadow-black/15 transition open:col-span-3 sm:hidden ${
          locked
            ? "border-edge bg-panel-muted/75 opacity-[0.68] open:opacity-[0.9]"
            : "border-accent/28 bg-gradient-to-b from-accent/[0.12] via-panel-muted/55 to-panel"
        }`}
      >
        <summary className="flex min-h-24 cursor-pointer list-none flex-col items-center justify-center rounded-2xl p-2 text-center [&::-webkit-details-marker]:hidden">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-semibold ${
              locked ? "bg-panel-muted/50 text-sub" : "bg-accent/18 text-accent-bright ring-1 ring-accent/35"
            }`}
            aria-hidden
          >
            {achievement.icon}
          </span>
          <span className="mt-2 line-clamp-2 text-[0.7rem] font-semibold leading-tight text-ink">
            {achievement.title}
          </span>
        </summary>
        <div className="border-t border-edge px-3 pb-3 pt-2">
          <p className="m-0 text-xs leading-relaxed text-sub">{achievement.description}</p>
          <p className="m-0 mt-2 text-xs font-medium text-accent/90">
            +{achievement.xpReward} XP
            {achievement.unlockedAt ? ` · ${formatDate(achievement.unlockedAt)}` : " · скоро"}
          </p>
        </div>
      </details>

      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] as const }}
        className={`relative hidden overflow-hidden rounded-2xl border p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 sm:block ${
          locked
            ? "border-edge bg-panel-muted/75 opacity-[0.62] hover:border-edge-strong hover:opacity-[0.78]"
            : "border-accent/28 bg-gradient-to-b from-accent/[0.12] via-panel-muted/55 to-panel hover:border-accent/40 hover:shadow-accent-dark/15"
        }`}
      >
        {!locked ? (
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/18 blur-2xl"
            aria-hidden
          />
        ) : null}
        <div
          className={`relative mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-semibold ${
            locked ? "bg-panel-muted/50 text-sub" : "bg-accent/18 text-accent-bright ring-1 ring-accent/35"
          }`}
          aria-hidden
        >
          {achievement.icon}
        </div>
        <h3 className="relative m-0 font-semibold text-ink">{achievement.title}</h3>
        <p className="relative my-2 mb-0 text-sm leading-relaxed text-sub">{achievement.description}</p>
        <p className="relative mt-3 text-xs font-medium text-accent/90">
          +{achievement.xpReward} XP
          {achievement.unlockedAt ? ` · ${formatDate(achievement.unlockedAt)}` : " · скоро"}
        </p>
      </motion.article>
    </>
  );
}
