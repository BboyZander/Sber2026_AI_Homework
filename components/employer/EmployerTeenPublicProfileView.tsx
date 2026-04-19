"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { demoAchievements } from "@/data/demo-achievements";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Achievement } from "@/types/achievement";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import { getApplications, TEEN_APPLICATIONS_EVENT } from "@/lib/teen-flow";
import { teenInterestLabel } from "@/lib/teen-interest-labels";
import { TEEN_PREFERRED_FORMAT_LABELS } from "@/lib/teen-profile";
import { getPublicTeenProfile } from "@/lib/public-profiles";
import { PROFILE_STORAGE_KEYS } from "@/lib/profile-store";
import { PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-sync";
import type { TeenProfile } from "@/types/user";

function EmployerTeenAchievementBadges({ achievements }: { achievements: Achievement[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!openId) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target;
      if (t instanceof Node && listRef.current?.contains(t)) return;
      setOpenId(null);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [openId]);

  return (
    <ul ref={listRef} className="m-0 flex list-none flex-wrap gap-2 p-0">
      {achievements.map((a) => {
        const pinned = openId === a.id;
        return (
          <li key={a.id} className="group relative">
            <button
              type="button"
              aria-expanded={pinned}
              aria-controls={`ach-tip-${a.id}`}
              aria-label={`${a.title}. Подробнее — наведите или нажмите.`}
              onClick={() => setOpenId(pinned ? null : a.id)}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/25 via-accent/10 to-panel-muted text-2xl leading-none text-accent-bright shadow-md shadow-accent/10 outline-none transition hover:border-accent/60 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-accent-bright/55 active:scale-[0.97]"
            >
              <span aria-hidden className="select-none">
                {a.icon}
              </span>
            </button>
            <div
              id={`ach-tip-${a.id}`}
              role="tooltip"
              className={`absolute left-1/2 top-full z-40 mt-2 w-[min(18rem,calc(100vw-2rem)))] -translate-x-1/2 rounded-xl border border-edge-strong bg-panel px-3 py-2.5 text-left shadow-xl transition-[opacity,visibility] duration-150 ${
                pinned
                  ? "visible opacity-100"
                  : "invisible opacity-0 md:group-hover:visible md:group-hover:opacity-100"
              }`}
            >
              <p className="m-0 text-sm font-semibold text-ink">{a.title}</p>
              <p className="mt-1 m-0 text-xs leading-relaxed text-sub">{a.description}</p>
              <p className="mt-1.5 m-0 text-xs font-medium text-accent-bright">+{a.xpReward} XP</p>
              {a.unlockedAt ? (
                <p className="mt-1 m-0 text-[11px] text-sub-deep">
                  В демо: {new Date(a.unlockedAt).toLocaleDateString("ru-RU")}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function EmployerTeenPublicProfileView({ teenId }: { teenId: string }) {
  const [profile, setProfile] = useState<TeenProfile | null>(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  const refresh = useCallback(() => {
    const p = getPublicTeenProfile(teenId);
    setProfile(p);
    if (!p) return;
    const apps = getApplications(teenId);
    setCompletedTasksCount(computeTeenActivityStats(apps).completedTasksCount);
  }, [teenId]);

  useEffect(() => {
    refresh();
    const onApps = () => refresh();
    function onProfileUpdated(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (!d || (d.role === "teen" && d.userId === teenId)) refresh();
    }
    function onStorage(e: StorageEvent) {
      if (e.key === PROFILE_STORAGE_KEYS.teen) refresh();
    }
    window.addEventListener(TEEN_APPLICATIONS_EVENT, onApps);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, onApps);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh, teenId]);

  if (!profile) {
    return (
      <EmptyState
        emoji="🔍"
        title="Профиль не найден"
        description="Такого подростка нет в демо-справочнике."
        action={
          <Link href="/employer/tasks" className="ui-btn-primary no-underline hover:no-underline">
            К задачам
          </Link>
        }
      />
    );
  }

  const interests = profile.interests?.map(teenInterestLabel) ?? [];
  const formatLabel = profile.preferredTaskFormat
    ? TEEN_PREFERRED_FORMAT_LABELS[profile.preferredTaskFormat]
    : TEEN_PREFERRED_FORMAT_LABELS.any;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/employer/tasks"
        className="inline-block text-sm font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
      >
        ← К задачам
      </Link>

      <header className="ui-card mt-10 border-edge-strong">
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Подросток</p>
        <h1 className="mt-2 m-0 text-2xl font-bold leading-tight text-ink">{profile.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-lg border border-edge bg-panel-muted/60 px-2.5 py-1 text-xs font-medium text-sub">
            {profile.age != null ? `${profile.age} лет` : "Возраст не указан"}
          </span>
          <span className="rounded-lg border border-edge bg-panel-muted/60 px-2.5 py-1 text-xs font-medium text-sub">
            {profile.city ?? "Город не указан"}
          </span>
        </div>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        <section className="ui-card">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Интересы</h2>
          {interests.length > 0 ? (
            <ul className="mt-2 m-0 flex list-none flex-wrap gap-2 p-0">
              {interests.map((label) => (
                <li
                  key={label}
                  className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-bright"
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 m-0 text-sm text-sub">Интересы можно заполнить в профиле подростка.</p>
          )}
          <p className="mt-3 m-0 text-xs text-sub">Предпочтительный формат задач</p>
          <p className="mt-1 m-0 text-sm font-medium text-ink">{formatLabel}</p>
        </section>

        <section className="ui-card border-edge-strong">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Прогресс</h2>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Уровень</dt>
              <dd className="m-0 mt-1 text-lg font-semibold text-ink">{profile.level}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Опыт (XP)</dt>
              <dd className="m-0 mt-1 text-lg font-semibold text-ink">{profile.xp}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2 sm:col-span-1">
              <dt className="text-xs text-sub">Выполнено задач</dt>
              <dd className="m-0 mt-1 text-lg font-semibold text-ink">{completedTasksCount}</dd>
            </div>
          </dl>
        </section>

        <section className="ui-card">
          <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-sub">Достижения (демо)</h2>
          <p className="mt-1 m-0 text-xs text-sub-deep">
            Наведите курсор или нажмите на значок — кратко о награде.
          </p>
          <div className="mt-2">
            <EmployerTeenAchievementBadges achievements={demoAchievements} />
          </div>
        </section>
      </div>
    </div>
  );
}
