export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <h2 className="m-0 text-base font-semibold tracking-tight text-ink md:text-lg">{title}</h2>
      {action ? <div className="shrink-0 transition-opacity duration-200 [&_a]:text-sm">{action}</div> : null}
    </div>
  );
}
