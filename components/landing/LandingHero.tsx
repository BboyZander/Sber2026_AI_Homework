"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function LandingHero() {
  return (
    <section
      id="about"
      className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <motion.h1
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            Безопасная подработка для подростков 14+
          </motion.h1>
          <motion.p
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5 max-w-xl text-base leading-relaxed text-sub sm:text-lg"
          >
            Сервис помогает подросткам находить реальные задачи, а работодателям — быстро
            публиковать их в удобном формате.
          </motion.p>
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-accent-dark px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent/22 transition duration-200 ease-out hover:brightness-110 active:scale-[0.98] no-underline hover:no-underline"
            >
              Я ищу подработку
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-edge-strong bg-panel-muted/50 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition duration-200 ease-out hover:border-edge-strong hover:bg-panel-muted/60 active:scale-[0.98] no-underline hover:no-underline"
            >
              Я ищу исполнителя
            </Link>
          </motion.div>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-5"
          >
            <Link
              href="/login"
              className="text-sm font-medium text-accent/90 underline-offset-4 hover:text-accent-bright hover:underline"
            >
              Посмотреть демо
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/20 via-accent-dark/12 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-edge bg-panel/80 p-1 shadow-2xl shadow-black/40 backdrop-blur-md">
            <div className="rounded-[1.35rem] bg-gradient-to-b from-raised/95 to-panel p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-sub">
                  Превью
                </span>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sub-deep/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sub-deep/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sub-deep/80" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-3/4 max-w-[200px] rounded-full bg-sub-deep/70" />
                <div className="h-3 w-1/2 max-w-[140px] rounded-full bg-sub-deep/60" />
                <div className="mt-5 grid gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-edge/80 bg-panel-muted/50 p-3 transition-all duration-300 ease-out hover:border-accent/25 hover:bg-accent-soft"
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-accent/45 to-accent-dark/35" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-2.5 w-4/5 rounded-full bg-sub-deep/65" />
                        <div className="h-2 w-3/5 rounded-full bg-sub-deep/55" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
