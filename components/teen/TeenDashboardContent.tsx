"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { RecommendedTasks } from "@/components/teen/RecommendedTasks";
import { XPProgress } from "@/components/teen/XPProgress";
import { formatRub, formatXp } from "@/lib/helpers";
import { toDashboardDisplayStats, type TeenDashboardDisplayStats } from "@/data/teen-dashboard";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import { PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-store";
import { resolveSessionTeen } from "@/lib/teen-profile";
import { TEEN_APPLICATIONS_EVENT, getApplications } from "@/lib/teen-flow";
import type { TeenProfile } from "@/types/user";

const section = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const quickActions = [
  {
    href: "/teen/tasks",
    title: "Каталог",
    desc: "Подбери задачу по формату и времени",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: "/teen/applications",
    title: "Отклики",
    desc: "Статусы и что дальше делать",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
      </svg>
    ),
  },
  {
    href: "/teen/profile",
    title: "Профиль",
    desc: "Уровень, кошелёк, достижения",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
] as const;

function nextStepForTeen(teenId: string): { title: string; body: string; href: string; cta: string } {
  const apps = getApplications(teenId);
  const waiting = apps.some((a) => a.status === "applied");
  const inProgress = apps.some((a) => a.status === "accepted");

  if (waiting) {
    return {
      title: "Ожидай ответа",
      body: "Есть отклик со статусом «Отклик отправлен». Загляни в «Отклики», чтобы не пропустить ответ.",
      href: "/teen/applications",
      cta: "К откликам",
    };
  }
  if (inProgress) {
    return {
      title: "Задача в работе",
      body: "Отклик в статусе «Ты в работе». Уточни детали у организатора и следи за статусом в «Откликах».",
      href: "/teen/applications",
      cta: "Открыть отклики",
    };
  }
  return {
    title: "Первый отклик",
    body: "Зайди в каталог, выбери задачу и нажми «Откликнуться» — так начинается сценарий в Траектории.",
    href: "/teen/tasks",
    cta: "В каталог",
  };
}

export function TeenDashboardContent({
  teen: initialTeen,
  stats,
}: {
  teen: TeenProfile;
  stats: TeenDashboardDisplayStats;
}) {
  const reduceMotion = useReducedMotion();
  const [teen, setTeen] = useState(initialTeen);
  const [displayStats, setDisplayStats] = useState<TeenDashboardDisplayStats>(stats);

  const refreshTeenAndStats = useCallback(() => {
    const t = resolveSessionTeen(initialTeen);
    setTeen(t);
    setDisplayStats(toDashboardDisplayStats(t, computeTeenActivityStats(getApplications(t.id))));
  }, [initialTeen]);

  useEffect(() => {
    refreshTeenAndStats();
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "teen" && d.userId === initialTeen.id) refreshTeenAndStats();
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refreshTeenAndStats);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, refreshTeenAndStats);
    };
  }, [refreshTeenAndStats, initialTeen.id]);

  const next = nextStepForTeen(teen.id);
  const baseDelay = reduceMotion ? 0 : 0.05;

  return (
    <div className="ui-stack pb-2">
      {/* Hero header */}
      <motion.header
        className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-panel-muted/60 to-transparent p-6"
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay }}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-accent/80">Главная</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Привет, {teen.name}!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-sub">
          Здесь прогресс, подборки и быстрые переходы. Начни с каталога или загляни в отклики.
        </p>
      </motion.header>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-2 gap-3 lg:grid-cols-5"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: baseDelay + 0.08 },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: "Уровень", value: displayStats.level, accent: true },
          { label: "Опыт", value: `${formatXp(displayStats.xp)} XP` },
          { label: "Мои отклики", value: displayStats.applicationsCount },
          { label: "Завершено", value: displayStats.completedTasksCount },
          { label: "Кошелёк", value: formatRub(displayStats.earnedDemoRub) },
        ].map((item) => (
          <motion.div key={item.label} variants={section}>
            <StatCard label={item.label} value={item.value} accent={item.accent} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={section} initial="hidden" animate="visible" transition={{ delay: baseDelay + 0.2 }}>
        <XPProgress currentXp={displayStats.xp} nextLevelXp={displayStats.nextLevelXp} />
      </motion.div>

      {/* Quick actions */}
      <motion.section
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay + 0.28 }}
      >
        <SectionTitle title="Куда дальше" />
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="ui-card-interactive group flex flex-col gap-2 no-underline"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-bright transition-all duration-200 group-hover:bg-accent/20 group-hover:scale-110">
                {a.icon}
              </div>
              <span className="font-semibold text-ink">{a.title}</span>
              <span className="text-xs leading-relaxed text-sub">{a.desc}</span>
              <span className="mt-1 text-xs font-medium text-accent/90 group-hover:text-accent-bright">
                Перейти →
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Next step */}
      <motion.section
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay + 0.34 }}
      >
        <div className="ui-card border-accent/25 bg-gradient-to-br from-accent/10 via-panel-muted/55 to-transparent transition-all duration-300 hover:border-accent/35">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15">
              <svg className="h-4 w-4 text-accent-bright" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-widest text-accent/80">Следующий шаг</p>
              <h2 className="mt-1 text-base font-bold text-ink">{next.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-sub">{next.body}</p>
              <Link
                href={next.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-bright no-underline hover:no-underline"
              >
                {next.cta}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay + 0.4 }}
      >
        <RecommendedTasks />
      </motion.section>
    </div>
  );
}
