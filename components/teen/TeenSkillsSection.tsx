"use client";

import type { Skill, SkillLevel } from "@/lib/teen-skills";

const LEVEL_BADGE: Record<SkillLevel, string> = {
  0: "rounded-full border border-edge bg-panel-muted/40 px-2.5 py-1 text-xs font-medium text-sub/60",
  1: "rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-bright/80",
  2: "rounded-full border border-accent/45 bg-accent/18 px-2.5 py-1 text-xs font-semibold text-accent-bright",
  3: "rounded-full border border-accent/55 bg-accent/25 px-2.5 py-1 text-xs font-bold text-accent-bright ring-1 ring-accent/30",
};

export function TeenSkillsSection({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
            skill.level === 0
              ? "border-edge bg-panel-muted/30 opacity-60"
              : "border-edge bg-panel-muted/50"
          }`}
        >
          <span className="shrink-0 text-xl">{skill.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium text-ink">{skill.label}</p>
            <p className="m-0 text-xs text-sub">{skill.countLabel}</p>
          </div>
          <span className={`shrink-0 ${LEVEL_BADGE[skill.level]}`}>{skill.levelLabel}</span>
        </div>
      ))}
    </div>
  );
}
