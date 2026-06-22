/** Подписи к кодам мотивации подростка (онбординг F0.6 / E9). */
export const TEEN_MOTIVATION_LABELS: Record<string, string> = {
  goal: "Накопить на свою цель",
  pocket: "Карманные деньги",
  experience: "Опыт и навыки",
  family: "Помочь семье",
  free_time: "Занять свободное время",
  people: "Новые знакомства",
};

export function teenMotivationLabel(code: string): string {
  return TEEN_MOTIVATION_LABELS[code] ?? code;
}

export function getTeenMotivationCodes(): string[] {
  return Object.keys(TEEN_MOTIVATION_LABELS);
}
