"use client";

import { motion } from "framer-motion";

export function LandingDemoDisclaimer() {
  return (
    <section className="px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-panel-muted/70 to-panel p-6 text-center shadow-lg shadow-amber-900/10 backdrop-blur-sm sm:p-8"
        >
          <p className="text-sm leading-relaxed text-sub sm:text-base">
            <span className="font-semibold text-accent-bright">Это MVP-демо.</span> В текущей версии
            часть сценариев имитируется: авторизация, подтверждение личности и выплата
            вознаграждения. После входа в меню профиля (шапка) или на экране входа можно{" "}
            <span className="font-medium text-ink">сбросить локальные данные</span> и пройти сценарий
            заново.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
