export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="m-0 flex items-center gap-2 text-base font-bold tracking-tight text-ink md:text-[1.05rem]">
        <span className="h-4 w-0.5 rounded-full bg-accent-bright" aria-hidden />
        {title}
      </h2>
      {action ? (
        <div className="shrink-0 transition-opacity duration-200 [&_a]:text-sm">{action}</div>
      ) : null}
    </div>
  );
}
