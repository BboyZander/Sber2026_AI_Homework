"use client";

import { useId, useState } from "react";
import type { Application } from "@/types/application";
import type { Task } from "@/types/task";
import type { TeenProfile } from "@/types/user";
import { formatDate, formatRub } from "@/lib/helpers";
import { taskComparablePayRub } from "@/lib/task-payment";
import { setTeenEarningGoal } from "@/lib/teen-earning-goal";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { EarningGoalRing } from "@/components/teen/EarningGoalRing";
import { StatTile } from "@/components/teen/StatTile";

export function TeenFinanceTab({
  teen,
  apps,
  tasksById,
}: {
  teen: TeenProfile;
  apps: Application[];
  tasksById: Record<string, Task>;
}) {
  const [goalRub, setGoalRub] = useState(teen.earningGoal?.amount ?? 5000);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const goalInputId = useId();

  const resolveTask = (id: string) => tasksById[id] ?? null;
  const activity = computeTeenActivityStats(apps, resolveTask);
  const { earnedDemoRub, earnedThisMonthRub, expectedRub } = activity;

  const walletHistory = apps
    .filter((a) => a.status === "paid")
    .map((a) => ({ app: a, task: tasksById[a.taskId] }))
    .sort((a, b) => {
      const da = new Date(a.app.paidAt ?? a.app.createdAt).getTime();
      const db = new Date(b.app.paidAt ?? b.app.createdAt).getTime();
      return db - da;
    });

  function openGoalEditor() {
    setGoalDraft(String(goalRub));
    setEditingGoal(true);
  }

  function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(goalDraft.replace(/\s/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      void setTeenEarningGoal(parsed);
      setGoalRub(parsed);
    }
    setEditingGoal(false);
  }

  const progress = goalRub > 0 ? earnedDemoRub / goalRub : 0;
  const pct = goalRub > 0 ? Math.min(100, Math.round(progress * 100)) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Кольцо цели */}
      <div className="ui-card flex items-center gap-5 border-accent/20 bg-gradient-to-br from-accent/8 via-panel-muted/50 to-transparent">
        <div className="relative shrink-0">
          <EarningGoalRing progress={progress} size={72} strokeWidth={7} />
          <span className="absolute inset-0 flex items-center justify-center text-[0.65rem] font-bold tabular-nums text-ink">
            {goalRub > 0 ? `${pct}%` : "—"}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Цель заработка</p>
          <p className="mt-1 m-0 text-xl font-bold tabular-nums text-ink">{formatRub(earnedDemoRub)}</p>
          <p className="m-0 text-xs text-sub-deep">из {formatRub(goalRub)}</p>
          {editingGoal ? (
            <form onSubmit={saveGoal} className="mt-2 flex items-center gap-2">
              <label htmlFor={goalInputId} className="sr-only">Цель заработка, ₽</label>
              <input
                id={goalInputId}
                type="number"
                min={1}
                inputMode="numeric"
                autoFocus
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                className="w-24 rounded-lg border border-edge bg-panel px-2 py-1 text-sm text-ink focus:border-accent/50 focus:outline-none"
              />
              <button type="submit" className="text-xs font-medium text-accent transition hover:text-accent-bright">
                Сохранить
              </button>
              <button type="button" onClick={() => setEditingGoal(false)} className="text-xs font-medium text-sub transition hover:text-ink">
                Отмена
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={openGoalEditor}
              className="mt-1.5 inline-block text-xs font-medium text-accent transition hover:text-accent-bright"
            >
              Изменить цель →
            </button>
          )}
        </div>
      </div>

      {/* Три плитки */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="В этом месяце"
          value={formatRub(earnedThisMonthRub)}
          sub="оплачено в текущем месяце"
        />
        <StatTile
          label="Ожидается"
          value={formatRub(expectedRub)}
          sub="задачи «Принято» и «На проверке»"
        />
        <StatTile
          label="Всего получено"
          value={formatRub(earnedDemoRub)}
          sub="по всем оплаченным задачам"
        />
      </div>

      {/* История выплат */}
      <section>
        <SectionTitle title="История выплат" />
        {walletHistory.length === 0 ? (
          <div className="ui-card border-edge bg-panel-muted/75">
            <p className="m-0 text-sm text-sub">
              Пока пусто. Когда работодатель подтвердит оплату, здесь появится запись.
            </p>
          </div>
        ) : (
          <div className="ui-card border-edge-strong">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {walletHistory.map(({ app, task }) => (
                <li key={app.id} className="rounded-xl border border-edge bg-panel px-3 py-2">
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                    <p className="m-0 text-sm font-medium text-ink">{task?.title ?? `Задача ${app.taskId.slice(0, 8)}`}</p>
                    <p className="m-0 text-sm font-semibold text-accent-bright">
                      {formatRub(task ? taskComparablePayRub(task) : 0)}
                    </p>
                  </div>
                  <p className="m-0 mt-1 text-xs text-sub">
                    Зачислено {formatDate(app.paidAt ?? app.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
