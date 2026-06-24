"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AssistantFab({ onClick, hidden }: { onClick: () => void; hidden: boolean }) {
  const reduceMotion = useReducedMotion();

  if (hidden) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Открыть ИИ-ассистента"
      className="fixed bottom-[calc(var(--bottom-nav-h,0px)+1rem)] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 md:bottom-6 md:right-6"
      initial={false}
      animate={
        reduceMotion
          ? {}
          : {
              boxShadow: [
                "0 0 0 0 rgba(74, 222, 128, 0.4)",
                "0 0 0 12px rgba(74, 222, 128, 0)",
              ],
            }
      }
      transition={reduceMotion ? {} : { duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      whileHover={reduceMotion ? {} : { scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    </motion.button>
  );
}
