import type { TaskCategory, UserRole } from "@/lib/constants";

/** Предпочтительный формат задач в профиле подростка (демо). */
export type TeenPreferredTaskFormat = "online" | "offline" | "any";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  city?: string;
}

export interface TeenProfile extends User {
  role: "teen";
  age?: number;
  xp: number;
  level: number;
  interests?: string[];
  preferredTaskFormat?: TeenPreferredTaskFormat;
  /** Демо: число завершённых задач для дашборда */
  completedTasksCount?: number;
  /** F0.6: пройден ли онбординг при первом входе. */
  onboarded?: boolean;
  /** F0.6/E9: коды мотивации («зачем зарабатываю»), assistant-friendly. */
  motivation?: string[];
  /** F0.6/E9: готов работать на выходных. */
  weekendAvailability?: boolean;
  /** F0.6/E9: личная цель заработка (перенесено из localStorage в Supabase). */
  earningGoal?: { title?: string; amount?: number };
  /** E9: домашний адрес для гео-фильтра задач. */
  homeAddress?: string;
  /** E9: координаты дома (заполняются геокодером). */
  homeLat?: number;
  homeLng?: number;
  /** E9: радиус поиска задач от дома, км. */
  searchRadiusKm?: number;
}

/** Тип заказчика в кабинете работодателя (демо). */
export type EmployerCustomerType = "legal_entity" | "sole_proprietor";

export interface EmployerProfile extends User {
  role: "employer";
  companyName: string;
  /** Демо: ИНН юрлица (10 цифр), из справочников, не редактируется в UI. */
  inn?: string;
  /** Демо: ИНН ИП (12 цифр), из справочников, не редактируется в UI. */
  innIp?: string;
  /** Демо: ОГРН юрлица (13 цифр), из справочников, не редактируется в UI. */
  ogrn?: string;
  /** Демо: ОГРНИП (15 цифр), из справочников, не редактируется в UI. */
  ogrnip?: string;
  verified?: boolean;
  customerType?: EmployerCustomerType;
  /** Категории задач, с которыми вы чаще работаете (демо). */
  taskCategories?: TaskCategory[];
  cabinetDescription?: string;
  cabinetTags?: string[];
  /** E5: рейтинг работодателя (0.0–5.0, numeric(2,1) из БД). */
  rating?: number;
  /** E5: число отзывов. */
  reviewsCount?: number;
}
