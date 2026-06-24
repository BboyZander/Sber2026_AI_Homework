// Сборка минимально необходимого контекста о подростке для LLM (приватность):
// без email и точных координат — только то, что нужно для персонализации.
import "server-only";
import { teenInterestLabel } from "@/lib/teen-interest-labels";
import { teenMotivationLabel } from "@/lib/teen-motivation-labels";
import type { TeenProfile } from "@/types/user";

export type AgentTeenContext = {
  teenId: string;
  firstName: string;
  age?: number;
  city?: string;
  interests: string[];
  motivation: string[];
  earningGoalTitle?: string;
  earningGoalAmount?: number;
  preferredTaskFormat?: string;
  weekendAvailability?: boolean;
};

export function buildAgentTeenContext(teen: TeenProfile): AgentTeenContext {
  return {
    teenId: teen.id,
    firstName: teen.name?.split(" ")[0] ?? "Друг",
    age: teen.age,
    city: teen.city,
    interests: (teen.interests ?? []).map(teenInterestLabel),
    motivation: (teen.motivation ?? []).map(teenMotivationLabel),
    earningGoalTitle: teen.earningGoal?.title,
    earningGoalAmount: teen.earningGoal?.amount,
    preferredTaskFormat: teen.preferredTaskFormat,
    weekendAvailability: teen.weekendAvailability,
  };
}

/** Краткое текстовое summary контекста — вставляется в system prompt оркестратора. */
export function describeAgentTeenContext(ctx: AgentTeenContext): string {
  const lines: string[] = [`Имя: ${ctx.firstName}`];
  if (typeof ctx.age === "number") lines.push(`Возраст: ${ctx.age} лет`);
  if (ctx.city) lines.push(`Город: ${ctx.city}`);
  if (ctx.interests.length > 0) lines.push(`Интересы: ${ctx.interests.join(", ")}`);
  if (ctx.motivation.length > 0) lines.push(`Мотивация: ${ctx.motivation.join(", ")}`);
  if (ctx.earningGoalTitle || typeof ctx.earningGoalAmount === "number") {
    lines.push(
      `Цель заработка: ${ctx.earningGoalTitle ?? "не указана"}${
        typeof ctx.earningGoalAmount === "number" ? ` (${ctx.earningGoalAmount} ₽)` : ""
      }`,
    );
  }
  if (ctx.preferredTaskFormat && ctx.preferredTaskFormat !== "any") {
    lines.push(`Предпочитаемый формат: ${ctx.preferredTaskFormat === "online" ? "онлайн" : "офлайн"}`);
  }
  if (typeof ctx.weekendAvailability === "boolean") {
    lines.push(`Готов работать в выходные: ${ctx.weekendAvailability ? "да" : "нет"}`);
  }
  return lines.join("\n");
}
