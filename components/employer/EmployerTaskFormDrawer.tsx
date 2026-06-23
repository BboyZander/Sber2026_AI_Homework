"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { TaskForm } from "./TaskForm";
import type { Task } from "@/types/task";

type Props = {
  open: boolean;
  editTaskId?: string;
  onClose: () => void;
  onSuccess: (task: Task) => void;
};

const SPRING = { type: "spring" as const, damping: 30, stiffness: 280 };

export function EmployerTaskFormDrawer({ open, editTaskId, onClose, onSuccess }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const header = (
    <div className="flex shrink-0 items-center justify-between border-b border-edge px-5 py-3">
      <h2 className="m-0 text-base font-semibold text-ink">
        {editTaskId ? "Редактирование задачи" : "Новая задача"}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-3 py-1.5 text-sm text-sub transition hover:text-ink"
      >
        Закрыть
      </button>
    </div>
  );

  const body = (
    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5">
      <Suspense fallback={<div className="ui-card text-sm text-sub">Загружаем форму…</div>}>
        <TaskForm editTaskId={editTaskId} onCreated={onSuccess} />
      </Suspense>
    </div>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {isMobile ? (
            /* Mobile: bottom sheet, full-screen height */
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed inset-x-0 bottom-0 top-[56px] z-[61] flex flex-col rounded-t-2xl border-t border-edge bg-canvas shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
            >
              {header}
              {body}
            </motion.div>
          ) : (
            /* Desktop: right-side drawer, wide enough for 2-column form */
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(920px,90vw)] flex-col border-l border-edge bg-canvas shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              {header}
              {body}
            </motion.div>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );
}
