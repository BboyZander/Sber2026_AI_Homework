import type { EmployerProfile } from "@/types/user";
import { RoleBadge } from "@/components/shared/RoleBadge";

export function EmployerSummaryCard({ user }: { user: EmployerProfile }) {
  return (
    <div className="ui-card transition-all duration-300 hover:border-edge-strong hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 mb-1 text-xl font-bold text-ink">{user.companyName}</h1>
          <p className="m-0 text-sm text-sub">
            {user.name !== user.companyName ? user.name : user.city ?? ""}
          </p>
        </div>
        <RoleBadge role="employer" />
      </div>
      {user.verified ? (
        <p className="mb-0 mt-3 text-sm font-medium text-accent-bright">Профиль проверен</p>
      ) : null}
    </div>
  );
}
