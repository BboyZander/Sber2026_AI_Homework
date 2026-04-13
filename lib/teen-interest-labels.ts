/** Подписи к кодам интересов подростка (демо-профиль). */
export const TEEN_INTEREST_LABELS: Record<string, string> = {
  digital: "Цифра и контент",
  events: "Ивенты и люди",
  "part-time": "Подработка рядом",
  creative: "Творческие задачи",
  delivery: "Доставка и логистика",
  promo: "Промо и активности",
};

export function teenInterestLabel(code: string): string {
  return TEEN_INTEREST_LABELS[code] ?? code;
}
