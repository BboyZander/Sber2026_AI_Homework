import type { EmployerProfile, TeenProfile } from "@/types/user";

export type DemoAccount = (TeenProfile | EmployerProfile) & {
  login: string;
  password: string;
};

/** Только эти две учётки принимаются при входе (см. getDemoUserByCredentials). */
export const demoUsers: DemoAccount[] = [
  {
    id: "u1",
    role: "teen",
    login: "demo_teen",
    password: "demo123",
    email: "u1@demo.trajectory",
    name: "Артём",
    age: 16,
    city: "Москва",
    level: 2,
    xp: 140,
    completedTasksCount: 1,
    interests: ["digital", "events", "part-time"],
  },
  {
    id: "u2",
    role: "employer",
    login: "demo_employer",
    password: "demo123",
    email: "u2@demo.trajectory",
    name: "ООО Ивент Плюс",
    companyName: "ООО Ивент Плюс",
    city: "Москва",
  },
];

export function getDemoTeen(): TeenProfile {
  const u = demoUsers.find((x): x is DemoAccount & { role: "teen" } => x.role === "teen");
  if (!u) throw new Error("No demo teen user");
  const { password: _, login: __, ...rest } = u;
  return rest;
}

export function getDemoEmployer(): EmployerProfile {
  const u = demoUsers.find((x): x is DemoAccount & { role: "employer" } => x.role === "employer");
  if (!u) throw new Error("No demo employer user");
  const { password: _, login: __, ...rest } = u;
  return rest;
}
