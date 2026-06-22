/** E5: компактный рейтинг работодателя. Принимает rating и опционально count отзывов. */
export function StarRating({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count?: number;
  compact?: boolean;
}) {
  const label = rating.toFixed(1);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
      <span aria-hidden="true">★</span>
      <span className="text-ink">{label}</span>
      {!compact && count != null ? (
        <span className="text-sub">· {count.toLocaleString("ru-RU")} отзывов</span>
      ) : null}
    </span>
  );
}
