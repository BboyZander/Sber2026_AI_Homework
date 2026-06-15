"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { CATEGORY_LABELS, type TaskCategory } from "@/lib/constants";
import { EMPLOYER_CUSTOMER_TYPE_LABELS } from "@/lib/employer-profile";
import { createClient } from "@/lib/supabase/client";
import type { EmployerCustomerType, EmployerProfile } from "@/types/user";

export function TeenEmployerPublicProfileView({ employerId }: { employerId: string }) {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: base } = await supabase
        .from("profiles")
        .select("name, email, city, role")
        .eq("id", employerId)
        .maybeSingle();
      if (!active) return;

      if (!base || base.role !== "employer") {
        setProfile(null);
        setReady(true);
        return;
      }

      const { data: emp } = await supabase
        .from("employer_profiles")
        .select("*")
        .eq("id", employerId)
        .maybeSingle();
      if (!active) return;

      const e = (emp ?? {}) as Record<string, unknown>;
      setProfile({
        id: employerId,
        email: (base.email as string) ?? "",
        name: base.name as string,
        role: "employer",
        city: (base.city as string) ?? undefined,
        companyName: (e.company_name as string) ?? (base.name as string),
        inn: (e.inn as string) ?? undefined,
        innIp: (e.inn_ip as string) ?? undefined,
        ogrn: (e.ogrn as string) ?? undefined,
        ogrnip: (e.ogrnip as string) ?? undefined,
        verified: (e.verified as boolean) ?? undefined,
        customerType: (e.customer_type as EmployerCustomerType) ?? undefined,
        taskCategories: (e.task_categories as TaskCategory[]) ?? undefined,
        cabinetDescription: (e.cabinet_description as string) ?? undefined,
        cabinetTags: (e.cabinet_tags as string[]) ?? undefined,
      });

      const { data: tasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("employer_id", employerId);
      if (!active) return;
      const rows = (tasks ?? []) as { status: string }[];
      setPublishedCount(rows.filter((t) => t.status === "open").length);
      setCompletedCount(rows.filter((t) => t.status === "completed").length);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [employerId]);

  if (!ready) return null;

  if (!profile) {
    return (
      <EmptyState
        emoji="🔍"
        title="Заказчик не найден"
        description="Такого профиля нет в демо-каталоге."
        action={
          <Link href="/teen/tasks" className="ui-btn-primary no-underline hover:no-underline">
            В каталог задач
          </Link>
        }
      />
    );
  }

  const name = profile.companyName || profile.name;
  const city = profile.city ?? "Не указан";
  const customerLabel = profile.customerType
    ? EMPLOYER_CUSTOMER_TYPE_LABELS[profile.customerType]
    : "Не указан";
  const description =
    profile.cabinetDescription?.trim() || "В демо описание можно добавить в кабинете работодателя.";
  const tags = profile.cabinetTags?.length ? profile.cabinetTags : [];
  const categories = profile.taskCategories?.length
    ? profile.taskCategories.map((c) => CATEGORY_LABELS[c])
    : [];

  const isIp = profile.customerType === "sole_proprietor";
  const innValue = isIp ? profile.innIp : profile.inn;
  const regValue = isIp ? profile.ogrnip : profile.ogrn;
  const regLabel = isIp ? "ОГРНИП" : "ОГРН";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/teen/dashboard"
        className="inline-block text-sm font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
      >
        ← К каталогу задач
      </Link>

      <header className="ui-card mt-10 border-edge-strong">
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Заказчик</p>
        <h1 className="mt-2 m-0 text-2xl font-bold leading-tight text-ink">{name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-lg border border-edge bg-panel-muted/60 px-2.5 py-1 text-xs font-medium text-sub">
            {city}
          </span>
          <span className="rounded-lg border border-edge bg-panel-muted/60 px-2.5 py-1 text-xs font-medium text-sub">
            {customerLabel}
          </span>
          {profile.verified ? (
            <span className="rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-bright">
              Проверенный заказчик
            </span>
          ) : (
            <span className="rounded-lg border border-edge bg-panel-muted/40 px-2.5 py-1 text-xs text-sub">
              Демо: отзывы и рейтинг не подключены
            </span>
          )}
        </div>
      </header>

      <div className="mt-3 flex flex-col gap-3">
      <section className="ui-card border-edge">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Реквизиты</h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-edge bg-panel px-3 py-2">
            <dt className="text-xs text-sub">ИНН</dt>
            <dd className="m-0 mt-1 font-mono text-sm font-medium tracking-wide text-ink">
              {innValue ?? "—"}
            </dd>
          </div>
          <div className="rounded-xl border border-edge bg-panel px-3 py-2">
            <dt className="text-xs text-sub">{regLabel}</dt>
            <dd className="m-0 mt-1 font-mono text-sm font-medium tracking-wide text-ink">
              {regValue ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="ui-card">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">О заказчике</h2>
        <p className="mt-2 m-0 text-sm leading-relaxed text-sub">{description}</p>
      </section>

      <section className="ui-card">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Направления и теги</h2>
        {categories.length > 0 ? (
          <ul className="mt-2 m-0 flex list-none flex-wrap gap-2 p-0">
            {categories.map((label) => (
              <li
                key={label}
                className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-bright"
              >
                {label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 m-0 text-sm text-sub">Категории задач можно указать в кабинете работодателя.</p>
        )}
        {tags.length > 0 ? (
          <ul className="mt-2 m-0 flex list-none flex-wrap gap-2 p-0">
            {tags.map((t) => (
              <li key={t} className="rounded-lg border border-edge bg-panel-muted/50 px-2.5 py-1 text-xs text-sub">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="ui-card border-edge-strong">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Активность</h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-edge bg-panel px-3 py-2">
            <dt className="text-xs text-sub">Открытых задач</dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-ink">{publishedCount}</dd>
          </div>
          <div className="rounded-xl border border-edge bg-panel px-3 py-2">
            <dt className="text-xs text-sub">Завершённых задач</dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-ink">{completedCount}</dd>
          </div>
        </dl>
      </section>
      </div>
    </div>
  );
}
