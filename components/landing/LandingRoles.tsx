"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const roles = [
  {
    title: "Подросток",
    accent: "from-accent/20 to-accent-dark/10",
    border: "border-accent/25",
    bullets: ["находи задания", "откликайся", "развивай профиль"],
    cta: "Войти как подросток",
  },
  {
    title: "Работодатель",
    accent: "from-accent/14 to-accent-dark/10",
    border: "border-accent/22",
    bullets: ["публикуй задачи", "находи исполнителей", "отслеживай статус"],
    cta: "Войти как работодатель",
  },
] as const;

export function LandingRoles() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Выберите роль
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sub">
          Один сервис — разные сценарии входа в демо.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
              className={`relative overflow-hidden rounded-3xl border ${role.border} bg-panel-muted/75 p-8 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-10`}
            >
              <div
                className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${role.accent} blur-3xl`}
              />
              <h3 className="relative text-xl font-bold text-ink">{role.title}</h3>
              <ul className="relative mt-6 space-y-3 text-sub">
                {role.bullets.map((line) => (
                  <li key={line} className="flex items-center gap-3 text-sm sm:text-base">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-bright" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="relative mt-8">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-panel-muted/60 px-6 py-3.5 text-sm font-semibold text-ink ring-1 ring-white/15 transition hover:bg-panel-muted/70 no-underline hover:no-underline sm:w-auto"
                >
                  {role.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
