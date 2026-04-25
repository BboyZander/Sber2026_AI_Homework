export function StatCard({
  label,
  value,
  hint,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`ui-card group flex flex-col transition-all duration-300 hover:border-accent/30 hover:shadow-[var(--shadow-soft)] ${
        compact ? "px-2.5 py-3 text-center sm:px-4 sm:py-4 sm:text-left" : ""
      } ${
        accent ? "border-accent/25 bg-gradient-to-br from-accent/8 to-panel-muted/90" : ""
      }`}
    >
      <div className={`${compact ? "text-[0.58rem] leading-tight sm:text-[0.65rem]" : "text-[0.65rem]"} font-semibold uppercase tracking-wider text-sub`}>
        {label}
      </div>
      <div
        className={`${compact ? "mt-1 text-xl sm:text-2xl" : "mt-1 text-2xl"} font-extrabold tracking-tight tabular-nums transition-colors duration-200 ${
          accent ? "text-accent-bright" : "text-ink group-hover:text-ink"
        }`}
      >
        {value}
      </div>
      {hint ? (
        <div className={`${compact ? "mt-1 text-[0.6rem] sm:mt-1.5 sm:text-[0.68rem]" : "mt-1.5 text-[0.68rem]"} leading-snug text-sub-deep`}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
