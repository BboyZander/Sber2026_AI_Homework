"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={item}
      className="rounded-3xl border border-edge bg-panel-muted/85 p-6 shadow-xl shadow-black/20 backdrop-blur-sm"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent-dark/20 text-sm font-bold text-accent-bright">
        {step}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-sub">{description}</p>
    </motion.div>
  );
}

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Как это работает
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sub">
          Два понятных сценария — для подростка и для работодателя.
        </p>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={container}
          >
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-accent/90">
              Подросток
            </p>
            <div className="grid gap-4">
              <StepCard
                step={1}
                title="Войти в сервис"
                description="Быстрая регистрация и понятный профиль — без лишних шагов."
              />
              <StepCard
                step={2}
                title="Найти подходящую задачу"
                description="Фильтры и карточки заданий с прозрачными условиями."
              />
              <StepCard
                step={3}
                title="Откликнуться и получить результат"
                description="Отклик, статус и история — всё в одном месте."
              />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={container}
          >
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-accent-bright">
              Работодатель
            </p>
            <div className="grid gap-4">
              <StepCard
                step={1}
                title="Войти"
                description="Личный кабинет компании с обзором задач."
              />
              <StepCard
                step={2}
                title="Опубликовать задачу"
                description="Короткая форма: что сделать, срок, формат вознаграждения."
              />
              <StepCard
                step={3}
                title="Получить отклик"
                description="Смотрите отклики и статусы в удобной ленте."
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
