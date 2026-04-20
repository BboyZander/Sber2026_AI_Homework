"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Application } from "@/types/application";
import type { TeenPreferredTaskFormat, TeenProfile } from "@/types/user";
import { AchievementCard } from "@/components/teen/AchievementCard";
import { XPProgress } from "@/components/teen/XPProgress";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { demoAchievements } from "@/data/demo-achievements";
import { toDashboardDisplayStats } from "@/data/teen-dashboard";
import { formatDate, formatRub, formatXp } from "@/lib/helpers";
import { taskComparablePayRub } from "@/lib/task-payment";
import { computeTeenActivityStats } from "@/lib/teen-activity-stats";
import { getTaskByIdForFlow } from "@/lib/employer-flow";
import { TEEN_APPLICATIONS_EVENT, getApplications, pushTeenToast } from "@/lib/teen-flow";
import { PROFILE_UPDATED_EVENT, updateTeenProfile, type ProfileUpdatedDetail } from "@/lib/profile-store";
import { buildTeenProfileHint } from "@/lib/teen-profile-hint";
import { teenInterestLabel } from "@/lib/teen-interest-labels";
import {
  TEEN_PREFERRED_FORMAT_LABELS,
  TEEN_PREFERRED_FORMATS,
  getTeenInterestCodes,
  profilePatchFromTeen,
  resolveSessionTeen,
  type TeenProfileEditablePatch,
  validateTeenProfilePatch,
} from "@/lib/teen-profile";
import { TEEN_TOASTS } from "@/lib/ui-copy";

type ProfileFormDraft = {
  name: string;
  ageInput: string;
  city: string;
  interests: string[];
  preferredTaskFormat: TeenPreferredTaskFormat;
};

function serializeTeenForm(d: ProfileFormDraft): string {
  return JSON.stringify({
    name: d.name.trim(),
    age: d.ageInput.trim(),
    city: d.city.trim(),
    interests: [...d.interests].sort(),
    fmt: d.preferredTaskFormat,
  });
}

function serializeTeenBaseline(p: TeenProfileEditablePatch): string {
  return JSON.stringify({
    name: p.name.trim(),
    age: String(p.age),
    city: p.city.trim(),
    interests: [...p.interests].sort(),
    fmt: p.preferredTaskFormat,
  });
}

const chipBtnClass =
  "touch-manipulation rounded-full border px-3 py-2 text-xs font-medium transition will-change-transform active:scale-[0.98] sm:py-1.5";

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="ui-card relative overflow-hidden border-edge bg-panel-muted/85">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/12 blur-2xl"
        aria-hidden
      />
      <p className="relative m-0 text-[0.7rem] font-semibold uppercase tracking-wider text-sub">{label}</p>
      <p className="relative mt-2 m-0 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {sub ? <p className="relative mt-1 m-0 text-xs text-sub">{sub}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-edge bg-panel px-4 py-2.5 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2";

