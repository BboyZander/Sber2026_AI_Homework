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
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
        className="ui-card border-edge-strong bg-gradient-to-br from-panel-muted/95 to-panel"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Кабинет</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Здравствуйте, {helloName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub">
          Публикуйте задачи и следите за статусами. Основное действие здесь — создать новую задачу.
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
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <SectionTitle title="Сводка" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard label="Всего задач" value={stats.total} />
          <StatCard label="Черновики" value={stats.draft} />
          <StatCard label="Открытые" value={stats.open} hint="в каталоге подростка" />
          <StatCard label="С откликом" value={stats.with_application} />
          <StatCard label="В работе" value={stats.in_progress} />
          <StatCard label="Завершённые" value={stats.completed} />
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      >
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
            emoji="✨"
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

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] as const }}
        className="ui-card border-edge bg-panel-muted/75"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Следующий шаг</p>
        <p className="mt-2 m-0 text-sm leading-relaxed text-sub">
          Заполните описание и оплату, опубликуйте — задача появится в каталоге и в списке «Мои задачи».
        </p>
      </motion.section>
    </div>
  );
}
