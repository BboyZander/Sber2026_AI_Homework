export function EmptyState({
  title,
  description,
  action,
  emoji,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Короткий визуальный якорь (доступность: декоративный). */
  emoji?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-dashed border-edge-strong bg-panel-muted/65 px-5 py-11 text-center text-sub shadow-inner transition-colors duration-300 hover:border-accent/35 sm:px-8"
      role="status"
    >
      {emoji ? (
        <p className="m-0 mb-4 text-4xl leading-none" aria-hidden>
          {emoji}
        </p>
      ) : null}
      <p className="m-0 mb-2 font-semibold text-ink">{title}</p>
      {description ? <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed">{description}</p> : null}
      {action}
    </div>
  );
}
