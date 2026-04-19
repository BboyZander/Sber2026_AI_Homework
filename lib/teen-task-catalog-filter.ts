import {
  CATEGORY_LABELS,
  type DurationBucket,
  type TaskCategory,
  type WorkFormat,
} from "@/lib/constants";
import { taskAcceptsTeenAge } from "@/lib/task-age";
import { taskComparablePayRub } from "@/lib/task-payment";
import type { Task } from "@/types/task";

export type TeenCatalogPaySort = "none" | "high" | "low";
export type TeenCatalogAgeFit = "all" | "mine";

export type TeenCatalogFilterInput = {
  query: string;
  category: TaskCategory | null;
  workFormat: WorkFormat | "all";
  duration: DurationBucket | "all";
  paySort: TeenCatalogPaySort;
  ageFitMode: TeenCatalogAgeFit;
  teenAge?: number;
};

/** Та же логика, что раньше в useMemo каталога подростка. */
export function filterTeenCatalogTasks(tasks: Task[], f: TeenCatalogFilterInput): Task[] {
  const q = f.query.trim().toLowerCase();
  let list = tasks.filter((t) => {
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
  if (f.duration !== "all") list = list.filter((t) => t.durationBucket === f.duration);
  if (f.ageFitMode === "mine" && typeof f.teenAge === "number") {
    const ta = f.teenAge;
    list = list.filter((t) => taskAcceptsTeenAge(t, ta));
  }
    if (f.paySort === "high") {
      list = [...list].sort((a, b) => taskComparablePayRub(b) - taskComparablePayRub(a));
    } else if (f.paySort === "low") {
      list = [...list].sort((a, b) => taskComparablePayRub(a) - taskComparablePayRub(b));
    }
  return list;
}
