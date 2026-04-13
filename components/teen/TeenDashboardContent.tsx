"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { RecommendedTasks } from "@/components/teen/RecommendedTasks";
import { XPProgress } from "@/components/teen/XPProgress";
import { formatRub, formatXp } from "@/lib/helpers";
import { TEEN_APPLICATIONS_EVENT, getApplicationStats, getApplications } from "@/lib/teen-flow";
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
    icon: "🔍",
  },
  {
    href: "/teen/applications",
    title: "Отклики",
    desc: "Статусы и что дальше делать",
    icon: "📬",
  },
  {
    href: "/teen/profile",
    title: "Профиль",
    desc: "Уровень, кошелёк, достижения",
    icon: "👤",
  },
] as const;

function nextStepForTeen(teenId: string): { title: string; body: string; href: string; cta: string } {
  const apps = getApplications(teenId);
  const waiting = apps.some((a) => a.status === "awaiting" || a.status === "sent");
  const inProgress = apps.some((a) => a.status === "in_progress");

  if (waiting) {
    return {
      title: "Дальше: жди ответа",
      body: "Есть отклик со статусом «Отправлен» или «Ждём ответа». Загляни в «Отклики», чтобы не пропустить ответ.",
      href: "/teen/applications",
      cta: "К откликам",
    };
  }
  if (inProgress) {
    return {
      title: "Дальше: задача в работе",
      body: "Отклик в статусе «В работе». Уточни детали у организатора и следи за статусом в «Откликах».",
      href: "/teen/applications",
      cta: "Открыть отклики",
    };
  }
  return {
    title: "Дальше: первый отклик",
    body: "Зайди в каталог, выбери задачу и нажми «Откликнуться» — так начинается сценарий в Траектории.",
    href: "/teen/tasks",
    cta: "В каталог",
  };
}

export function TeenDashboardContent({
  teen,
  stats,
}: {
  teen: TeenProfile;
  stats: {
    level: number;
    xp: number;
    applicationsCount: number;
    completedTasksCount: number;
    nextLevelXp: number;
  };
}) {
  const reduceMotion = useReducedMotion();
  const [mergedAppCount, setMergedAppCount] = useState(stats.applicationsCount);
  const [walletRub, setWalletRub] = useState(0);

  useEffect(() => {
    function refresh() {
      setMergedAppCount(getApplications(teen.id).length);
      setWalletRub(getApplicationStats(teen.id).earnedDemoRub);
    }
    refresh();
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refresh);
    return () => window.removeEventListener(TEEN_APPLICATIONS_EVENT, refresh);
  }, [teen.id]);

  const next = nextStepForTeen(teen.id);
  const baseDelay = reduceMotion ? 0 : 0.05;

  return (
    <div className="ui-stack pb-2">
      <motion.header
        className="space-y-2"
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-accent/90">Главная</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Привет, {teen.name}! 👋
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-sub sm:text-base">
          Здесь прогресс, подборки и быстрые переходы. Начни с каталога или загляни в отклики.
        </p>
      </motion.header>

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
          { label: "Уровень", value: stats.level, hint: `Следующий: ${stats.level + 1}` },
          { label: "Опыт", value: formatXp(stats.xp), hint: "всего XP" },
          { label: "Отклики", value: mergedAppCount, hint: "все статусы" },
          { label: "Завершено", value: stats.completedTasksCount, hint: "в демо-сценарии" },
          { label: "Кошелёк", value: formatRub(walletRub), hint: "начислено в демо" },
        ].map((item) => (
          <motion.div key={item.label} variants={section}>
            <StatCard label={item.label} value={item.value} hint={item.hint} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={section} initial="hidden" animate="visible" transition={{ delay: baseDelay + 0.2 }}>
        <XPProgress currentXp={stats.xp} nextLevelXp={stats.nextLevelXp} />
      </motion.div>

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
              className="ui-card-interactive group flex flex-col gap-1 overflow-hidden no-underline"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <span className="inline-block origin-center text-2xl leading-none transition-transform duration-200 ease-out will-change-transform group-hover:scale-[1.365]">
                  {a.icon}
                </span>
              </span>
              <span className="font-semibold text-ink">{a.title}</span>
              <span className="text-xs leading-relaxed text-sub group-hover:text-sub">{a.desc}</span>
              <span className="mt-2 text-xs font-medium text-accent/90 group-hover:text-accent-bright">
                Перейти →
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={section}
        initial="hidden"
        animate="visible"
        transition={{ delay: baseDelay + 0.34 }}
      >
        <div className="ui-card border-accent/25 bg-gradient-to-br from-accent/10 via-panel-muted/55 to-transparent transition-all duration-300 hover:border-accent/35">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent/90">Следующий шаг</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{next.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-sub">{next.body}</p>
          <Link
            href={next.href}
            className="mt-4 inline-flex text-sm font-semibold text-accent transition hover:text-accent-bright"
          >
            {next.cta} →
          </Link>
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
