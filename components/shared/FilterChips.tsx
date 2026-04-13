"use client";

import { useState } from "react";
import type { TaskCategory } from "@/lib/constants";
import { CATEGORY_LABELS, TASK_CATEGORIES } from "@/lib/constants";

export function FilterChips({
  onChange,
}: {
  onChange?: (selected: TaskCategory | null) => void;
}) {
  const [active, setActive] = useState<TaskCategory | null>(null);

  function toggle(cat: TaskCategory) {
    const next = active === cat ? null : cat;
    setActive(next);
    onChange?.(next);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TASK_CATEGORIES.map((cat) => {
        const isOn = active === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out active:scale-95 ${
              isOn
                ? "border-accent/50 bg-accent/20 text-accent-bright shadow-sm shadow-accent/15"
                : "border-edge bg-panel-muted/85 text-sub hover:border-edge-strong hover:bg-raised/60 hover:text-ink"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
