"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { EmployerProfile } from "@/types/user";
import type { TaskCategory } from "@/lib/constants";
import { TASK_CATEGORIES } from "@/lib/constants";
import {
  EMPLOYER_CUSTOMER_TYPE_LABELS,
  EMPLOYER_CUSTOMER_TYPES,
  EMPLOYER_TAG_SUGGESTIONS,
  profilePatchFromEmployer,
  resolveSessionEmployer,
  taskCategoryLabel,
  normalizeTags,
  validateEmployerCabinetPatch,
  type EmployerCabinetPatch,
} from "@/lib/employer-profile";
import { PROFILE_UPDATED_EVENT, updateEmployerProfile, type ProfileUpdatedDetail } from "@/lib/profile-store";
import { pushEmployerToast } from "@/lib/employer-flow";
import { EMPLOYER_TOASTS } from "@/lib/ui-copy";

const inputClass =
  "w-full rounded-xl border border-edge bg-panel px-4 py-2.5 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2";

const chipBtnClass =
  "touch-manipulation rounded-full border px-3 py-2 text-xs font-medium transition will-change-transform active:scale-[0.98] sm:py-1.5";

function serializeEmployerCabinet(d: EmployerCabinetPatch): string {
  return JSON.stringify({
    company: d.companyName.trim(),
    city: d.city.trim(),
    ct: d.customerType,
    cats: [...d.taskCategories].sort(),
    desc: d.cabinetDescription.trim(),
    tags: normalizeTags(d.cabinetTags)
      .map((t) => t.toLowerCase())
      .sort(),
  });
}

