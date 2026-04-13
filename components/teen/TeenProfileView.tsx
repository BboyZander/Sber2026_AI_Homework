"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Application } from "@/types/application";
import type { TeenProfile } from "@/types/user";
import { AchievementCard } from "@/components/teen/AchievementCard";
import { XPProgress } from "@/components/teen/XPProgress";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { demoAchievements } from "@/data/demo-achievements";
import { getDemoUserById, getMockSession } from "@/lib/auth";
import { nextLevelXpTarget } from "@/data/teen-dashboard";
import { formatDate, formatRub, formatXp } from "@/lib/helpers";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import { getTaskByIdForFlow } from "@/lib/employer-flow";
import { TEEN_APPLICATIONS_EVENT, getApplications } from "@/lib/teen-flow";
import { buildTeenProfileHint } from "@/lib/teen-profile-hint";
import { teenInterestLabel } from "@/lib/teen-interest-labels";

function resolveSessionTeen(fallback: TeenProfile): TeenProfile {
  if (typeof window === "undefined") return fallback;
  const s = getMockSession();
  if (s?.role !== "teen") return fallback;
  const u = getDemoUserById(s.userId);
  if (!u || u.role !== "teen") return fallback;
  const { login: _l, password: _p, ...rest } = u;
  return rest as TeenProfile;
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="ui-card relative overflow-hidden border-edge bg-panel-muted/85">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/12 blur-2xl"
        aria-hidden
      />
      <p className="relative m-0 text-[0.7rem] font-semibold uppercase tracking-wider text-sub">{label}</p>
      <p className="relative mt-2 m-0 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {sub ? <p className="relative mt-1 m-0 text-xs text-sub">{sub}</p> : null}
    </div>
  );
}

export function TeenProfileView({ initialTeen }: { initialTeen: TeenProfile }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [teen, setTeen] = useState(initialTeen);
  const [apps, setApps] = useState<Application[]>([]);

  const refresh = useCallback(() => {
    const t = resolveSessionTeen(initialTeen);
    setTeen(t);
    setApps(getApplications(t.id));
  }, [initialTeen]);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refresh);
    return () => window.removeEventListener(TEEN_APPLICATIONS_EVENT, refresh);
  }, [refresh]);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-48 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="h-24 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-panel-muted/50" />
        </div>
      </div>
    );
  }

  const stats = computeTeenActivityStats(apps);
  const currentXp = teen.xp + stats.earnedDemoXp;
  const nextLevelXp = nextLevelXpTarget(teen.level, currentXp);
  const hint = buildTeenProfileHint(apps);
  const interests = teen.interests?.length ? teen.interests : [];
  const walletHistory = apps
    .filter((a) => a.status === "paid")
    .map((a) => ({ app: a, task: getTaskByIdForFlow(a.taskId) }))
    .sort((a, b) => new Date(b.app.createdAt).getTime() - new Date(a.app.createdAt).getTime());

  const sectionEase = reduceMotion ? undefined : ([0.22, 1, 0.36, 1] as const);

  return (
    <div className="ui-stack pb-2">
      <motion.header
        className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.15] via-panel/90 to-canvas p-5 shadow-xl shadow-accent-dark/20 sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: sectionEase }}
      >
        <div
          className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-accent-dark/12 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-panel-muted/60 ring-2 ring-accent/45 backdrop-blur-sm sm:h-28 sm:w-28">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent-bright/80">Уровень</span>
              <span className="text-3xl font-bold tabular-nums text-ink sm:text-4xl">{teen.level}</span>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-accent-bright/90">Твой профиль</p>
              <h1 className="mt-1 m-0 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{teen.name}</h1>
              <p className="mt-2 m-0 text-sm text-sub">
                {[teen.city, teen.age ? `${teen.age} лет` : null].filter(Boolean).join(" · ") || "Заполни город в демо-данных"}
              </p>
              {interests.length > 0 ? (
                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                  {interests.map((code) => (
                    <li
                      key={code}
                      className="rounded-full border border-edge-strong bg-panel-muted/50 px-3 py-1 text-xs font-medium text-ink"
                    >
                      {teenInterestLabel(code)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 m-0 text-xs text-sub">Интересы помогут подобрать задачи — укажи их в профиле, когда появится редактирование.</p>
              )}
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-edge bg-canvas/40 px-4 py-3 text-right sm:text-left">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Опыт</p>
            <p className="mt-1 m-0 text-xl font-bold tabular-nums text-ink">{formatXp(currentXp)} XP</p>
            <p className="mt-0.5 m-0 text-xs text-sub">до уровня {teen.level + 1} — {formatXp(nextLevelXp)} XP</p>
            <p className="mt-2 m-0 text-xs font-semibold uppercase tracking-wider text-sub">Кошелёк</p>
            <p className="mt-0.5 m-0 text-sm font-semibold text-accent-bright">{formatRub(stats.earnedDemoRub)}</p>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06, ease: sectionEase }}
      >
        <XPProgress currentXp={currentXp} nextLevelXp={nextLevelXp} />
      </motion.div>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1, ease: sectionEase }}
      >
        <SectionTitle title="Активность" />
        <p className="-mt-1 mb-4 text-sm text-sub">
          Считаем из откликов в этом браузере (демо и раздел «Отклики»).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Отклики" value={String(stats.applicationsCount)} sub="всего в списке" />
          <StatTile label="Завершено" value={String(stats.completedTasksCount)} sub="«Выполнено» и «Оплачено»" />
          <StatTile label="Заработано (демо)" value={formatRub(stats.earnedDemoRub)} sub="по задачам со статусом «Оплачено»" />
        </div>
      </motion.section>

      <motion.section
        className="ui-card border-accent/25 bg-gradient-to-br from-accent/[0.08] via-panel-muted/50 to-transparent"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.14, ease: sectionEase }}
      >
        <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-accent-bright">{hint.eyebrow}</p>
        <h2 className="mt-2 m-0 text-lg font-semibold text-ink">{hint.title}</h2>
        <p className="mt-2 m-0 text-sm leading-relaxed text-sub">{hint.body}</p>
        {hint.href && hint.cta ? (
          <Link
            href={hint.href}
            className="mt-4 inline-flex text-sm font-semibold text-accent transition hover:text-accent-bright"
          >
            {hint.cta} →
          </Link>
        ) : null}
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.18, ease: sectionEase }}
      >
        <SectionTitle title="Достижения" />
        <p className="-mt-1 mb-4 text-sm text-sub">
          Награды за шаги в сервисе: копи XP и открывай уровни.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {demoAchievements.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.22, ease: sectionEase }}
      >
        <SectionTitle title="История кошелька" />
        {walletHistory.length === 0 ? (
          <div className="ui-card border-edge bg-panel-muted/75">
            <p className="m-0 text-sm text-sub">
              Пока пусто. Когда работодатель подтвердит оплату, здесь появится запись с суммой.
            </p>
          </div>
        ) : (
          <div className="ui-card border-edge-strong">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {walletHistory.map(({ app, task }) => (
                <li key={app.id} className="rounded-xl border border-edge bg-panel px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="m-0 text-sm font-medium text-ink">{task?.title ?? `Задача ${app.taskId}`}</p>
                    <p className="m-0 text-sm font-semibold text-accent-bright">{formatRub(task?.payRub ?? 0)}</p>
                  </div>
                  <p className="m-0 mt-1 text-xs text-sub">Зачислено {formatDate(app.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.section>
    </div>
  );
}
