/** Короткие подписи для карточки работодателя на экране задачи (демо). */
export const EMPLOYER_SNIPPETS: Record<string, string> = {
  u2: "Организуем промо и городские события. Обычно отвечаем на отклики за 1–2 дня.",
};

export function employerSnippet(employerId: string): string {
  return EMPLOYER_SNIPPETS[employerId] ?? "Локальный работодатель в Траектории.";
}
