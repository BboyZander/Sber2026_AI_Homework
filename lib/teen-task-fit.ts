import { CATEGORY_LABELS, WORK_FORMAT_LABELS, type TaskCategory } from "@/lib/constants";
import { formatTaskAgeRange, taskAcceptsTeenAge, taskHasDefinedAgeRange } from "@/lib/task-age";
import type { Task } from "@/types/task";
import type { TeenProfile } from "@/types/user";

/** Причина «почему подходит тебе» (F3.2): эвристика на полях профиля и задачи. */
export interface TaskFitReason {
  id: string;
  icon: string;
  text: string;
}

/** Коды интересов подростка, которые напрямую соответствуют категории задачи. */
const INTEREST_TO_CATEGORY: Record<string, TaskCategory> = {
  events: "events",
  creative: "creative",
  delivery: "delivery",
  promo: "promo",
};

/**
 * 1–3 коротких причины, почему задача подходит подростку.
 * Эвристика (не LLM): сопоставляет уже существующие поля профиля и задачи.
 */
export function computeTaskFitReasons(task: Task, teen: TeenProfile, max = 3): TaskFitReason[] {
  const reasons: TaskFitReason[] = [];

  const fmt = teen.preferredTaskFormat;
  if (fmt && fmt !== "any" && fmt === task.workFormat) {
    reasons.push({
      id: "format",
      icon: "🎯",
      text: `Совпадает с твоим форматом — ${WORK_FORMAT_LABELS[task.workFormat]}`,
    });
  }

  const interestCategory = teen.interests?.find((code) => INTEREST_TO_CATEGORY[code] === task.category);
  if (interestCategory) {
    reasons.push({
      id: "interest",
      icon: "✨",
      text: `В твоих интересах: ${CATEGORY_LABELS[task.category]}`,
    });
  }

  if (
    taskHasDefinedAgeRange(task) &&
    typeof teen.age === "number" &&
    Number.isFinite(teen.age) &&
    taskAcceptsTeenAge(task, teen.age)
  ) {
    reasons.push({
      id: "age",
      icon: "✅",
      text: `Подходит по твоему возрасту (${formatTaskAgeRange(task)})`,
    });
  }

  if (task.minorComplianceStatus === "passed") {
    reasons.push({
      id: "compliance",
      icon: "🛡️",
      text: "Проверено по правилам для 14–17 лет",
    });
  }

  if (task.durationBucket === "short") {
    reasons.push({
      id: "duration",
      icon: "⏱️",
      text: "Короткая — успеешь за пару часов",
    });
  }

  return reasons.slice(0, max);
}
