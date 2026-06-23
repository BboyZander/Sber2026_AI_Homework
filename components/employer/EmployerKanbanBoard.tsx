"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEmployerTaskViewStatus } from "@/lib/employer-flow";
import {
  EMPLOYER_TASKS_EVENT,
  getEmployerTasksCached,
  loadTaskApplicantCounts,
  loadEmployerTasks,
  taskHasAppliedCached,
} from "@/lib/employer-tasks-client";
import type { Task } from "@/types/task";
import { EmployerKanbanColumn, type KanbanColumnConfig } from "./EmployerKanbanColumn";
import { EmployerTaskPanel } from "./EmployerTaskPanel";
import { EmployerTaskFormDrawer } from "./EmployerTaskFormDrawer";

type ViewStatus = "draft" | "open" | "with_application" | "in_progress" | "completed";

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: "draft",
    label: "Черновики",
    labelClass: "text-sub",
    countClass: "bg-panel-muted text-sub",
    emptyText: "Нет черновиков",
  },
  {
    id: "open",
    label: "Открытые",
    labelClass: "text-sky-400",
    countClass: "bg-sky-500/15 text-sky-300",
    emptyText: "Нет открытых задач",
  },
  {
    id: "with_application",
    label: "С откликом",
    labelClass: "text-accent-bright",
    countClass: "bg-accent/20 text-accent-bright",
    emptyText: "Откликов пока нет",
  },
  {
    id: "in_progress",
    label: "В работе",
    labelClass: "text-emerald-400",
    countClass: "bg-emerald-500/15 text-emerald-300",
    emptyText: "Нет активных задач",
  },
  {
    id: "completed",
    label: "Завершённые",
    labelClass: "text-sub/70",
    countClass: "bg-panel-muted text-sub",
    emptyText: "Нет завершённых",
  },
];

export function EmployerKanbanBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [list, setList] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [editTaskId, setEditTaskId] = useState<string | undefined>(undefined);

  // Load tasks + applicant counts
  useEffect(() => {
    setMounted(true);
    void loadEmployerTasks();
    const sync = () => {
      const tasks = getEmployerTasksCached();
      setList(tasks);
      // Batch-load applicant counts for tasks that likely have applications
      const relevantIds = tasks
        .filter((t) => t.status === "open" || t.status === "in_progress")
        .map((t) => t.id);
      if (relevantIds.length > 0) {
        void loadTaskApplicantCounts(relevantIds).then(setAppCounts);
      }
    };
    sync();
    window.addEventListener(EMPLOYER_TASKS_EVENT, sync);
    return () => window.removeEventListener(EMPLOYER_TASKS_EVENT, sync);
  }, []);

  // Handle URL params on mount
  useEffect(() => {
    const action = searchParams.get("action");
    const selected = searchParams.get("selected");
    const id = searchParams.get("id");

    if (selected) setSelectedTaskId(selected);
    if (action === "create") setDrawerMode("create");
    if (action === "edit" && id) { setEditTaskId(id); setDrawerMode("edit"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Split tasks by view status
  const columns = useMemo(() => {
    const byStatus: Record<ViewStatus, Task[]> = {
      draft: [],
      open: [],
      with_application: [],
      in_progress: [],
      completed: [],
    };
    for (const task of list) {
      const vs = getEmployerTaskViewStatus(task, taskHasAppliedCached(task.id));
      byStatus[vs].push(task);
    }
    return byStatus;
  }, [list]);

  const totalTasks = list.length;

  function openCreateDrawer() {
    setEditTaskId(undefined);
    setDrawerMode("create");
  }

  function handleSelectTask(id: string) {
    setSelectedTaskId(id);
  }

  function handleClosePanel() {
    setSelectedTaskId(null);
    router.replace("/employer/tasks");
  }

  function handleEditTask(taskId: string) {
    setEditTaskId(taskId);
    setDrawerMode("edit");
  }

  function handleRepeatTask(taskId: string) {
    setEditTaskId(undefined);
    setDrawerMode("create");
    router.replace(`/employer/tasks?action=create&repeatFrom=${encodeURIComponent(taskId)}`);
  }

  function handleDeleted() {
    setSelectedTaskId(null);
    router.replace("/employer/tasks");
  }

  function handleDrawerClose() {
    setDrawerMode(null);
    setEditTaskId(undefined);
    router.replace("/employer/tasks");
  }

  function handleDrawerSuccess(task: Task) {
    setDrawerMode(null);
    setEditTaskId(undefined);
    setSelectedTaskId(task.id);
    router.replace("/employer/tasks");
  }

  if (!mounted) return null;

  // Empty board state
  if (totalTasks === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-4xl">📋</p>
        <div>
          <p className="text-base font-semibold text-ink">Задач пока нет</p>
          <p className="mt-1 max-w-xs text-sm text-sub">
            Создайте первую задачу — она сразу появится в каталоге подростков
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDrawer}
          className="ui-btn-primary rounded-xl px-6 py-2.5"
        >
          + Новая задача
        </button>
        <EmployerTaskFormDrawer
          open={drawerMode !== null}
          editTaskId={editTaskId}
          onClose={handleDrawerClose}
          onSuccess={handleDrawerSuccess}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full">
      {/* Columns area */}
      <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto p-4 pb-0">
        {KANBAN_COLUMNS.map((col) => (
          <EmployerKanbanColumn
            key={col.id}
            config={col}
            items={columns[col.id as ViewStatus]}
            appCounts={appCounts}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
          />
        ))}
      </div>

      {/* Right panel (desktop) */}
      <EmployerTaskPanel
        taskId={selectedTaskId}
        onClose={handleClosePanel}
        onEdit={handleEditTask}
        onRepeat={handleRepeatTask}
        onDeleted={handleDeleted}
      />

      {/* Mobile bottom sheet */}
      <EmployerTaskPanel
        taskId={selectedTaskId}
        mobileMode="sheet"
        onClose={handleClosePanel}
        onEdit={handleEditTask}
        onRepeat={handleRepeatTask}
        onDeleted={handleDeleted}
      />

      {/* Drawer form */}
      <EmployerTaskFormDrawer
        open={drawerMode !== null}
        editTaskId={editTaskId}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />

      {/* FAB */}
      <button
        type="button"
        onClick={openCreateDrawer}
        className="ui-btn-primary fixed bottom-6 right-6 z-40 rounded-full px-5 py-3 shadow-lg"
        aria-label="Создать задачу"
      >
        + Новая задача
      </button>
    </div>
  );
}
