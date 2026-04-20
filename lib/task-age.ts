import type { Task } from "@/types/task";

/** Подпись диапазона для UI или `null`, если в задаче не заданы оба поля. */
export function formatTaskAgeRange(task: Task): string | null {
  const { minAge, maxAge } = task;
  if (
    typeof minAge !== "number" ||
    typeof maxAge !== "number" ||
    !Number.isFinite(minAge) ||
    !Number.isFinite(maxAge)
  ) {
    return null;
  }
  return `${minAge}–${maxAge} лет`;
}

/**
 * Попадает ли возраст подростка в диапазон задачи.
 * Если диапазон не задан — задача не ограничивает возраст (показываем в «подходит»).
 */
export function taskAcceptsTeenAge(task: Task, teenAge: number): boolean {
  const { minAge, maxAge } = task;
  if (
    typeof minAge !== "number" ||
    typeof maxAge !== "number" ||
    !Number.isFinite(minAge) ||
    !Number.isFinite(maxAge)
  ) {
    return true;
  }
  return teenAge >= minAge && teenAge <= maxAge;
}

/** Заданы ли в задаче оба порога возраста (тогда отклик без возраста в профиле недоступен). */
export function taskHasDefinedAgeRange(task: Task): boolean {
  const { minAge, maxAge } = task;
  return (
    typeof minAge === "number" &&
    typeof maxAge === "number" &&
    Number.isFinite(minAge) &&
    Number.isFinite(maxAge)
  );
}

/**
 * Можно ли откликнуться с точки зрения возраста: без диапазона в задаче — да;
 * с диапазоном — только при известном возрасте в пределах min–max.
 */
export function teenCanRespondByAge(task: Task, teenAge: number | undefined): boolean {
  if (!taskHasDefinedAgeRange(task)) return true;
  if (typeof teenAge !== "number" || !Number.isFinite(teenAge)) return false;
  return taskAcceptsTeenAge(task, teenAge);
}
