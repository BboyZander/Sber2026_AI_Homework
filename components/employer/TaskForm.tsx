"use client";

import { motion } from "framer-motion";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { DurationBucket, TaskCategory, WorkFormat } from "@/lib/constants";
import {
  CATEGORY_LABELS,
  DURATION_BUCKETS,
  DURATION_BUCKET_LABELS,
  TASK_CATEGORIES,
  WORK_FORMAT_LABELS,
  WORK_FORMATS,
} from "@/lib/constants";
import { publishTask } from "@/lib/employer-flow";
import { formatRub } from "@/lib/helpers";
import type { Task, TaskPaymentType } from "@/types/task";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import { CTAButton } from "@/components/shared/CTAButton";
import { StatusBadge } from "@/components/shared/StatusBadge";

type FormData = {
  title: string;
  description: string;
  category: TaskCategory;
  workFormat: WorkFormat;
  location: string;
  durationBucket: DurationBucket;
  durationLabel: string;
  paymentType: TaskPaymentType;
  fixedPayRub: string;
  hourlyRate: string;
  estimatedHours: string;
  minAge: string;
  maxAge: string;
  deadline: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  title: "",
  description: "",
  category: "other",
  workFormat: "offline",
  location: "",
  durationBucket: "short",
  durationLabel: "",
  paymentType: "fixed",
  fixedPayRub: "",
  hourlyRate: "",
  estimatedHours: "",
  minAge: "14",
  maxAge: "17",
  deadline: "",
};

function formatDurationLabel(bucket: DurationBucket, raw: string): string {
  const t = raw.trim();
  if (t) return t;
  return bucket === "short" ? "до 3 ч" : "4+ ч";
}

