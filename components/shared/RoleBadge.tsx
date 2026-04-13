import type { UserRole } from "@/lib/constants";

const labels: Record<UserRole, string> = {
  teen: "Подросток",
  employer: "Работодатель",
};

const tone: Record<UserRole, string> = {
  teen: "border-accent/35 bg-accent/15 text-accent-bright",
  employer: "border-accent-dark/35 bg-accent/12 text-accent-bright",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`ui-badge shrink-0 ${tone[role]}`}>{labels[role]}</span>
  );
}
