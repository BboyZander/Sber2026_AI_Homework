import type { UserRole } from "@/lib/constants";

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
  /** Демо: число завершённых задач для дашборда */
  completedTasksCount?: number;
}

export interface EmployerProfile extends User {
  role: "employer";
  companyName: string;
  verified?: boolean;
}