export function TeenProfileView({ initialTeen }: { initialTeen: TeenProfile }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [teen, setTeen] = useState(initialTeen);
  const [apps, setApps] = useState<Application[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileFormDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; age?: string }>({});
  const [dirtyBaseline, setDirtyBaseline] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const interestCodes = useMemo(() => getTeenInterestCodes(), []);

  const isDirty = useMemo(
    () => Boolean(draft && dirtyBaseline !== null && serializeTeenForm(draft) !== dirtyBaseline),
    [draft, dirtyBaseline],
  );

  const refresh = useCallback(() => {
    const t = resolveSessionTeen(initialTeen);
    setTeen(t);
    setApps(getApplications(t.id));
  }, [initialTeen]);

  useEffect(() => {
    setMounted(true);
    refresh();
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "teen" && d.userId === initialTeen.id) refresh();
    }
    window.addEventListener(TEEN_APPLICATIONS_EVENT, refresh);
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => {
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, refresh);
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
    };
  }, [refresh, initialTeen.id]);

  useEffect(() => {
    if (!savedOk) return;
    const t = window.setTimeout(() => setSavedOk(false), 2600);
    return () => window.clearTimeout(t);
  }, [savedOk]);

  const beginEdit = useCallback(() => {
    const t = profilePatchFromTeen(teen);
    setDraft({
      name: t.name,
      ageInput: String(t.age),
      city: t.city,
      interests: [...t.interests],
      preferredTaskFormat: t.preferredTaskFormat,
    });
    setDirtyBaseline(serializeTeenBaseline(t));
    setFieldErrors({});
    setSavedOk(false);
    setEditing(true);
  }, [teen]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(null);
    setFieldErrors({});
    setDirtyBaseline(null);
  }, []);

  const saveProfile = useCallback(() => {
    if (!draft) return;
    const v = validateTeenProfilePatch({
      name: draft.name,
      ageStr: draft.ageInput,
      city: draft.city,
      interests: draft.interests,
      preferredTaskFormat: draft.preferredTaskFormat,
    });
    if (!v.ok) {
      setFieldErrors({ name: v.nameError, age: v.ageError });
      return;
    }
    updateTeenProfile(v.patch, teen.id);
    setEditing(false);
    setDraft(null);
    setFieldErrors({});
    setDirtyBaseline(null);
    refresh();
    setSavedOk(true);
    pushTeenToast(TEEN_TOASTS.profileSaved);
  }, [draft, teen.id, refresh]);

  const toggleInterest = useCallback((code: string) => {
    setDraft((d) => {
      if (!d) return d;
      const has = d.interests.includes(code);
      return {
        ...d,
        interests: has ? d.interests.filter((x) => x !== code) : [...d.interests, code],
      };
    });
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-48 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="h-24 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-28 animate-pulse rounded-2xl bg-panel-muted/50" />
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-panel-muted/50" />
          <div className="h-40 animate-pulse rounded-2xl bg-panel-muted/50" />
        </div>
      </div>
    );
  }

  const activity = computeTeenActivityStats(apps);
  const dash = toDashboardDisplayStats(teen, activity);
  const currentXp = dash.xp;
  const nextLevelXp = dash.nextLevelXp;
  const hint = buildTeenProfileHint(apps);
  const interests = teen.interests?.length ? teen.interests : [];
  const walletHistory = apps
    .filter((a) => a.status === "paid")
    .map((a) => ({ app: a, task: getTaskByIdForFlow(a.taskId) }))
    .sort((a, b) => new Date(b.app.createdAt).getTime() - new Date(a.app.createdAt).getTime());

  const sectionEase = reduceMotion ? undefined : ([0.22, 1, 0.36, 1] as const);

  return (
    <div className="ui-stack pb-2">
      <motion.header
        className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.15] via-panel/90 to-canvas p-5 shadow-xl shadow-accent-dark/20 sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: sectionEase }}
      >
        <div
          className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-accent-dark/12 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-panel-muted/60 ring-2 ring-accent/45 backdrop-blur-sm sm:h-28 sm:w-28">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent-bright/80">Уровень</span>
              <span className="text-3xl font-bold tabular-nums text-ink sm:text-4xl">{teen.level}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-accent-bright/90">Твой профиль</p>
                {!editing ? (
                  <button
                    type="button"
                    onClick={beginEdit}
                    title="Изменить имя, город, интересы и формат задач"
                    aria-label="Редактировать профиль"
                    className="ui-btn-ghost shrink-0 border-0 px-3 py-2 text-xs font-semibold text-accent transition hover:text-accent-bright sm:py-1.5"
                  >
                    Редактировать профиль
                  </button>
                ) : null}
              </div>
              <h1 className="mt-1 m-0 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{teen.name}</h1>
              <p className="mt-2 m-0 text-sm text-sub">
                {[teen.city, teen.age ? `${teen.age} лет` : null].filter(Boolean).join(" · ") || "Укажи город в редактировании профиля"}
              </p>
              <p className="mt-1.5 m-0 text-xs text-sub">
                Формат задач: {TEEN_PREFERRED_FORMAT_LABELS[teen.preferredTaskFormat ?? "any"]}
              </p>
              {interests.length > 0 ? (
                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                  {interests.map((code) => (
                    <li
                      key={code}
                      className="rounded-full border border-edge-strong bg-panel-muted/50 px-3 py-1 text-xs font-medium text-ink"
                    >
                      {teenInterestLabel(code)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 m-0 text-xs text-sub">
                  Интересы помогут подобрать задачи — выбери теги в «Редактировать профиль».
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0 rounded-xl border border-edge bg-canvas/40 px-4 py-3 text-right sm:text-left">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Опыт</p>
            <p className="mt-1 m-0 text-xl font-bold tabular-nums text-ink">{formatXp(currentXp)} XP</p>
            <p className="mt-0.5 m-0 text-xs text-sub">до уровня {teen.level + 1} — {formatXp(nextLevelXp)} XP</p>
            <p className="mt-2 m-0 text-xs font-semibold uppercase tracking-wider text-sub">Кошелёк</p>
            <p className="mt-0.5 m-0 text-sm font-semibold text-accent-bright">{formatRub(dash.earnedDemoRub)}</p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {editing && draft ? (
            <motion.div
              key="teen-edit"
              layout
              className="relative mt-5 flex max-h-[min(72dvh,560px)] flex-col overflow-hidden rounded-xl border border-edge-strong bg-canvas/55 shadow-inner shadow-black/5 backdrop-blur-sm sm:max-h-none"
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <div className="max-h-[min(60dvh,480px)] flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 pb-2 sm:max-h-none sm:overflow-visible sm:p-5 sm:pb-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Редактирование</p>
                <p className="mt-1 m-0 text-sm text-sub">Поправь поля и нажми «Сохранить».</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-1">
                    <span className="mb-1 block text-xs font-medium text-sub">Имя</span>
                    <input
                      className={inputClass}
                      value={draft.name}
                      onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                      autoComplete="name"
                    />
                    {fieldErrors.name ? <p className="m-0 mt-1 text-xs text-rose-300">{fieldErrors.name}</p> : null}
                  </label>
                  <label className="block sm:col-span-1">
                    <span className="mb-1 block text-xs font-medium text-sub">Возраст</span>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={draft.ageInput}
                      onChange={(e) => setDraft((d) => (d ? { ...d, ageInput: e.target.value } : d))}
                      aria-invalid={Boolean(fieldErrors.age)}
                    />
                    {fieldErrors.age ? <p className="m-0 mt-1 text-xs text-rose-300">{fieldErrors.age}</p> : null}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-sub">Город</span>
                    <input
                      className={inputClass}
                      value={draft.city}
                      onChange={(e) => setDraft((d) => (d ? { ...d, city: e.target.value } : d))}
                      placeholder="Например, Москва"
                      autoComplete="address-level2"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-sub">Интересы</span>
                    <div className="flex flex-wrap gap-2">
                      {interestCodes.map((code) => {
                        const on = draft.interests.includes(code);
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => toggleInterest(code)}
                            className={`${chipBtnClass} ${
                              on
                                ? "border-accent/55 bg-accent/18 text-ink ring-1 ring-accent/25"
                                : "border-edge bg-panel-muted/50 text-sub hover:border-edge-strong hover:text-ink"
                            }`}
                          >
                            {teenInterestLabel(code)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-sub">Предпочтительный формат задач</span>
                    <div className="flex flex-wrap gap-2">
                      {TEEN_PREFERRED_FORMATS.map((fmt) => {
                        const on = draft.preferredTaskFormat === fmt;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setDraft((d) => (d ? { ...d, preferredTaskFormat: fmt } : d))}
                            className={`${chipBtnClass} ${
                              on
                                ? "border-accent/55 bg-accent/18 text-ink ring-1 ring-accent/25"
                                : "border-edge bg-panel-muted/50 text-sub hover:border-edge-strong hover:text-ink"
                            }`}
                          >
                            {TEEN_PREFERRED_FORMAT_LABELS[fmt]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 z-[1] flex flex-wrap items-center justify-end gap-2 border-t border-edge/80 bg-canvas/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:static sm:z-0 sm:border-0 sm:bg-transparent sm:px-5 sm:pb-5 sm:pt-0 sm:backdrop-blur-none">
                <button type="button" className="ui-btn-ghost border-0 px-4 py-2.5 sm:py-2" onClick={cancelEdit}>
                  Отмена
                </button>
                <button
                  type="button"
                  className="ui-btn-primary border-0 px-4 py-2.5 disabled:pointer-events-none disabled:opacity-45 sm:py-2"
                  onClick={saveProfile}
                  disabled={!isDirty}
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {savedOk ? (
          <motion.p
            key="teen-saved"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
            className="mb-1 mt-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-center text-xs font-medium text-accent-bright"
          >
            Профиль сохранён
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!editing ? (
        <>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06, ease: sectionEase }}
          >
            <XPProgress currentXp={currentXp} nextLevelXp={nextLevelXp} />
          </motion.div>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.1, ease: sectionEase }}
          >
            <SectionTitle title="Активность" />
            <p className="-mt-1 mb-4 text-sm text-sub">
              Считаем из откликов в этом браузере (демо и раздел «Отклики»).
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Отклики" value={String(activity.applicationsCount)} sub="всего в списке" />
              <StatTile label="Завершено" value={String(activity.completedTasksCount)} sub="«Ждёт подтверждения» и «Оплачено»" />
              <StatTile label="Заработано (демо)" value={formatRub(activity.earnedDemoRub)} sub="по задачам со статусом «Оплачено»" />
            </div>
          </motion.section>

          <motion.section
            className="ui-card border-accent/25 bg-gradient-to-br from-accent/[0.08] via-panel-muted/50 to-transparent"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.14, ease: sectionEase }}
          >
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-accent-bright">{hint.eyebrow}</p>
            <h2 className="mt-2 m-0 text-lg font-semibold text-ink">{hint.title}</h2>
            <p className="mt-2 m-0 text-sm leading-relaxed text-sub">{hint.body}</p>
            {hint.href && hint.cta ? (
              <Link
                href={hint.href}
                className="mt-4 inline-flex text-sm font-semibold text-accent transition hover:text-accent-bright"
              >
                {hint.cta} →
              </Link>
            ) : null}
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.18, ease: sectionEase }}
          >
            <SectionTitle title="Достижения" />
            <p className="-mt-1 mb-4 text-sm text-sub">
              Награды за шаги в сервисе: копи XP и открывай уровни.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {demoAchievements.map((a, i) => (
                <AchievementCard key={a.id} achievement={a} index={i} />
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.22, ease: sectionEase }}
          >
            <SectionTitle title="История кошелька" />
            {walletHistory.length === 0 ? (
              <div className="ui-card border-edge bg-panel-muted/75">
                <p className="m-0 text-sm text-sub">
                  Пока пусто. Когда работодатель подтвердит оплату, здесь появится запись с суммой.
                </p>
              </div>
            ) : (
              <div className="ui-card border-edge-strong">
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {walletHistory.map(({ app, task }) => (
                    <li key={app.id} className="rounded-xl border border-edge bg-panel px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="m-0 text-sm font-medium text-ink">{task?.title ?? `Задача ${app.taskId}`}</p>
                        <p className="m-0 text-sm font-semibold text-accent-bright">
                          {formatRub(task ? taskComparablePayRub(task) : 0)}
                        </p>
                      </div>
                      <p className="m-0 mt-1 text-xs text-sub">Зачислено {formatDate(app.createdAt)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>
        </>
      ) : null}
    </div>
  );
}
