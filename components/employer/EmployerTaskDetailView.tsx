"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CATEGORY_LABELS, TASK_STATUS_LABELS, WORK_FORMAT_LABELS } from "@/lib/constants";
import { DEMO_COPY, EMPLOYER_CONFIRM, EMPLOYER_TOASTS } from "@/lib/ui-copy";
import { getDemoUserById } from "@/lib/auth";
import {
  canMutateTask,
  editTask,
  EMPLOYER_TASKS_EVENT,
  EMPLOYER_TASKS_EXTRA_KEY,
  getTaskByIdForFlow,
  pushEmployerToast,
  removeTask,
  toggleTaskClosed,
} from "@/lib/employer-flow";
import {
  getApplicationsForTask,
  TEEN_APPLICATIONS_EVENT,
  updateApplicationStatus,
} from "@/lib/teen-flow";
import { formatDate, formatRub } from "@/lib/helpers";
import type { Task } from "@/types/task";
import type { Application } from "@/types/application";

export function EmployerTaskDetailView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<Task | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    payRub: "",
    location: "",
    durationLabel: "",
    deadline: "",
  });

  const refresh = useCallback(() => {
    const t = getTaskByIdForFlow(taskId);
    setTask(t);
    setApps(getApplicationsForTask(taskId));
    if (t) {
      setDraft({
        title: t.title,
        description: t.description,
        payRub: String(t.payRub),
        location: t.location ?? "",
        durationLabel: t.durationLabel,
        deadline: t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : "",
      });
    }
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

  async function copyLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function saveEdits() {
    if (!task) return;
    const updated = editTask(task.id, {
      title: draft.title.trim(),
      description: draft.description.trim(),
      payRub: Number(draft.payRub || 0),
      location: draft.location.trim(),
      durationLabel: draft.durationLabel.trim(),
      deadline: draft.deadline ? new Date(draft.deadline).toISOString() : undefined,
    });
    if (updated) {
      setEditMode(false);
      refresh();
    }
  }

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

  function advanceApplication(app: Application) {
    const next =
      app.status === "sent" || app.status === "awaiting"
        ? "in_progress"
        : app.status === "completed"
          ? "paid"
          : null;
    if (!next) return;
    const ok = updateApplicationStatus(app.id, next);
    refresh();
    if (ok) {
      if (next === "in_progress") pushEmployerToast(EMPLOYER_TOASTS.applicationInProgress);
      if (next === "paid") pushEmployerToast(EMPLOYER_TOASTS.applicationPaid);
    }
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/employer/tasks"
            className="text-sm font-medium text-accent underline-offset-2 hover:text-accent-bright hover:underline"
          >
            ← К списку задач
          </Link>
          <button type="button" onClick={copyLink} className="ui-btn-ghost border-0 px-3 py-1.5 text-xs">
            {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
          </button>
        </div>

        <section className="ui-card border-edge-strong">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Карточка задачи</p>
              {editMode ? (
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className="w-full rounded-xl border border-edge bg-panel px-3 py-2 text-xl font-semibold leading-tight text-ink outline-none ring-accent/35 focus:border-accent/45 focus:ring-2"
                />
              ) : (
                <h1 className="m-0 text-2xl font-semibold leading-tight text-ink">{task.title}</h1>
              )}
            </div>
            <StatusBadge kind="task" status={task.status} />
          </div>
          {editMode ? (
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={5}
              className="mt-4 w-full rounded-xl border border-edge bg-panel px-3 py-2 text-sm leading-relaxed text-ink outline-none ring-accent/35 focus:border-accent/45 focus:ring-2"
            />
          ) : (
            <p className="mt-4 m-0 text-sm leading-relaxed text-sub">{task.description}</p>
          )}
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
              <dd className="m-0 mt-1 text-sm font-medium text-ink">
                {editMode ? (
                  <input
                    value={draft.location}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    className="w-full rounded-lg border border-edge bg-panel px-2 py-1 text-sm text-ink outline-none ring-accent/35 focus:border-accent/45 focus:ring-2"
                  />
                ) : (
                  task.location ?? "Не указана"
                )}
              </dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Длительность</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">
                {editMode ? (
                  <input
                    value={draft.durationLabel}
                    onChange={(e) => setDraft((d) => ({ ...d, durationLabel: e.target.value }))}
                    className="w-full rounded-lg border border-edge bg-panel px-2 py-1 text-sm text-ink outline-none ring-accent/35 focus:border-accent/45 focus:ring-2"
                  />
                ) : (
                  task.durationLabel
                )}
              </dd>
            </div>
            <div className="rounded-xl border border-edge bg-panel px-3 py-2">
              <dt className="text-xs text-sub">Оплата</dt>
              <dd className="m-0 mt-1 text-sm font-medium text-ink">
                {editMode ? (
                  <input
                    type="number"
                    min={300}
                    value={draft.payRub}
                    onChange={(e) => setDraft((d) => ({ ...d, payRub: e.target.value }))}
                    className="w-full rounded-lg border border-edge bg-panel px-2 py-1 text-sm text-ink outline-none ring-accent/35 focus:border-accent/45 focus:ring-2"
                  />
                ) : (
                  formatRub(task.payRub)
                )}
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
          {apps.length > 0 ? (
            <p className="mt-1.5 m-0 text-xs leading-relaxed text-sub-deep">{DEMO_COPY.employerTaskStatusHint}</p>
          ) : null}
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
                return (
                  <li key={app.id} className="rounded-xl border border-edge bg-panel px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="m-0 text-sm font-medium text-ink">{name}</p>
                      <StatusBadge kind="application" status={app.status} />
                    </div>
                    <p className="m-0 mt-1 text-xs text-sub">Получен {formatDate(app.createdAt)}</p>
                    {app.status === "sent" || app.status === "awaiting" || app.status === "completed" ? (
                      <button
                        type="button"
                        onClick={() => advanceApplication(app)}
                        className="mt-2 text-xs font-medium text-accent underline-offset-2 transition hover:text-accent-bright hover:underline"
                      >
                        {app.status === "completed" ? "Подтвердить оплату" : "Принять в работу"}
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
              {editMode ? (
                <>
                  <button type="button" className="ui-btn-primary w-full justify-center" onClick={saveEdits}>
                    Сохранить изменения
                  </button>
                  <button
                    type="button"
                    className="ui-btn-ghost border-0 w-full justify-center"
                    onClick={() => {
                      setEditMode(false);
                      refresh();
                    }}
                  >
                    Отменить
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="ui-btn-ghost border-0 w-full justify-center" onClick={() => setEditMode(true)}>
                    Редактировать
                  </button>
                  <button type="button" className="ui-btn-ghost border-0 w-full justify-center" onClick={handleToggleClosed}>
                    {task.status === "closed" ? "Снова открыть" : "Завершить"}
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                    onClick={handleDelete}
                  >
                    Удалить
                  </button>
                </>
              )}
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
