"use client";

import { motion } from "framer-motion";

const benefits = [
  {
    icon: "🛡️",
    title: "Безопасный формат",
    text: "Прозрачные условия и контролируемая среда для первых шагов в подработке.",
  },
  {
    icon: "✨",
    title: "Простые задания",
    text: "Короткие понятные задачи без перегруза — от промо до помощи на мероприятии.",
  },
  {
    icon: "🚀",
    title: "Понятный старт",
    text: "Минимум трения: от входа до первого отклика за несколько минут.",
  },
  {
    icon: "📊",
    title: "Цифровой профиль и прогресс",
    text: "История, достижения и рост навыков — как в современном продукте.",
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function LandingBenefits() {
  return (
    <section
      id="features"
      className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Возможности
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sub">
          То, за что ценят платформу и подростки, и бизнес.
        </p>

        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={container}
        >
          {benefits.map((b) => (
            <motion.div
              key={b.title}
              variants={card}
              className="rounded-3xl border border-edge bg-gradient-to-b from-panel-muted/95 to-canvas p-6 shadow-xl shadow-black/20 backdrop-blur-sm"
            >
              <span className="text-2xl" aria-hidden>
                {b.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">{b.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