function validateField(field: keyof FormData, values: FormData): string | undefined {
  const title = values.title.trim();
  const desc = values.description.trim();
  const location = values.location.trim();
  const minAge = Number(values.minAge);
  const maxAge = Number(values.maxAge);

  if (field === "title") {
    if (title.length < 6) return "Название — не короче 6 символов.";
  }
  if (field === "description") {
    if (desc.length < 20) return "Описание — от 20 символов.";
  }
  if (field === "location") {
    if (!location) return "Укажите город или точку.";
  }
  if (field === "durationLabel") {
    if (!formatDurationLabel(values.durationBucket, values.durationLabel).trim()) {
      return "Укажите длительность.";
    }
  }
  if (field === "fixedPayRub") {
    if (values.paymentType !== "fixed") return undefined;
    const n = Number(values.fixedPayRub);
    if (!Number.isFinite(n) || n < 300) return "Минимум 300 ₽ за задачу.";
  }
  if (field === "hourlyRate") {
    if (values.paymentType !== "hourly") return undefined;
    const n = Number(String(values.hourlyRate).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return "Укажите ставку в час (число больше 0).";
  }
  if (field === "estimatedHours") {
    if (values.paymentType !== "hourly") return undefined;
    const n = Number(String(values.estimatedHours).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return "Укажите ожидаемую длительность в часах (число больше 0).";
  }
  if (field === "minAge" || field === "maxAge") {
    if (!Number.isFinite(minAge) || !Number.isFinite(maxAge)) return "Возраст — числом.";
    if (minAge < 14 || maxAge > 18 || minAge > maxAge) return "Диапазон 14–18, от ≤ до.";
  }
  if (field === "deadline") {
    if (!values.deadline) return "Укажите срок.";
    const d = new Date(values.deadline).getTime();
    if (Number.isNaN(d) || d < Date.now() - 60_000) return "Срок не в прошлом.";
  }
  return undefined;
}

function validateAll(values: FormData): FormErrors {
  const fields: Array<keyof FormData> = [
    "title",
    "description",
    "location",
    "durationLabel",
    "fixedPayRub",
    "hourlyRate",
    "estimatedHours",
    "minAge",
    "maxAge",
    "deadline",
  ];
  const next: FormErrors = {};
  for (const f of fields) {
    const err = validateField(f, values);
    if (err) next[f] = err;
  }
  return next;
}

function FieldError({ text }: { text?: string }) {
  return text ? <p className="m-0 mt-1 text-xs text-rose-300">{text}</p> : null;
}

function previewComparablePay(values: FormData): number {
  if (values.paymentType === "fixed") {
    return Number(values.fixedPayRub);
  }
  const rate = Number(values.hourlyRate);
  const h = Number(values.estimatedHours.replace(",", "."));
  if (!Number.isFinite(rate) || !Number.isFinite(h)) return NaN;
  return Math.round(rate * h);
}

export function TaskForm() {
  const [values, setValues] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState<Task | null>(null);
  const [publishing, setPublishing] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (!submitted) return;
    setErrors(validateAll(values));
  }, [values, submitted]);

  function onBlurField(field: keyof FormData) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  }

  function autosizeDescription() {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }

  const previewDuration = formatDurationLabel(values.durationBucket, values.durationLabel);
  const previewPayTotal = previewComparablePay(values);
  const previewAge = `${values.minAge || "14"}-${values.maxAge || "17"} лет`;
  const canSubmit = useMemo(() => Object.keys(validateAll(values)).length === 0, [values]);

  if (created) {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ui-card relative overflow-hidden border-accent/35 bg-accent-soft shadow-lg shadow-accent/10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="m-0 text-xs font-semibold uppercase tracking-wider text-accent-bright">Готово</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Задача опубликована</h2>
            <p className="mt-2 text-sm text-sub">
              Задача в списке «Мои задачи» и доступна подросткам в каталоге.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CTAButton href="/employer/tasks">К списку</CTAButton>
              <CTAButton href={`/employer/tasks/${created.id}`} variant="ghost">
                Открыть задачу
              </CTAButton>
              <button
                type="button"
                className="ui-btn-ghost border-0"
                onClick={() => {
                  setCreated(null);
                  setValues(initialForm);
                  setErrors({});
                  setSubmitted(false);
                }}
              >
                Создать ещё одну
              </button>
            </div>
          </div>
        </div>
        <motion.article
          className="ui-card border-edge-strong"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="m-0 text-base font-semibold text-ink">{created.title}</h3>
            <StatusBadge kind="task" status="published" />
          </div>
          <p className="mt-2 text-sm text-sub">{created.description}</p>
          <p className="m-0 mt-2 text-xs font-medium text-ink">{taskPaymentEmployerSummary(created)}</p>
          <p className="m-0 mt-1 text-xs text-sub">
            {CATEGORY_LABELS[created.category]} · {WORK_FORMAT_LABELS[created.workFormat]} · {created.durationLabel} ·{" "}
            {created.location || "Локация уточняется"}
          </p>
        </motion.article>
      </motion.div>
    );
  }

  return (
    <form
      className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] ${publishing ? "pointer-events-none opacity-75" : ""}`}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        const all = validateAll(values);
        setErrors(all);
        if (Object.keys(all).length > 0) return;
        setPublishing(true);
        window.setTimeout(() => {
          const rate = Number(values.hourlyRate);
          const h = Number(values.estimatedHours.replace(",", "."));
          const nextTask: Task = publishTask({
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category,
            paymentType: values.paymentType,
            paymentAmount:
              values.paymentType === "fixed" ? Number(values.fixedPayRub) : rate,
            estimatedHours: values.paymentType === "hourly" ? h : undefined,
            workFormat: values.workFormat,
            durationBucket: values.durationBucket,
            durationLabel: previewDuration,
            location: values.location.trim(),
            minAge: Number(values.minAge),
            maxAge: Number(values.maxAge),
            deadline: new Date(values.deadline).toISOString(),
          });
          setCreated(nextTask);
          setPublishing(false);
        }, 320);
      }}
    >
      <div className="space-y-4">
        <section className="ui-card space-y-4">
          <h2 className="m-0 text-base font-semibold text-ink">О задаче</h2>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-sub">Название задачи</span>
            <input
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              onBlur={() => onBlurField("title")}
              placeholder="Например: Помощник на мероприятии"
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
            />
            <FieldError text={errors.title} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-sub">Описание</span>
            <textarea
              ref={descRef}
              value={values.description}
              onChange={(e) => {
                setField("description", e.target.value);
                autosizeDescription();
              }}
              onBlur={() => onBlurField("description")}
              rows={4}
              placeholder="Что нужно сделать, какие шаги и ожидания по качеству."
              className="w-full resize-none overflow-hidden rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
            />
            <FieldError text={errors.description} />
          </label>
        </section>

        <section className="ui-card space-y-4">
          <h2 className="m-0 text-base font-semibold text-ink">Условия</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-sub">Категория</span>
              <select
                value={values.category}
                onChange={(e) => setField("category", e.target.value as TaskCategory)}
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1 block text-sm font-medium text-sub">Формат</span>
              <div className="grid grid-cols-2 gap-2">
                {WORK_FORMATS.map((f) => {
                  const active = values.workFormat === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setField("workFormat", f)}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-accent/50 bg-accent-soft text-accent-bright"
                          : "border-edge bg-panel text-sub hover:border-edge-strong hover:text-ink"
                      }`}
                    >
                      {WORK_FORMAT_LABELS[f]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-sub">Город / локация</span>
            <input
              value={values.location}
              onChange={(e) => setField("location", e.target.value)}
              onBlur={() => onBlurField("location")}
              placeholder="Москва, м. Тверская"
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
            />
            <FieldError text={errors.location} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-sub">Длительность</span>
              <select
                value={values.durationBucket}
                onChange={(e) => setField("durationBucket", e.target.value as DurationBucket)}
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              >
                {DURATION_BUCKETS.map((d) => (
                  <option key={d} value={d}>
                    {DURATION_BUCKET_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-sub">Точное значение</span>
              <input
                value={values.durationLabel}
                onChange={(e) => setField("durationLabel", e.target.value)}
                onBlur={() => onBlurField("durationLabel")}
                placeholder="Например: 2–3 часа"
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.durationLabel} />
            </label>
          </div>
        </section>

        <section className="ui-card space-y-4">
          <h2 className="m-0 text-base font-semibold text-ink">Оплата и срок</h2>

          <div>
            <span className="mb-2 block text-sm font-medium text-sub">Тип оплаты</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "fixed" as const, label: "Фиксированная" },
                  { id: "hourly" as const, label: "Почасовая" },
                ] as const
              ).map((opt) => {
                const active = values.paymentType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setField("paymentType", opt.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "border-accent/50 bg-accent-soft text-accent-bright ring-1 ring-accent/30"
                        : "border-edge bg-panel text-sub hover:border-edge-strong hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {values.paymentType === "fixed" ? (
            <label className="block max-w-md">
              <span className="mb-1 block text-sm font-medium text-sub">Оплата за задачу, ₽</span>
              <input
                type="number"
                min={300}
                step={100}
                value={values.fixedPayRub}
                onChange={(e) => setField("fixedPayRub", e.target.value)}
                onBlur={() => onBlurField("fixedPayRub")}
                placeholder="1200"
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.fixedPayRub} />
            </label>
          ) : (
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-sub">Ставка в час, ₽</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={values.hourlyRate}
                  onChange={(e) => setField("hourlyRate", e.target.value)}
                  onBlur={() => onBlurField("hourlyRate")}
                  placeholder="350"
                  className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
                />
                <FieldError text={errors.hourlyRate} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-sub">Ожидаемая длительность, ч</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={values.estimatedHours}
                  onChange={(e) => setField("estimatedHours", e.target.value)}
                  onBlur={() => onBlurField("estimatedHours")}
                  placeholder="2"
                  className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
                />
                <FieldError text={errors.estimatedHours} />
              </label>
              <p className="m-0 text-xs text-sub sm:col-span-2">
                Ориентир по оплате:{" "}
                {Number.isFinite(previewPayTotal) && previewPayTotal > 0 ? (
                  <span className="font-medium text-ink">{formatRub(previewPayTotal)}</span>
                ) : (
                  "—"
                )}{" "}
                (ставка × часы)
              </p>
            </div>
          )}

          <label className="block max-w-md">
            <span className="mb-1 block text-sm font-medium text-sub">Срок</span>
            <input
              type="datetime-local"
              value={values.deadline}
              onChange={(e) => setField("deadline", e.target.value)}
              onBlur={() => onBlurField("deadline")}
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
            />
            <FieldError text={errors.deadline} />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-xl">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-sub">Возраст от</span>
              <input
                type="number"
                min={14}
                max={18}
                value={values.minAge}
                onChange={(e) => setField("minAge", e.target.value)}
                onBlur={() => onBlurField("minAge")}
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.minAge} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-sub">Возраст до</span>
              <input
                type="number"
                min={14}
                max={18}
                value={values.maxAge}
                onChange={(e) => setField("maxAge", e.target.value)}
                onBlur={() => onBlurField("maxAge")}
                className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.maxAge} />
            </label>
          </div>

          <button
            type="submit"
            className="ui-btn-primary w-full justify-center sm:w-auto disabled:cursor-wait disabled:opacity-90"
            disabled={publishing || (!canSubmit && submitted)}
          >
            {publishing ? "Публикуем…" : "Опубликовать задачу"}
          </button>
        </section>
      </div>

      <aside className="space-y-3">
        <article className="ui-card border-edge-strong sticky top-[calc(var(--header-h)+1rem)]">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-sub">Предпросмотр</p>
          <h3 className="mt-2 text-base font-semibold text-ink">
            {values.title.trim() || "Название задачи"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-sub">
            {values.description.trim() || "Краткое описание для проверки перед публикацией."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-sub">
            <span className="rounded-lg border border-edge px-2 py-1">{CATEGORY_LABELS[values.category]}</span>
            <span className="rounded-lg border border-edge px-2 py-1">{WORK_FORMAT_LABELS[values.workFormat]}</span>
            <span className="rounded-lg border border-edge px-2 py-1">{previewDuration}</span>
          </div>
          <div className="mt-3 space-y-1">
            <p className="m-0 text-sm font-medium text-ink">
              {values.paymentType === "fixed" ? (
                Number.isFinite(Number(values.fixedPayRub)) && Number(values.fixedPayRub) > 0 ? (
                  <>{formatRub(Number(values.fixedPayRub))} за задачу</>
                ) : (
                  "Оплата не указана"
                )
              ) : (
                <>
                  {Number.isFinite(Number(values.hourlyRate)) && Number(values.hourlyRate) > 0 ? (
                    <span>
                      {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Number(values.hourlyRate))}{" "}
                      ₽/час
                    </span>
                  ) : (
                    "Ставка не указана"
                  )}
                </>
              )}
            </p>
            {values.paymentType === "hourly" &&
            Number.isFinite(previewPayTotal) &&
            previewPayTotal > 0 &&
            Number(values.estimatedHours) > 0 ? (
              <p className="m-0 text-xs text-sub">
                ~{formatRub(previewPayTotal)} · {values.estimatedHours.replace(".", ",")} ч ожидается
              </p>
            ) : null}
          </div>
          <p className="m-0 mt-2 text-xs text-sub">{values.location || "Локация не указана"} · {previewAge}</p>
        </article>
      </aside>
    </form>
  );
}
