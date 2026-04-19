import type { Task, TaskPaymentType } from "@/types/task";
import { formatRub } from "@/lib/helpers";

/** Сумма в ₽ для сортировки и кошелька: фикс = сумма задачи, почасовая = ставка × часы. */
export function taskComparablePayRub(task: Task): number {
  const pt: TaskPaymentType = task.paymentType ?? "fixed";
  const amt =
    typeof task.paymentAmount === "number" && Number.isFinite(task.paymentAmount)
      ? task.paymentAmount
      : task.payRub ?? 0;
  if (pt === "hourly") {
    const h = task.estimatedHours;
    if (typeof h === "number" && Number.isFinite(h) && h > 0) {
      return Math.round(amt * h);
    }
    return Math.round(task.payRub ?? amt);
  }
  return Math.round(amt);
}

/** Дополняет поля оплаты и выравнивает payRub под сравнение. */
export function withNormalizedTaskPayment<T extends Task>(task: T): T {
  const paymentType: TaskPaymentType = task.paymentType ?? "fixed";
  const paymentAmount =
    typeof task.paymentAmount === "number" && Number.isFinite(task.paymentAmount)
      ? task.paymentAmount
      : task.payRub ?? 0;
  let estimatedHours: number | undefined;
  if (paymentType === "hourly") {
    const h = task.estimatedHours;
    if (typeof h === "number" && Number.isFinite(h) && h > 0) {
      estimatedHours = h;
    }
  }
  const payRub = taskComparablePayRub({
    ...task,
    paymentType,
    paymentAmount,
    estimatedHours,
  });
  return {
    ...task,
    paymentType,
    paymentAmount,
    estimatedHours: paymentType === "hourly" ? estimatedHours : undefined,
    payRub,
  };
}

const rateFmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n));

/** Одна строка для списка работодателя: «Фикс · …» / «Почасовая · … ₽/час». */
export function taskPaymentEmployerSummary(task: Task): string {
  const t = withNormalizedTaskPayment(task);
  if (t.paymentType === "hourly") {
    return `Почасовая · ${rateFmt(t.paymentAmount)} ₽/час`;
  }
  return `Фикс · ${formatRub(t.paymentAmount)}`;
}

/** Главная строка оплаты в каталоге/карточке подростка. */
export function taskPaymentTeenPrimaryLine(task: Task): string {
  const t = withNormalizedTaskPayment(task);
  if (t.paymentType === "hourly") {
    return `${rateFmt(t.paymentAmount)} ₽/час`;
  }
  return `${formatRub(t.paymentAmount)} за задачу`;
}

export function taskPaymentTeenEstimatedTotalLine(task: Task): string | null {
  const t = withNormalizedTaskPayment(task);
  if (t.paymentType !== "hourly") return null;
  const h = t.estimatedHours;
  if (typeof h !== "number" || !Number.isFinite(h) || h <= 0) return null;
  const total = Math.round(t.paymentAmount * h);
  return `Ориентир ~${formatRub(total)} · ${rateFmt(h)} ч`;
}
