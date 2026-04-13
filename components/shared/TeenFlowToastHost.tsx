"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { TEEN_FLOW_TOAST_EVENT, type TeenFlowToastDetail } from "@/lib/teen-flow";

export function TeenFlowToastHost() {
  const reduceMotion = useReducedMotion();
  const [message, setMessage] = useState<string | null>(null);

  const hide = useCallback(() => setMessage(null), []);

  useEffect(() => {
    function onToast(e: Event) {
      const ce = e as CustomEvent<TeenFlowToastDetail>;
      if (ce.detail?.message) setMessage(ce.detail.message);
    }
    window.addEventListener(TEEN_FLOW_TOAST_EVENT, onToast as EventListener);
    return () => window.removeEventListener(TEEN_FLOW_TOAST_EVENT, onToast as EventListener);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(hide, 5200);
    return () => window.clearTimeout(t);
  }, [message, hide]);

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[100] w-[min(100%,22rem)] -translate-x-1/2 px-3"
      style={{ bottom: "max(calc(var(--bottom-nav-h) + 0.75rem), env(safe-area-inset-bottom, 0px))" }}
      aria-live="polite"
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            key={message}
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }}
            className="pointer-events-auto rounded-2xl border border-accent/40 bg-panel/95 px-4 py-3 text-center text-sm leading-snug text-ink shadow-xl shadow-accent-dark/35 backdrop-blur-md"
          >
            <span className="mr-1.5 inline-block text-accent-bright" aria-hidden>
              ✓
            </span>
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
