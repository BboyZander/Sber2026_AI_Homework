"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CATEGORY_LABELS, TASK_STATUS_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { EMPLOYER_CONFIRM, EMPLOYER_TOASTS } from "@/lib/ui-copy";
import { getDemoUserById } from "@/lib/auth";
import {
  canMutateTask,
  EMPLOYER_TASKS_EVENT,
  EMPLOYER_TASKS_EXTRA_KEY,
  getTaskByIdForFlow,
  pushEmployerToast,
  removeTask,
  setTaskStatusForFlow,
  toggleTaskClosed,
} from "@/lib/employer-flow";
import {
  getApplicationsForTask,
  TEEN_APPLICATIONS_EVENT,
  updateApplicationStatus,
} from "@/lib/teen-flow";
import { formatDate } from "@/lib/helpers";
import type { Task } from "@/types/task";
import { taskPaymentEmployerSummary, taskPaymentTeenEstimatedTotalLine } from "@/lib/task-payment";
import type { Application } from "@/types/application";

export function EmployerTaskDetailView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<Task | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const refresh = useCallback(() => {
    const t = getTaskByIdForFlow(taskId);
    setTask(t);
    setApps(getApplicationsForTask(taskId));
  }, [taskId]);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EMPLOYER_TASKS_EXTRA_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EMPLOYER_TASKS_EVENT, refresh);
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EMPLOYER_TASKS_EVENT, refresh);
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, refresh);
    };
  }, [refresh]);

  const ageHint = useMemo(() => {
    if (!task) return "14–17 лет";
    if (typeof task.minAge === "number" && typeof task.maxAge === "number") {
      return `${task.minAge}–${task.maxAge} лет`;
    }
    return "14–17 лет";
  }, [task]);

  function handleDelete() {
    if (!task) return;
    if (!window.confirm(EMPLOYER_CONFIRM.deleteTask)) return;
    const ok = removeTask(task.id);
    if (ok) window.location.href = "/employer/tasks";
  }

  function handleToggleClosed() {
    if (!task) return;
    const updated = toggleTaskClosed(task.id);
    if (updated) refresh();
  }

  function handleRepeatTask() {
    if (!task) return;
    window.location.href = `/employer/tasks/new?repeatFrom=${encodeURIComponent(task.id)}`;
  }

  function advanceApplication(app: Application) {
    if (app.status === "rejected") return;
    const next =
      app.status === "applied"
        ? "accepted"
        : app.status === "submitted"
          ? "paid"
          : null;
    if (!next) return;
    const ok = updateApplicationStatus(app.id, next);
    if (ok && next === "accepted") {
      setTaskStatusForFlow(app.taskId, "in_progress");
      for (const other of apps) {
        if (other.id === app.id) continue;
        if (other.taskId !== app.taskId) continue;
        if (other.status === "applied") updateApplicationStatus(other.id, "rejected");
      }
    }
    if (ok && next === "paid") {
      setTaskStatusForFlow(app.taskId, "completed");
    }
    refresh();
    if (ok) {
      if (next === "accepted") pushEmployerToast(EMPLOYER_TOASTS.applicationInProgress);
      if (next === "paid") pushEmployerToast(EMPLOYER_TOASTS.applicationPaid);
    }
  }

  function rejectApplication(app: Application) {
    if (app.status === "rejected") return;
    if (app.status !== "applied") return;
    if (!window.confirm(EMPLOYER_CONFIRM.rejectApplication)) return;
    const ok = updateApplicationStatus(app.id, "rejected");
    refresh();
    if (ok) pushEmployerToast(EMPLOYER_TOASTS.applicationRejected);
  }

  if (!task) {
    return (
      <EmptyState
        emoji="📭"
        title="Задача не найдена"
        description="Возможно, она удалена или недоступна для этого аккаунта."
        action={<CTAButton href="/employer/tasks">К списку</CTAButton>}
      />
    );
  }

  const canMutate = canMutateTask(task.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <article className="space-y-5">
        <Link
          href="/employer/tasks"
          className="text-sm font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
        >
          ← К списку задач
        </Link>

        <section className="ui-card border-edge-strong">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Карточка задачи</p>
              <h1 className="m-0 text-2xl font-semibold leading-tight text-ink">{task.title}</h1>
            </div>
            <StatusBadge kind="task" status={task.status} />
          </div>
          <p className="mt-4 m-0 text-sm leading-relaxed text-sub">{task.description}</p>
        </section>

        <section className="ui-card">
          <h2 className="m-0 text-base font-semibold text-ink">Параметры</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Категория</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">{CATEGORY_LABELS[task.category]}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Формат</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">{WORK_FORMAT_LABELS[task.workFormat]}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Локация</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">{task.location ?? "Не указана"}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Длительность</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">{task.durationLabel}</dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2 sm:col-span-2">
              <dt className="text-xs text-sub">Оплата</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">
                <div className="space-y-1">
                  <span>{taskPaymentEmployerSummary(task)}</span>
                  {taskPaymentTeenEstimatedTotalLine(task) ? (
                    <p className="m-0 text-xs font-normal text-sub">{taskPaymentTeenEstimatedTotalLine(task)}</p>
                  ) : null}
                </div>
              </dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Возраст</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">{ageHint}</dd>
            </div>
          </dl>
        </section>

        <section className="ui-card">
          <h2 className="m-0 text-base font-semibold text-ink">Отклики</h2>
          {apps.length === 0 ? (
            <div
              className="mt-4 rounded-xl border border-dashed border-edge-strong bg-panel-muted/50 px-4 py-8 text-center"
              role="status"
            >
              <p className="m-0 text-2xl leading-none" aria-hidden>
                👋
              </p>
              <p className="mt-3 m-0 text-sm font-medium text-ink">Откликов пока нет</p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-sub">
                Задача в каталоге у подростков — как только кто-то откликнется, карточка появится здесь.
              </p>
            </div>
          ) : (
            <ul className="mt-3 m-0 flex list-none flex-col gap-2 p-0">
              {apps.map((app) => {
                const user = getDemoUserById(app.teenId);
                const name = user && user.role === "teen" ? user.name : app.teenId;
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
                      <p className="m-0 text-sm font-medium text-ink">
                        <Link
                          href={`/employer/teen/${app.teenId}`}
                          className="text-ink underline-offset-2 transition hover:text-accent-bright hover:underline"
                        >
                          {name}
                        </Link>
                      </p>
                      <StatusBadge kind="application" status={app.status} />
                    </div>
                    <p className="m-0 mt-1 text-xs text-sub">Получен {formatDate(app.createdAt)}</p>
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
        </section>
      </article>

      <aside className="space-y-3 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
        <div className="ui-card border-edge-strong">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Сводка</p>
          <p className="mt-3 m-0 text-sm text-sub">
            Статус: <span className="font-medium text-ink">{TASK_STATUS_LABELS[task.status]}</span>
          </p>
          <p className="mt-1 m-0 text-sm text-sub">
            Дата публикации: <span className="font-medium text-ink">{formatDate(task.createdAt)}</span>
          </p>
          <p className="mt-1 m-0 text-sm text-sub">
            Срок: <span className="font-medium text-ink">{task.deadline ? formatDate(task.deadline) : "не задан"}</span>
          </p>
        </div>

        {canMutate ? (
          <div className="ui-card border-edge">
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Действия</p>
            <div className="mt-3 flex flex-col gap-2">
              {task.status !== "completed" && task.status !== "in_progress" ? (
                <Link
                  href={`/employer/tasks/${task.id}/edit`}
                  className="ui-btn-ghost flex w-full justify-center border-0 no-underline"
                >
                  Редактировать
                </Link>
              ) : null}
              {task.status === "completed" ? (
                <button type="button" className="ui-btn-ghost border-0 w-full justify-center" onClick={handleRepeatTask}>
                  Повторить
                </button>
              ) : (
                <button type="button" className="ui-btn-ghost border-0 w-full justify-center" onClick={handleToggleClosed}>
                  Завершить
                </button>
              )}
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

        <CTAButton href="/employer/tasks" className="w-full justify-center">
          К списку
        </CTAButton>
      </aside>
    </div>
  );
}
