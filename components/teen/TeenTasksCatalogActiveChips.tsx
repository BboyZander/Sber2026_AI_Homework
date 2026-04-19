"use client";

export type ActiveChip = { id: string; label: string; onRemove: () => void };

export function TeenTasksCatalogActiveChips({ chips }: { chips: ActiveChip[] }) {
  if (!chips.length) return null;

  return (
    <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0" aria-label="Активные фильтры">
      {chips.map((c) => (
        <li key={c.id} className="m-0 p-0">
          <button
            type="button"
            onClick={c.onRemove}
            className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent/35 bg-accent/12 py-1 pl-3 pr-2 text-xs font-medium text-ink transition hover:border-accent/50 hover:bg-accent/18"
          >
            <span className="min-w-0 truncate">{c.label}</span>
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sub transition group-hover:bg-panel/80 group-hover:text-ink"
              aria-hidden
            >
              ×
            </span>
            <span className="sr-only">Снять фильтр {c.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
