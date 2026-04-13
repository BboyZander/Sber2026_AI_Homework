/** Плейсхолдеры загрузки — единый стиль pulse по продукту. */

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-panel-muted/75 ${className}`} />;
}

export function TeenCatalogSkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <ul
      className="m-0 flex list-none flex-col gap-4 p-0"
      aria-busy="true"
      aria-label="Загрузка задач"
    >
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="ui-card space-y-3 border-edge">
          <SkeletonLine className="h-4 w-[58%]" />
          <SkeletonLine className="h-3 w-full max-w-lg" />
          <div className="flex flex-wrap gap-2 pt-1">
            <SkeletonLine className="h-6 w-14 rounded-full" />
            <SkeletonLine className="h-6 w-24 rounded-full" />
            <SkeletonLine className="h-5 w-[4.5rem] rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EmployerTaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul
      className="m-0 flex list-none flex-col gap-3 p-0"
      aria-busy="true"
      aria-label="Загрузка списка задач"
    >
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="ui-card space-y-2 border-edge">
          <SkeletonLine className="h-4 w-[48%]" />
          <SkeletonLine className="h-3 w-[92%]" />
        </li>
      ))}
    </ul>
  );
}