export function EmployerCabinetView({ initialEmployer }: { initialEmployer: EmployerProfile }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [employer, setEmployer] = useState(initialEmployer);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EmployerCabinetPatch | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ company?: string; description?: string }>({});
  const [dirtyBaseline, setDirtyBaseline] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const refresh = useCallback(() => {
    setEmployer(resolveSessionEmployer(initialEmployer));
  }, [initialEmployer]);

  useEffect(() => {
    setMounted(true);
    refresh();
    function onProfile(e: Event) {
      const d = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (d?.role === "employer" && d.userId === initialEmployer.id) refresh();
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
  }, [refresh, initialEmployer.id]);

  useEffect(() => {
    if (!savedOk) return;
    const t = window.setTimeout(() => setSavedOk(false), 2600);
    return () => window.clearTimeout(t);
  }, [savedOk]);

  const isDirty = useMemo(
    () => Boolean(draft && dirtyBaseline !== null && serializeEmployerCabinet(draft) !== dirtyBaseline),
    [draft, dirtyBaseline],
  );

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || !editing) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 96), 280)}px`;
  }, [draft?.cabinetDescription, editing]);

  const beginEdit = useCallback(() => {
    const initial = profilePatchFromEmployer(employer);
    setDraft(initial);
    setDirtyBaseline(serializeEmployerCabinet(initial));
    setTagInput("");
    setFieldErrors({});
    setSavedOk(false);
    setEditing(true);
  }, [employer]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(null);
    setTagInput("");
    setFieldErrors({});
    setDirtyBaseline(null);
  }, []);

  const saveCabinet = useCallback(() => {
    if (!draft) return;
    const v = validateEmployerCabinetPatch(draft);
    if (!v.ok) {
      setFieldErrors({ company: v.companyError, description: v.descriptionError });
      return;
    }
    updateEmployerProfile(v.patch, employer.id);
    setEditing(false);
    setDraft(null);
    setTagInput("");
    setFieldErrors({});
    setDirtyBaseline(null);
    refresh();
    setSavedOk(true);
    pushEmployerToast(EMPLOYER_TOASTS.cabinetSaved);
  }, [draft, employer.id, refresh]);

  const toggleCategory = useCallback((code: TaskCategory) => {
    setDraft((d) => {
      if (!d) return d;
      const has = d.taskCategories.includes(code);
      return {
        ...d,
        taskCategories: has ? d.taskCategories.filter((c) => c !== code) : [...d.taskCategories, code],
      };
    });
  }, []);

  const toggleTagSuggestion = useCallback((tag: string) => {
    setDraft((d) => {
      if (!d) return d;
      const key = tag.toLowerCase();
      const has = d.cabinetTags.some((t) => t.toLowerCase() === key);
      const nextTags = has ? d.cabinetTags.filter((t) => t.toLowerCase() !== key) : [...d.cabinetTags, tag];
      return { ...d, cabinetTags: nextTags.slice(0, 8) };
    });
  }, []);

  const removeTag = useCallback((tag: string) => {
    setDraft((d) => (d ? { ...d, cabinetTags: d.cabinetTags.filter((t) => t !== tag) } : d));
  }, []);

  const addTagsFromInput = useCallback(() => {
    const parts = tagInput
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setDraft((d) => {
      if (!d) return d;
      const merged = [...d.cabinetTags];
      for (const p of parts) {
        const key = p.toLowerCase();
        if (merged.some((t) => t.toLowerCase() === key)) continue;
        merged.push(p.slice(0, 24));
        if (merged.length >= 8) break;
      }
      return { ...d, cabinetTags: merged };
    });
    setTagInput("");
  }, [tagInput]);

  const sectionEase = reduceMotion ? undefined : ([0.22, 1, 0.36, 1] as const);

  const summaryCategories = useMemo(
    () => (employer.taskCategories?.length ? employer.taskCategories : []),
    [employer.taskCategories],
  );

  const summaryTags = useMemo(
    () => (employer.cabinetTags?.length ? employer.cabinetTags : []),
    [employer.cabinetTags],
  );

  const registryMode = useMemo(() => {
    if (editing && draft) return draft.customerType;
    return employer.customerType ?? "legal_entity";
  }, [editing, draft, employer.customerType]);

  const innDisplay = useMemo(() => {
    return registryMode === "sole_proprietor" ? (employer.innIp ?? "—") : (employer.inn ?? "—");
  }, [registryMode, employer.inn, employer.innIp]);

  const ogrnDisplay = useMemo(() => {
    return registryMode === "sole_proprietor" ? (employer.ogrnip ?? "—") : (employer.ogrn ?? "—");
  }, [registryMode, employer.ogrn, employer.ogrnip]);

  const ogrnLabel = registryMode === "sole_proprietor" ? "ОГРНИП" : "ОГРН";

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-40 animate-pulse rounded-2xl bg-panel-muted/50" />
        <div className="h-32 animate-pulse rounded-2xl bg-panel-muted/50" />
      </div>
    );
  }

  return (
    <div className="ui-stack pb-2">
      <motion.header
        className="relative overflow-hidden rounded-2xl border border-edge-strong bg-gradient-to-br from-panel-muted/95 via-panel to-canvas p-5 shadow-lg sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: sectionEase }}
      >
        <div
          className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Данные кабинета</p>
            <h1 className="mt-1 m-0 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{employer.companyName}</h1>
            <p className="mt-2 m-0 text-sm text-sub">
              {[employer.city, EMPLOYER_CUSTOMER_TYPE_LABELS[employer.customerType ?? "legal_entity"]]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={beginEdit}
              title="Изменить данные кабинета"
              aria-label="Редактировать данные кабинета"
              className="ui-btn-ghost shrink-0 border border-edge px-3 py-2 text-xs font-semibold text-ink transition hover:border-edge-strong sm:py-1.5"
            >
              Редактировать
            </button>
          ) : null}
        </div>

        <div
          className="relative mt-4 rounded-xl border border-dashed border-edge/90 bg-panel-muted/35 px-4 py-3 sm:px-5"
          role="region"
          aria-label="Реквизиты"
        >
          <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Реквизиты</p>
          <dl className="mt-3 m-0 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="m-0 text-xs font-medium text-sub">ИНН</dt>
              <dd className="mt-0.5 m-0 font-mono text-[0.9375rem] tabular-nums tracking-tight text-ink">
                {innDisplay}
              </dd>
            </div>
            <div>
              <dt className="m-0 text-xs font-medium text-sub">{ogrnLabel}</dt>
              <dd className="mt-0.5 m-0 font-mono text-[0.9375rem] tabular-nums tracking-tight text-ink">
                {ogrnDisplay}
              </dd>
            </div>
          </dl>
        </div>

        {!editing ? (
          <div className="relative mt-5 rounded-xl border border-edge bg-canvas/50 p-4 backdrop-blur-sm sm:p-5">
            <p className="m-0 text-[0.65rem] font-semibold uppercase tracking-wider text-sub">Сводка</p>
            <dl className="mt-3 m-0 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="m-0 text-xs font-medium text-sub">Категории задач</dt>
                <dd className="m-0 mt-1 text-ink">
                  {summaryCategories.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {summaryCategories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-edge-strong bg-panel-muted/60 px-2.5 py-0.5 text-xs font-medium"
                        >
                          {taskCategoryLabel(c)}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-sub">Не указано</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-xs font-medium text-sub">Теги</dt>
                <dd className="m-0 mt-1 text-ink">
                  {summaryTags.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {summaryTags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-edge bg-panel px-2.5 py-0.5 text-xs font-medium text-sub"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-sub">Нет тегов</span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="m-0 text-xs font-medium text-sub">О компании</dt>
                <dd className="m-0 mt-1 leading-relaxed text-ink">
                  {employer.cabinetDescription?.trim() ? (
                    employer.cabinetDescription
                  ) : (
                    <span className="text-sub">Краткое описание появится после заполнения.</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {editing && draft ? (
            <motion.div
              key="employer-edit"
              layout
              className="relative mt-5 flex max-h-[min(76dvh,600px)] flex-col overflow-hidden rounded-xl border border-edge-strong bg-canvas/55 backdrop-blur-sm sm:max-h-none"
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <div className="max-h-[min(62dvh,520px)] flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 pb-2 sm:max-h-none sm:overflow-visible sm:p-5 sm:pb-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Редактирование</p>
                <p className="mt-1 m-0 text-sm text-sub">Проверь поля и сохрани изменения.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-sub">
                      {draft.customerType === "sole_proprietor"
                        ? "Наименование: ИП + ФИО"
                        : "Название компании или отображаемое имя"}
                    </span>
                    <input
                      className={inputClass}
                      value={draft.companyName}
                      onChange={(e) => setDraft((d) => (d ? { ...d, companyName: e.target.value } : d))}
                      autoComplete="organization"
                    />
                    {fieldErrors.company ? (
                      <p className="m-0 mt-1 text-xs text-rose-300">{fieldErrors.company}</p>
                    ) : null}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-sub">Город</span>
                    <input
                      className={inputClass}
                      value={draft.city}
                      onChange={(e) => setDraft((d) => (d ? { ...d, city: e.target.value } : d))}
                      placeholder="Город присутствия"
                      autoComplete="address-level2"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-sub">Тип заказчика</span>
                    <div className="flex flex-wrap gap-2">
                      {EMPLOYER_CUSTOMER_TYPES.map((t) => {
                        const on = draft.customerType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setDraft((d) => (d ? { ...d, customerType: t } : d))}
                            className={`touch-manipulation rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition will-change-transform active:scale-[0.98] sm:py-2 sm:text-sm ${
                              on
                                ? "border-accent/50 bg-accent/12 text-ink ring-1 ring-accent/25"
                                : "border-edge bg-panel-muted/40 text-sub hover:border-edge-strong hover:text-ink"
                            }`}
                          >
                            {EMPLOYER_CUSTOMER_TYPE_LABELS[t]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-sub">Категории задач</span>
                    <div className="flex flex-wrap gap-2">
                      {[...TASK_CATEGORIES].map((c) => {
                        const on = draft.taskCategories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleCategory(c)}
                            className={`${chipBtnClass} ${
                              on
                                ? "border-accent/55 bg-accent/15 text-ink ring-1 ring-accent/25"
                                : "border-edge bg-panel-muted/50 text-sub hover:border-edge-strong hover:text-ink"
                            }`}
                          >
                            {taskCategoryLabel(c)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-sub">Краткое описание</span>
                    <textarea
                      ref={descRef}
                      className={`${inputClass} max-h-[280px] min-h-[6rem] resize-none overflow-hidden py-3`}
                      rows={2}
                      value={draft.cabinetDescription}
                      onChange={(e) => setDraft((d) => (d ? { ...d, cabinetDescription: e.target.value } : d))}
                      placeholder="Направление работы, аудитория, ключевые требования к исполнителям."
                    />
                    {fieldErrors.description ? (
                      <p className="m-0 mt-1 text-xs text-rose-300">{fieldErrors.description}</p>
                    ) : null}
                  </label>
                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-medium text-sub">Теги</span>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {EMPLOYER_TAG_SUGGESTIONS.map((tag) => {
                        const on = draft.cabinetTags.some((t) => t.toLowerCase() === tag.toLowerCase());
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTagSuggestion(tag)}
                            className={`${chipBtnClass} ${
                              on
                                ? "border-accent/55 bg-accent/15 text-ink ring-1 ring-accent/25"
                                : "border-edge bg-panel-muted/50 text-sub hover:border-edge-strong hover:text-ink"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                    {draft.cabinetTags.length ? (
                      <ul className="mb-3 flex list-none flex-wrap gap-2 p-0">
                        {draft.cabinetTags.map((t) => (
                          <li
                            key={t}
                            className="flex min-h-[2rem] items-center gap-1 rounded-full border border-edge-strong bg-panel px-2.5 py-1 text-xs font-medium text-ink"
                          >
                            {t}
                            <button
                              type="button"
                              className="touch-manipulation min-h-[2.25rem] min-w-[2.25rem] border-0 bg-transparent p-0 text-base leading-none text-sub hover:text-rose-300 sm:min-h-0 sm:min-w-0"
                              aria-label={`Удалить тег ${t}`}
                              onClick={() => removeTag(t)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        className={inputClass}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTagsFromInput();
                          }
                        }}
                        placeholder="Свой тег — Enter или «Добавить»"
                      />
                      <button
                        type="button"
                        className="ui-btn-ghost shrink-0 border border-edge px-4 py-2.5 text-sm sm:py-2"
                        onClick={addTagsFromInput}
                      >
                        Добавить
                      </button>
                    </div>
                    <p className="mt-2 m-0 text-[0.65rem] text-sub">До 8 тегов, до 24 символов каждый.</p>
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
                  onClick={saveCabinet}
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
            key="employer-saved"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
            className="mb-1 mt-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-center text-xs font-medium text-accent-bright"
          >
            Данные кабинета сохранены
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!editing ? (
        <motion.section
          className="ui-card border-edge bg-panel-muted/50"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.06, ease: sectionEase }}
        >
          <p className="m-0 text-sm font-medium text-ink">Задачи и отклики</p>
          <p className="mt-2 m-0 text-sm leading-relaxed text-sub">
            Управление публикациями — в разделах ниже. Название компании в новых задачах подставится из этих данных.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/employer/dashboard"
              className="ui-btn-ghost border border-edge px-4 py-2 text-sm no-underline hover:no-underline"
            >
              На главную кабинета
            </Link>
            <Link
              href="/employer/tasks"
              className="ui-btn-primary border-0 px-4 py-2 text-sm no-underline hover:no-underline"
            >
              Мои задачи
            </Link>
          </div>
        </motion.section>
      ) : null}
    </div>
  );
}
