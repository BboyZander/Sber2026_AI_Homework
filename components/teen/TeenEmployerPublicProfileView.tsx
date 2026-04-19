"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { CATEGORY_LABELS } from "@/lib/constants";
import {
  EMPLOYER_TASKS_EVENT,
  getEmployerTaskViewStatus,
  getEmployerTasks,
} from "@/lib/employer-flow";
import { EMPLOYER_CUSTOMER_TYPE_LABELS } from "@/lib/employer-profile";
import { getPublicEmployerProfile } from "@/lib/public-profiles";
import { PROFILE_STORAGE_KEYS } from "@/lib/profile-store";
import { PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-sync";
import type { EmployerProfile } from "@/types/user";

export function TeenEmployerPublicProfileView({ employerId }: { employerId: string }) {
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const refresh = useCallback(() => {
    const p = getPublicEmployerProfile(employerId);
    setProfile(p);
    if (!p) return;
    const tasks = getEmployerTasks(employerId);
    setPublishedCount(tasks.filter((t) => t.status === "published").length);
    setCompletedCount(tasks.filter((t) => getEmployerTaskViewStatus(t) === "completed").length);
  }, [employerId]);

  useEffect(() => {
    refresh();
    function onProfileUpdated(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!d || (d.role === "employer" && d.userId === employerId)) refresh();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === PROFILE_STORAGE_KEYS.employer) refresh();
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    window.addEventListener(EMPLOYER_TASKS_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
      window.removeEventListener(EMPLOYER_TASKS_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh, employerId]);

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
        href="/teen/tasks"
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
        <p className="mt-2 m-0 text-xs leading-relaxed text-sub-deep">
          Данные из демо-справочника; в продукте проверяются по ЕГРЮЛ / ЕГРИП.
        </p>
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
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Активность в демо</h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-edge bg-panel px-3 py-2">
            <dt className="text-xs text-sub">Опубликовано задач</dt>
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
