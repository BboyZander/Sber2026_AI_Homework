export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`ui-card group flex flex-col transition-all duration-300 hover:border-accent/30 hover:shadow-[var(--shadow-soft)] ${
        accent ? "border-accent/25 bg-gradient-to-br from-accent/8 to-panel-muted/90" : ""
      }`}
    >
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-sub">{label}</div>
      <div
        className={`mt-1 text-2xl font-extrabold tracking-tight tabular-nums transition-colors duration-200 ${
          accent ? "text-accent-bright" : "text-ink group-hover:text-ink"
        }`}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1.5 text-[0.68rem] leading-snug text-sub-deep">{hint}</div>
      ) : null}
    </div>
  );
}
