export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="ui-card transition-all duration-300 hover:border-edge-strong hover:shadow-[var(--shadow-soft)]">
      <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-sub">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-ink">{value}</div>
      {hint ? <div className="mt-2 text-xs text-sub">{hint}</div> : null}
    </div>
  );
}
