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
}
