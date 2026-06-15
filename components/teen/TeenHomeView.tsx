"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatRub } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/client";
import { rowToTask, type TaskRow } from "@/lib/supabase/mappers";
import { taskComparablePayRub } from "@/lib/task-payment";
import {
  TEEN_APPLICATIONS_EVENT,
  getApplicationsCached,
  loadApplications,
} from "@/lib/teen-applications-client";
import {
  TEEN_EARNING_GOAL_EVENT,
  getTeenEarningGoal,
  setTeenEarningGoal,
} from "@/lib/teen-earning-goal";
import { RecommendedTasks } from "@/components/teen/RecommendedTasks";
import { TeenTasksCatalogView } from "@/components/teen/TeenTasksCatalogView";
import type { TeenProfile } from "@/types/user";

type ActiveTaskInfo = { taskId: string; title: string; statusLabel: string } | null;

/** Круговая диаграмма прогресса к цели заработка (демо). */
function EarningGoalRing({ progress, size = 56, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  // Радиус чуть меньше половины кадра — иначе скруглённые концы дуги (strokeLinecap="round") вылезают за viewBox и обрезаются.
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden="true">
      <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-panel-muted/70" />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="stroke-accent-bright transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
  );
}

export function TeenHomeView({ teen: initialTeen }: { teen: TeenProfile }) {
  const [teenName, setTeenName] = useState(initialTeen.name);
  const [teenId, setTeenId] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveTaskInfo>(null);
  const [earnedRub, setEarnedRub] = useState(0);
  const [goalRub, setGoalRub] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const goalInputId = useId();

  useEffect(() => {
    let alive = true;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !alive) return;
      setTeenId(user.id);
      setGoalRub(getTeenEarningGoal(user.id));

      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      if (alive && prof?.name) setTeenName(prof.name as string);

      await loadApplications();
      if (!alive) return;
      const apps = getApplicationsCached();

      const ids = [...new Set(apps.map((a) => a.taskId))];
      const tasksById: Record<string, ReturnType<typeof rowToTask>> = {};
      if (ids.length > 0) {
        const { data } = await supabase.from("tasks").select("*").in("id", ids);
        for (const row of (data ?? []) as TaskRow[]) tasksById[row.id] = rowToTask(row);
      }
      if (!alive) return;

      const byPriority =
        apps.find((a) => a.status === "accepted") ??
        apps.find((a) => a.status === "submitted") ??
        apps.find((a) => a.status === "applied");
      setActive(
        byPriority
          ? {
              taskId: byPriority.taskId,
              title: tasksById[byPriority.taskId]?.title ?? "Задача",
              statusLabel: APPLICATION_STATUS_LABELS[byPriority.status],
            }
          : null,
      );

      let earned = 0;
      for (const a of apps) {
        if (a.status === "paid" && tasksById[a.taskId]) {
          earned += taskComparablePayRub(tasksById[a.taskId]);
        }
      }
      setEarnedRub(earned);
    }

    function onGoal() {
      if (teenId) setGoalRub(getTeenEarningGoal(teenId));
    }

    void load();
    window.addEventListener(TEEN_APPLICATIONS_EVENT, load);
    window.addEventListener(TEEN_EARNING_GOAL_EVENT, onGoal);
    return () => {
      alive = false;
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, load);
      window.removeEventListener(TEEN_EARNING_GOAL_EVENT, onGoal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openGoalEditor() {
    setGoalDraft(String(goalRub));
    setEditingGoal(true);
  }

  function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(goalDraft.replace(/\s/g, ""));
    if (Number.isFinite(parsed) && parsed > 0 && teenId) {
      setTeenEarningGoal(teenId, parsed);
      setGoalRub(parsed);
    }
    setEditingGoal(false);
  }

  return (
    <div className="ui-stack">
      <header>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-accent/80">Главная</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Привет, {teenName}!
        </h1>
      </header>

      {/* Тонкая сводка: активная задача + заработок */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="ui-card flex flex-col justify-between border-accent/20 bg-gradient-to-br from-accent/8 via-panel-muted/50 to-transparent">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Активная задача</p>
          {active ? (
            <Link
              href={`/teen/tasks/${active.taskId}`}
              className="mt-1.5 block text-inherit no-underline"
            >
              <p className="m-0 line-clamp-1 text-base font-semibold text-ink">{active.title}</p>
              <p className="mt-0.5 m-0 text-xs font-medium text-accent-bright">{active.statusLabel}</p>
            </Link>
          ) : (
            <div className="mt-1.5">
              <p className="m-0 text-sm text-sub">Пока нет активной задачи.</p>
              <p className="mt-1 m-0 text-xs text-sub-deep">Выбери подработку ниже и откликнись.</p>
            </div>
          )}
          <Link
            href="/teen/applications"
            className="mt-3 inline-block text-xs font-medium text-accent no-underline transition hover:text-accent-bright"
          >
            Раздел «В работе» →
          </Link>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Заработано</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="m-0 text-xl font-bold tabular-nums leading-none text-ink">{formatRub(earnedRub)}</p>
              <p className="m-0 mt-1 text-xs text-sub-deep">из цели {formatRub(goalRub)}</p>
            </div>
            <div className="relative mr-1 mt-0.5 shrink-0">
              <EarningGoalRing progress={goalRub > 0 ? earnedRub / goalRub : 0} />
              <span className="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold tabular-nums text-ink">
                {goalRub > 0 ? `${Math.min(100, Math.round((earnedRub / goalRub) * 100))}%` : "—"}
              </span>
            </div>
          </div>
          {editingGoal ? (
            <form onSubmit={saveGoal} className="mt-3 flex items-center gap-2">
              <label htmlFor={goalInputId} className="sr-only">
                Цель заработка, ₽
              </label>
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
              <button
                type="button"
                onClick={() => setEditingGoal(false)}
                className="text-xs font-medium text-sub transition hover:text-ink"
              >
                Отмена
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={openGoalEditor}
              className="mt-auto inline-block self-start pt-2 text-xs font-medium text-accent no-underline transition hover:text-accent-bright"
            >
              Изменить цель →
            </button>
          )}
        </div>
      </div>

      <RecommendedTasks />

      <TeenTasksCatalogView />
    </div>
  );
}
