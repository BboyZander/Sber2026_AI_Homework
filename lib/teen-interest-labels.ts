/** Подписи к кодам интересов подростка (демо-профиль). */
export const TEEN_INTEREST_LABELS: Record<string, string> = {
  digital: "Цифра и контент",
  smm: "SMM и соцсети",
  events: "Ивенты и люди",
  "part-time": "Подработка рядом",
  creative: "Творческие задачи",
  delivery: "Доставка и логистика",
  promo: "Промо и активности",
  data: "Данные и таблицы",
  warehouse: "Склад и ПВЗ",
};

export function teenInterestLabel(code: string): string {
  return TEEN_INTEREST_LABELS[code] ?? code;
}
