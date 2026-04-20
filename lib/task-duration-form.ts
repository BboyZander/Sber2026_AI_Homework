import type { DurationBucket } from "@/lib/constants";

/** Берёт максимальное число из строки (например «2–3 ч» → 3). */
export function parseDurationHoursFromLabel(label: string): number {
  const t = label.trim();
  if (!t) return 0;
  const direct = Number(t.replace(",", "."));
  if (Number.isFinite(direct) && direct > 0) return direct;
  const matches = t.match(/(\d+(?:[.,]\d+)?)/g);
  if (!matches?.length) return 0;
  const nums = matches
    .map((m) => Number(m.replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return 0;
  return Math.max(...nums);
}

export function durationBucketFromHours(hours: number): DurationBucket {
  if (!Number.isFinite(hours) || hours <= 0) return "short";
  return hours <= 3 ? "short" : "long";
}

export function formatHoursAsDurationLabel(hoursStr: string): string {
  const n = Number(String(hoursStr).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${String(n).replace(".", ",")} ч`;
}

/** Убирает хвост «ч» / «час(а)» у числа, без дублирования проходов. */
function stripTrailingHourWord(s: string): string {
  let x = s.trim().replace(/\s+/g, " ");
  for (let i = 0; i < 4; i++) {
    const y = x
      .replace(/(\d)\s+час(?:а|ов)?\.?\s*$/i, "$1")
      .replace(/(\d)час(?:а|ов)?\.?\s*$/i, "$1")
      .replace(/(\d)\s+ч\.?\s*$/i, "$1")
      .replace(/(\d)ч\.?\s*$/i, "$1")
      .trim();
    if (y === x) break;
    x = y;
  }
  return x;
}

/**
 * Подпись для UI и превью: «2» → «2 ч», «2ч»/«2 ч» → «2 ч» без дублей;
 * для «2–3» / «2-3» → «2–3 ч». Если часов из строки не извлечь — возвращает trim как есть.
 */
export function normalizeDurationLabelDisplay(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const hours = parseDurationHoursFromLabel(trimmed);
  if (hours <= 0) return trimmed;

  const core = stripTrailingHourWord(trimmed);
  if (!core) {
    return `${String(hours).replace(".", ",")} ч`;
  }

  const unified = core.replace(/-/g, "–").replace(/\s+/g, " ").trim();
  return `${unified} ч`;
}
