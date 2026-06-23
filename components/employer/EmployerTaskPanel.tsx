"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CATEGORY_LABELS, TASK_STATUS_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { EMPLOYER_CONFIRM, EMPLOYER_TOASTS } from "@/lib/ui-copy";
import { pushEmployerToast } from "@/lib/employer-flow";
import {
  EMPLOYER_TASKS_EVENT,
  deleteTaskDb,
  getEmployerTaskById,
  getSessionEmployerId,
  loadTaskApplicants,
  setTaskStatusDb,
  updateApplicationStatusDb,
} from "@/lib/employer-tasks-client";
import { formatDate } from "@/lib/helpers";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import type { Task } from "@/types/task";
import type { Application } from "@/types/application";

type Props = {
  taskId: string | null;
  mobileMode?: "sheet";
  onClose: () => void;
  onEdit: (taskId: string) => void;
  onRepeat: (taskId: string) => void;
  onDeleted: () => void;
};

function PanelContent({
  taskId,
  onClose,
  onEdit,
  onRepeat,
  onDeleted,
}: Omit<Props, "mobileMode">) {
  const [task, setTask] = useState<Task | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!taskId) return;
    const [t, applicants, eid] = await Promise.all([
      getEmployerTaskById(taskId),
      loadTaskApplicants(taskId),
      getSessionEmployerId(),
    ]);
    setTask(t);
    setApps(applicants.apps);
    setNames(applicants.names);
    setEmployerId(eid);
    setReady(true);
  }, [taskId]);

  useEffect(() => {
    setReady(false);
    void refresh();
    const onEvent = () => void refresh();
    window.addEventListener(EMPLOYER_TASKS_EVENT, onEvent);
    return () => window.removeEventListener(EMPLOYER_TASKS_EVENT, onEvent);
  }, [refresh]);

  const ageHint = useMemo(() => {
    if (!task) return "14–17 лет";
    if (typeof task.minAge === "number" && typeof task.maxAge === "number") {
      return `${task.minAge}–${task.maxAge} лет`;
    }
    return "14–17 лет";
  }, [task]);

  async function handleDelete() {
    if (!task) return;
    if (!window.confirm(EMPLOYER_CONFIRM.deleteTask)) return;
    const ok = await deleteTaskDb(task.id);
    if (ok) onDeleted();
  }

  async function handleToggleClosed() {
    if (!task) return;
    const next = task.status === "completed" ? "open" : "completed";
    const ok = await setTaskStatusDb(task.id, next);
    if (ok) {
      pushEmployerToast(next === "completed" ? EMPLOYER_TOASTS.closed : EMPLOYER_TOASTS.reopened);
      await refresh();
    }
  }

  function handleRepeatTask() {
    if (!task) return;
    onRepeat(task.id);
  }

  async function advanceApplication(app: Application) {
    if (app.status === "rejected") return;
    const next =
      app.status === "applied" ? "accepted" : app.status === "submitted" ? "paid" : null;
    if (!next) return;

    const ok = await updateApplicationStatusDb(app.id, next);
    if (!ok) return;

    if (next === "accepted") {
      await setTaskStatusDb(app.taskId, "in_progress");
      for (const other of apps) {
        if (other.id === app.id || other.taskId !== app.taskId) continue;
        if (other.status === "applied") await updateApplicationStatusDb(other.id, "rejected");
      }
      pushEmployerToast(EMPLOYER_TOASTS.applicationInProgress);
    }
    if (next === "paid") {
      await setTaskStatusDb(app.taskId, "completed");
      pushEmployerToast(EMPLOYER_TOASTS.applicationPaid);
    }
    await refresh();
  }

  async function rejectApplication(app: Application) {
    if (app.status !== "applied") return;
    if (!window.confirm(EMPLOYER_CONFIRM.rejectApplication)) return;
    const ok = await updateApplicationStatusDb(app.id, "rejected");
    if (ok) {
      pushEmployerToast(EMPLOYER_TOASTS.applicationRejected);
      await refresh();
    }
  }

  async function handlePublish() {
    if (!task) return;
    const ok = await setTaskStatusDb(task.id, "open");
    if (ok) {
      pushEmployerToast(EMPLOYER_TOASTS.publish);
      await refresh();
    }
  }

  const canMutate = task ? task.employerId === employerId : false;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-edge px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">Детали задачи</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs text-sub transition hover:text-ink"
          aria-label="Закрыть панель"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!ready ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-panel-muted" />
            ))}
          </div>
        ) : !task ? (
          <p className="text-sm text-sub">Задача не найдена.</p>
        ) : (
          <>
            {/* Summary */}
            <div className="ui-card border-edge-strong">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="m-0 text-base font-semibold leading-snug text-ink">{task.title}</h2>
                <StatusBadge kind="task" status={task.status} />
              </div>
              {task.description ? (
                <p className="mt-2 m-0 text-xs leading-relaxed text-sub">{task.description}</p>
              ) : null}
            </div>

            {/* Params */}
            <div className="ui-card">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-edge bg-panel px-2.5 py-2">
                  <dt className="text-xs text-sub">Категория</dt>
                  <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{CATEGORY_LABELS[task.category]}</dd>
                </div>
                <div className="rounded-lg border border-edge bg-panel px-2.5 py-2">
                  <dt className="text-xs text-sub">Формат</dt>
                  <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{WORK_FORMAT_LABELS[task.workFormat]}</dd>
                </div>
                <div className="rounded-lg border border-edge bg-panel px-2.5 py-2">
                  <dt className="text-xs text-sub">Возраст</dt>
                  <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{ageHint}</dd>
                </div>
                <div className="rounded-lg border border-edge bg-panel px-2.5 py-2">
                  <dt className="text-xs text-sub">Срок</dt>
                  <dd className="m-0 mt-0.5 text-xs font-medium text-ink">
                    {task.deadline ? formatDate(task.deadline) : "не задан"}
                  </dd>
                </div>
                <div className="rounded-lg border border-edge bg-panel px-2.5 py-2 sm:col-span-2">
                  <dt className="text-xs text-sub">Оплата</dt>
                  <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{taskPaymentEmployerSummary(task)}</dd>
                </div>
                {task.location ? (
                  <div className="rounded-lg border border-edge bg-panel px-2.5 py-2 sm:col-span-2">
                    <dt className="text-xs text-sub">Адрес</dt>
                    <dd className="m-0 mt-0.5 text-xs font-medium text-ink">{task.location}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {/* Actions */}
            {canMutate ? (
              <div className="ui-card border-edge">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Действия</p>
                <div className="mt-3 flex flex-col gap-2">
                  {task.status === "draft" ? (
                    <button
                      type="button"
                      className="ui-btn-primary flex w-full justify-center text-sm"
                      onClick={handlePublish}
                    >
                      Опубликовать
                    </button>
                  ) : null}
                  {task.status !== "completed" && task.status !== "in_progress" ? (
                    <button
                      type="button"
                      className="ui-btn-ghost flex w-full justify-center border-0 text-sm"
                      onClick={() => onEdit(task.id)}
                    >
                      Редактировать
                    </button>
                  ) : null}
                  {task.status === "completed" ? (
                    <>
                      <button
                        type="button"
                        className="ui-btn-ghost flex w-full justify-center border-0 text-sm"
                        onClick={handleRepeatTask}
                      >
                        Повторить
                      </button>
                      <button
                        type="button"
                        className="ui-btn-ghost flex w-full justify-center border-0 text-sm"
                        onClick={handleToggleClosed}
                      >
                        Открыть снова
                      </button>
                    </>
                  ) : task.status !== "draft" ? (
                    <button
                      type="button"
                      className="ui-btn-ghost flex w-full justify-center border-0 text-sm"
                      onClick={handleToggleClosed}
                    >
                      Завершить
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-ink transition hover:bg-rose-500/20"
                    onClick={handleDelete}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ) : null}

            {/* Applicants */}
            <div className="ui-card">
              <h3 className="m-0 text-sm font-semibold text-ink">Отклики</h3>
              {apps.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-edge-strong bg-panel-muted/50 px-3 py-6 text-center">
                  <p className="m-0 text-sm text-sub">Откликов пока нет</p>
                </div>
              ) : (
                <ul className="mt-3 m-0 flex list-none flex-col gap-2 p-0">
                  {apps.map((app) => {
                    const name = names[app.teenId] ?? app.teenId;
                    const canRespond = app.status === "applied";
                    const canPay = app.status === "submitted";
                    return (
                      <li
                        key={app.id}
                        className={`rounded-xl border bg-panel px-3 py-2 ${
                          app.status === "rejected"
                            ? "border-rose-500/35 bg-rose-500/[0.06]"
                            : "border-edge"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="m-0 text-xs font-medium text-ink">
                            <Link
                              href={`/employer/teen/${app.teenId}`}
                              className="text-ink underline-offset-2 transition hover:text-accent-bright hover:underline"
                            >
                              {name}
                            </Link>
                          </p>
                          <StatusBadge kind="application" status={app.status} />
                        </div>
                        <p className="m-0 mt-1 text-[0.65rem] text-sub">
                          Получен {formatDate(app.createdAt)}
                        </p>
                        {canRespond ? (
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => advanceApplication(app)}
                              className="text-xs font-medium text-accent underline-offset-2 transition hover:text-accent-bright hover:underline"
                            >
                              Взять в работу
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectApplication(app)}
                              className="text-xs font-medium text-rose-300/95 underline-offset-2 transition hover:text-rose-200 hover:underline"
                            >
                              Отклонить
                            </button>
                          </div>
                        ) : null}
                        {canPay ? (
                          <button
                            type="button"
                            onClick={() => advanceApplication(app)}
                            className="mt-2 text-xs font-medium text-accent underline-offset-2 transition hover:text-accent-bright hover:underline"
                          >
                            Подтвердить оплату
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Status summary */}
            <div className="ui-card border-edge">
              <dl className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-sub">Статус</dt>
                  <dd className="m-0 font-medium text-ink">{TASK_STATUS_LABELS[task.status]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sub">Создана</dt>
                  <dd className="m-0 font-medium text-ink">{formatDate(task.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function EmployerTaskPanel({ taskId, mobileMode, onClose, onEdit, onRepeat, onDeleted }: Props) {
  if (mobileMode === "sheet") {
    return (
      <AnimatePresence>
        {taskId ? (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[85dvh] flex-col rounded-t-2xl border border-edge bg-canvas shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 340 }}
            >
              <PanelContent
                taskId={taskId}
                onClose={onClose}
                onEdit={onEdit}
                onRepeat={onRepeat}
                onDeleted={onDeleted}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    );
  }

  if (!taskId) return null;

  return (
    <div className="hidden h-full w-[360px] shrink-0 border-l border-edge md:flex md:flex-col">
      <PanelContent
        taskId={taskId}
        onClose={onClose}
        onEdit={onEdit}
        onRepeat={onRepeat}
        onDeleted={onDeleted}
      />
    </div>
  );
}
