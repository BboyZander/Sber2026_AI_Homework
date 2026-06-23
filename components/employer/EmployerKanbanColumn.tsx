"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EmployerTaskKanbanCard } from "./EmployerTaskKanbanCard";
import type { Task } from "@/types/task";

export type KanbanColumnConfig = {
  id: string;
  label: string;
  labelClass: string;
  countClass: string;
  emptyText: string;
};

type Props = {
  config: KanbanColumnConfig;
  items: Task[];
  appCounts: Record<string, number>;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
};

export function EmployerKanbanColumn({
  config,
  items,
  appCounts,
  selectedTaskId,
  onSelectTask,
}: Props) {
  return (
    <div className="flex w-[240px] shrink-0 flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.labelClass}`}>
          {config.label}
        </span>
        {items.length > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.countClass}`}>
            {items.length}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto pb-4">
        <AnimatePresence initial={false}>
          {items.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
            >
              <EmployerTaskKanbanCard
                task={task}
                selected={task.id === selectedTaskId}
                applicantCount={appCounts[task.id] ?? 0}
                onClick={() => onSelectTask(task.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-edge px-3 py-8 text-center">
            <p className="text-xs text-sub">{config.emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
