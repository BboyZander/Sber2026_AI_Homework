export function EmptyState({
  title,
  description,
  action,
  emoji,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  emoji?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-dashed border-edge-strong bg-panel-muted/50 px-6 py-12 text-center text-sub transition-colors duration-300 hover:border-accent/30 sm:px-10"
      role="status"
    >
      {emoji ? (
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-edge bg-panel-muted/80 text-3xl shadow-sm"
          aria-hidden
        >
          {emoji}
        </div>
      ) : null}
      <p className="m-0 mb-1.5 font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-sub">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
