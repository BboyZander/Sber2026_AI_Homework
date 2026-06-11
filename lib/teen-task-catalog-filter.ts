import {
  CATEGORY_LABELS,
  type TaskCategory,
  type TaskPaymentTypeFilter,
  type WorkFormat,
} from "@/lib/constants";
import { taskAcceptsTeenAge } from "@/lib/task-age";
import { taskComparablePayRub } from "@/lib/task-payment";
import type { Task } from "@/types/task";

/** Сортировка отдельно от фильтров (F2.5): рекомендуемые / по оплате / по дате. */
export type TeenCatalogSort = "recommended" | "pay_high" | "pay_low" | "new" | "soonest";
export type TeenCatalogAgeFit = "all" | "mine";
export type TeenCatalogPaymentFilter = "all" | TaskPaymentTypeFilter;
/** День недели задачи (F2.1): будни / выходные — выводится из startDateTime задачи. */
export type TeenCatalogWeekday = "all" | "weekday" | "weekend";
/** График задачи (F2.6): время задано точно / гибкий график — успеть к сроку. */
export type TeenCatalogSchedule = "all" | "fixed" | "flexible";

export type TeenCatalogFilterInput = {
  query: string;
  category: TaskCategory | null;
  workFormat: WorkFormat | "all";
  /** Свободный фильтр длительности (F2.3): «до скольких часов ищу подработку»; null — без ограничения. */
  maxDurationHours: number | null;
  paymentType: TeenCatalogPaymentFilter;
  weekday: TeenCatalogWeekday;
  schedule: TeenCatalogSchedule;
  sort: TeenCatalogSort;
  ageFitMode: TeenCatalogAgeFit;
  teenAge?: number;
  /** Фильтр «Избранное» (E8): если задан, оставляем только задачи из набора. */
  favoriteTaskIds?: Set<string>;
};

/** Та же логика, что раньше в useMemo каталога подростка. */
export function filterTeenCatalogTasks(tasks: Task[], f: TeenCatalogFilterInput): Task[] {
  const q = f.query.trim().toLowerCase();
  let list = tasks;
  list = list.filter((t) => {
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.employerName.toLowerCase().includes(q) ||
      CATEGORY_LABELS[t.category].toLowerCase().includes(q)
    );
  });
  if (f.category) list = list.filter((t) => t.category === f.category);
  if (f.workFormat !== "all") list = list.filter((t) => t.workFormat === f.workFormat);
  if (typeof f.maxDurationHours === "number") {
    list = list.filter((t) => t.durationHours <= f.maxDurationHours!);
  }
  if (f.paymentType !== "all") {
    list = list.filter((t) => (t.paymentType ?? "fixed") === f.paymentType);
  }
  if (f.weekday !== "all") {
    list = list.filter((t) => {
      const day = new Date(t.startDateTime).getDay();
      const isWeekend = day === 0 || day === 6;
      return f.weekday === "weekend" ? isWeekend : !isWeekend;
    });
  }
  if (f.schedule !== "all") {
    list = list.filter((t) => (f.schedule === "fixed" ? t.hasFixedSchedule : !t.hasFixedSchedule));
  }
  if (f.favoriteTaskIds) {
    const favorites = f.favoriteTaskIds;
    list = list.filter((t) => favorites.has(t.id));
  }
  if (f.ageFitMode === "mine" && typeof f.teenAge === "number") {
    const ta = f.teenAge;
    list = list.filter(
      (t) => taskAcceptsTeenAge(t, ta) && t.minorComplianceStatus !== "blocked",
    );
  }
  if (f.sort === "pay_high") {
    list = [...list].sort((a, b) => taskComparablePayRub(b) - taskComparablePayRub(a));
  } else if (f.sort === "pay_low") {
    list = [...list].sort((a, b) => taskComparablePayRub(a) - taskComparablePayRub(b));
  } else if (f.sort === "new") {
    list = [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } else if (f.sort === "soonest") {
    list = [...list].sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime));
  }
  return list;
}
