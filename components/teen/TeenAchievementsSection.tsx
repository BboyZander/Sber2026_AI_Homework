"use client";

import type { ComputedAchievement } from "@/lib/teen-achievements";

export function TeenAchievementsSection({ achievements }: { achievements: ComputedAchievement[] }) {
  return (
    <div className="flex flex-col divide-y divide-edge overflow-hidden rounded-2xl border border-edge">
      {achievements.map((ach) => (
        <div
          key={ach.id}
          className={`flex items-center gap-3 p-4 transition ${
            ach.unlocked
              ? "bg-panel-muted/30"
              : "bg-panel-muted/10 opacity-55"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
              ach.unlocked
                ? "bg-accent/15 ring-1 ring-accent/30"
                : "bg-panel-muted/60"
            }`}
          >
            {ach.icon}
          </div>

          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-semibold text-ink">{ach.title}</p>
            <p className="m-0 mt-0.5 text-xs leading-relaxed text-sub">{ach.description}</p>
            {ach.progress && !ach.unlocked ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full bg-accent/50 transition-all duration-500"
                    style={{ width: `${Math.round((ach.progress.current / ach.progress.max) * 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-sub">
                  {ach.progress.current} / {ach.progress.max}
                </span>
              </div>
            ) : null}
          </div>

          {ach.unlocked && ach.unlockedLabel ? (
            <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-bright">
              {ach.unlockedLabel}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
