export function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ui-card relative overflow-hidden border-edge bg-panel-muted/85">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/12 blur-2xl"
        aria-hidden
      />
      <p className="relative m-0 text-[0.7rem] font-semibold uppercase tracking-wider text-sub">{label}</p>
      <p className="relative mt-2 m-0 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {sub ? <p className="relative mt-1 m-0 text-xs text-sub">{sub}</p> : null}
    </div>
  );
}
