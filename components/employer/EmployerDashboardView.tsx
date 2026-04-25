"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmployerProfile } from "@/types/user";
import type { Task } from "@/types/task";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { StatCard } from "@/components/shared/StatCard";
import { PublishedTaskCard } from "@/components/employer/PublishedTaskCard";
import { resolveSessionEmployer } from "@/lib/employer-profile";
import { PROFILE_UPDATED_EVENT, type ProfileUpdatedDetail } from "@/lib/profile-store";
import {
  EMPLOYER_TASKS_EVENT,
  EMPLOYER_TASKS_EXTRA_KEY,
  getEmployerTaskStats,
  getEmployerTasks,
} from "@/lib/employer-flow";
import { TEEN_APPLICATIONS_EVENT } from "@/lib/teen-flow";

const slide = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function EmployerDashboardView({
  employer: initialEmployer,
}: {
  employer: EmployerProfile;
}) {
  const reduceMotion = useReducedMotion();
  const [employer, setEmployer] = useState(initialEmployer);
  const [tasks, setTasks] = useState<Task[]>([]);

  const refreshEmployer = useCallback(() => {
    setEmployer(resolveSessionEmployer(initialEmployer));
  }, [initialEmployer]);

  const refreshTasks = useCallback(() => {
    setTasks(getEmployerTasks());
  }, []);

  const refresh = useCallback(() => {
    refreshEmployer();
    refreshTasks();
  }, [refreshEmployer, refreshTasks]);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EMPLOYER_TASKS_EXTRA_KEY) refreshTasks();
    };
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "employer" && d.userId === initialEmployer.id) refreshEmployer();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(EMPLOYER_TASKS_EVENT, refreshTasks);
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refreshTasks);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EMPLOYER_TASKS_EVENT, refreshTasks);
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, refreshTasks);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
    };
  }, [refresh, refreshEmployer, refreshTasks, initialEmployer.id]);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [tasks],
  );
  const stats = useMemo(() => getEmployerTaskStats(), [tasks]);
  const helloName = employer.companyName || employer.name;

  return (
    <div className="ui-stack pb-2">
      {/* Hero */}
      <motion.section
        {...(reduceMotion ? {} : slide(0))}
        className="relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/12 via-panel-muted/70 to-transparent p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative">
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-accent/80">Кабинет работодателя</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Здравствуйте, {helloName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub">
            Публикуйте задачи и следите за статусами. Только юр. лица и ИП.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <CTAButton href="/employer/tasks/new" className="w-full justify-center sm:w-auto">
              Создать задачу
            </CTAButton>
            <Link
              href="/employer/profile"
              className="ui-btn-ghost w-full justify-center border border-edge px-4 py-2.5 text-center text-sm font-semibold no-underline hover:no-underline sm:w-auto"
            >
              Данные кабинета
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section {...(reduceMotion ? {} : slide(0.05))}>
        <SectionTitle title="Сводка" />
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          <StatCard label="Всего задач" value={stats.total} compact />
          <StatCard label="Черновики" value={stats.draft} compact />
          <StatCard label="Открытые" value={stats.open} hint="в каталоге" accent={stats.open > 0} compact />
          <StatCard label="С откликом" value={stats.with_application} accent={stats.with_application > 0} compact />
          <StatCard label="В работе" value={stats.in_progress} compact />
          <StatCard label="Завершённые" value={stats.completed} compact />
        </div>
      </motion.section>

      {/* Recent tasks */}
      <motion.section {...(reduceMotion ? {} : slide(0.1))}>
        <SectionTitle
          title="Последние задачи"
          action={
            <CTAButton href="/employer/tasks/new" variant="ghost">
              Новая задача
            </CTAButton>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            emoji="📋"
            title="Задач пока нет"
            description="Создайте первую — она появится в списке и в каталоге подростка."
            action={<CTAButton href="/employer/tasks/new">Создать задачу</CTAButton>}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((t, i) => (
              <motion.div
                key={t.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay: reduceMotion ? 0 : Math.min(i * 0.05, 0.2),
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <PublishedTaskCard task={t} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Next step hint */}
      <motion.section {...(reduceMotion ? {} : slide(0.14))}>
        <div className="ui-card flex items-start gap-3 border-edge bg-panel-muted/75">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15">
            <svg className="h-4 w-4 text-accent-bright" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-sub">Следующий шаг</p>
            <p className="mt-1 text-sm leading-relaxed text-sub">
              Заполните описание и оплату, опубликуйте — задача появится в каталоге и в списке «Мои задачи».
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
