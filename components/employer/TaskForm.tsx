"use client";

import { motion } from "framer-motion";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { EngagementType, PhysicalLoadLevel, TaskCategory, WorkFormat } from "@/lib/constants";
import {
  CATEGORY_LABELS,
  ENGAGEMENT_TYPE_LABELS,
  ENGAGEMENT_TYPES,
  MINOR_COMPLIANCE_STATUS_LABELS,
  PHYSICAL_LOAD_LABELS,
  PHYSICAL_LOAD_LEVELS,
  TASK_CATEGORIES,
  WORK_FORMAT_LABELS,
  WORK_FORMATS,
} from "@/lib/constants";
import {
  type EmployerTaskPayload,
  canEditTask,
  editTask,
  getTaskByIdForFlow,
  publishTask,
} from "@/lib/employer-flow";
import { formatRub } from "@/lib/helpers";
import { currentMinorPeriod, getMinorComplianceResult, type MinorComplianceResult } from "@/lib/minor-compliance";
import {
  durationBucketFromHours,
  formatHoursAsDurationLabel,
  normalizeDurationLabelDisplay,
  parseDurationHoursFromLabel,
} from "@/lib/task-duration-form";
import type { Task, TaskPaymentType } from "@/types/task";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";

const DEFAULT_MAX_TEEN_AGE = 17;

type FormData = {
  title: string;
  description: string;
  category: TaskCategory;
  workFormat: WorkFormat;
  location: string;
  durationLabel: string;
  paymentType: TaskPaymentType;
  fixedPayRub: string;
  hourlyRate: string;
  estimatedHours: string;
  minAge: string;
  engagementType: EngagementType;
  duringSchoolPeriodAllowed: boolean;
  duringVacationAllowed: boolean;
  requiresMedicalExam: boolean;
  physicalLoadLevel: PhysicalLoadLevel;
  isOutdoor: boolean;
  deadlineDate: string;
  deadlineTime: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  title: "",
  description: "",
  category: "other",
  workFormat: "offline",
  location: "",
  durationLabel: "",
  paymentType: "fixed",
  fixedPayRub: "",
  hourlyRate: "",
  estimatedHours: "",
  minAge: "14",
  engagementType: "self_employed",
  duringSchoolPeriodAllowed: true,
  duringVacationAllowed: true,
  requiresMedicalExam: false,
  physicalLoadLevel: "light",
  isOutdoor: false,
  deadlineDate: "",
  deadlineTime: "",
};

function deadlinePartsFromIso(iso: string | undefined): { deadlineDate: string; deadlineTime: string } {
  if (!iso) return { deadlineDate: "", deadlineTime: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { deadlineDate: "", deadlineTime: "" };
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { deadlineDate: `${y}-${m}-${day}`, deadlineTime: `${h}:${min}` };
}

/** Локальная дата+время из полей формы (как в календаре пользователя). */
function combineDeadlineLocal(date: string, time: string): Date | null {
  const dStr = date.trim();
  if (!dStr) return null;
  const tRaw = (time.trim() || "00:00").slice(0, 8);
  const tStr = tRaw.length >= 5 ? tRaw.slice(0, 5) : tRaw;
  const [y, mo, da] = dStr.split("-").map((x) => Number(x));
  const [hhStr, mmStr = "0"] = tStr.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (![y, mo, da].every((n) => Number.isFinite(n))) return null;
  const dt = new Date(y, mo - 1, da, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formPhysicalLoadFromTask(src: Task): PhysicalLoadLevel {
  return src.physicalLoadLevel === "none" ? "none" : "light";
}

function taskSourceToFormData(src: Task): FormData {
  const est =
    src.paymentType === "hourly" && typeof src.estimatedHours === "number"
      ? String(src.estimatedHours)
      : "";
  return {
    title: src.title,
    description: src.description,
    category: src.category,
    workFormat: src.workFormat,
    location: src.location ?? "",
    durationLabel:
      src.paymentType === "hourly"
        ? normalizeDurationLabelDisplay(formatHoursAsDurationLabel(est))
        : normalizeDurationLabelDisplay(src.durationLabel),
    paymentType: src.paymentType,
    fixedPayRub: src.paymentType === "fixed" ? String(src.paymentAmount) : "",
    hourlyRate: src.paymentType === "hourly" ? String(src.paymentAmount) : "",
    estimatedHours: est,
    minAge:
      typeof src.minAge === "number" ? String(Math.min(17, Math.max(14, src.minAge))) : "14",
    engagementType: src.engagementType,
    duringSchoolPeriodAllowed: src.duringSchoolPeriodAllowed,
    duringVacationAllowed: src.duringVacationAllowed,
    requiresMedicalExam: src.requiresMedicalExam,
    physicalLoadLevel: formPhysicalLoadFromTask(src),
    isOutdoor: src.isOutdoor,
    ...deadlinePartsFromIso(src.deadline),
  };
}

function statusAfterSubmit(
  submitIsDraft: boolean,
  editTaskId: string | undefined,
  prior: Task | null,
): Task["status"] {
  if (submitIsDraft) return "draft";
  if (!editTaskId || !prior) return "open";
  if (prior.status === "draft") return "open";
  return prior.status;
}

function buildEmployerTaskPayload(
  values: FormData,
  complianceResult: MinorComplianceResult,
  status: Task["status"],
): EmployerTaskPayload {
  const rate = Number(values.hourlyRate);
  const h = Number(values.estimatedHours.replace(",", "."));
  const title = values.title.trim() || "Черновик задачи";
  const description = values.description.trim() || "Описание будет добавлено позже.";
  const durationHoursRaw = resolvedDurationHours(values);
  const durationHours =
    durationHoursRaw > 0 ? durationHoursRaw : status === "draft" ? 1 : durationHoursRaw;
  const deadlineInstant = combineDeadlineLocal(values.deadlineDate, values.deadlineTime);
  const deadlineIso = deadlineInstant
    ? deadlineInstant.toISOString()
    : new Date().toISOString();
  const label = resolvedDurationLabel(values) || (status === "draft" ? "уточняется" : "");
  return {
    title,
    description,
    category: values.category,
    paymentType: values.paymentType,
    paymentAmount:
      values.paymentType === "fixed"
        ? Number(values.fixedPayRub || 0)
        : Number.isFinite(rate)
          ? rate
          : 0,
    estimatedHours:
      values.paymentType === "hourly" && Number.isFinite(h) && h > 0 ? h : undefined,
    workFormat: values.workFormat,
    durationBucket: durationBucketFromHours(durationHours),
    durationLabel: label,
    location: values.location.trim() || undefined,
    minAge: Number.isFinite(Number(values.minAge)) ? Number(values.minAge) : undefined,
    maxAge: DEFAULT_MAX_TEEN_AGE,
    engagementType: values.engagementType,
    startDateTime: deadlineIso,
    durationHours,
    weeklyHoursExpected: durationHours,
    duringSchoolPeriodAllowed: values.duringSchoolPeriodAllowed,
    duringVacationAllowed: values.duringVacationAllowed,
    requiresMedicalExam: values.requiresMedicalExam,
    physicalLoadLevel: values.physicalLoadLevel,
    isOutdoor: values.isOutdoor,
    minorComplianceStatus: complianceResult.status,
    minorComplianceReasons: complianceResult.reasons,
    deadline: deadlineInstant ? deadlineInstant.toISOString() : undefined,
    status,
  };
}

function resolvedDurationLabel(values: FormData): string {
  if (values.paymentType === "hourly") {
    const fromHours = formatHoursAsDurationLabel(values.estimatedHours);
    if (fromHours) return normalizeDurationLabelDisplay(fromHours);
  }
  return normalizeDurationLabelDisplay(values.durationLabel);
}

function resolvedDurationHours(values: FormData): number {
  if (values.paymentType === "hourly") {
    const h = Number(String(values.estimatedHours).replace(",", "."));
    return Number.isFinite(h) && h > 0 ? h : 0;
  }
  return parseDurationHoursFromLabel(normalizeDurationLabelDisplay(values.durationLabel));
}

function validateField(field: keyof FormData, values: FormData): string | undefined {
  const title = values.title.trim();
  const desc = values.description.trim();
  const location = values.location.trim();
  const minAge = Number(values.minAge);

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
    if (values.paymentType !== "fixed") return undefined;
    if (!values.durationLabel.trim()) return "Укажите продолжительность.";
    if (parseDurationHoursFromLabel(normalizeDurationLabelDisplay(values.durationLabel)) <= 0) {
      return "Укажите продолжительность числом или диапазоном (например 2 или 2–3 ч).";
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
    if (!Number.isFinite(n) || n <= 0) return "Укажите продолжительность в часах (число больше 0).";
  }
  if (field === "minAge") {
    if (!Number.isFinite(minAge)) return "Возраст — числом.";
    if (minAge < 14 || minAge > 17) return "Минимальный возраст — от 14 до 17 лет.";
  }
  if (field === "deadlineDate") {
    if (!values.deadlineDate.trim()) return "Укажите дату.";
    if (values.deadlineTime.trim()) {
      const dt = combineDeadlineLocal(values.deadlineDate, values.deadlineTime);
      if (!dt) return "Некорректная дата.";
      if (dt.getTime() < Date.now() - 60_000) return "Дата и время не в прошлом.";
    }
    return undefined;
  }
  if (field === "deadlineTime") {
    if (!values.deadlineTime.trim()) return "Укажите время.";
    if (values.deadlineDate.trim()) {
      const dt = combineDeadlineLocal(values.deadlineDate, values.deadlineTime);
      if (!dt) return "Некорректное время.";
      if (dt.getTime() < Date.now() - 60_000) return "Дата и время не в прошлом.";
    }
    return undefined;
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
    "deadlineDate",
    "deadlineTime",
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

type TaskFormProps = { editTaskId?: string };

export function TaskForm({ editTaskId }: TaskFormProps) {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState<Task | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [submitMode, setSubmitMode] = useState<"open" | "draft">("open");
  const [editLoadError, setEditLoadError] = useState(false);
  const [editingPriorTask, setEditingPriorTask] = useState<Task | null>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const prefillDoneRef = useRef(false);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setHourlyDurationHours(next: string) {
    setValues((prev) => ({
      ...prev,
      estimatedHours: next,
      durationLabel: normalizeDurationLabelDisplay(formatHoursAsDurationLabel(next)),
    }));
  }

  function setPaymentType(next: TaskPaymentType) {
    setValues((prev) => {
      if (prev.paymentType === next) return prev;
      if (next === "hourly") {
        const parsed = parseDurationHoursFromLabel(prev.durationLabel);
        const hours = parsed > 0 ? String(parsed) : prev.estimatedHours;
        return {
          ...prev,
          paymentType: "hourly",
          estimatedHours: hours,
          durationLabel: normalizeDurationLabelDisplay(formatHoursAsDurationLabel(hours)),
        };
      }
      const labelFromHours = normalizeDurationLabelDisplay(
        formatHoursAsDurationLabel(prev.estimatedHours) || prev.durationLabel,
      );
      return {
        ...prev,
        paymentType: "fixed",
        durationLabel: labelFromHours,
      };
    });
  }

  useEffect(() => {
    if (!submitted) return;
    setErrors(validateAll(values));
  }, [values, submitted]);

  useEffect(() => {
    if (prefillDoneRef.current) return;
    if (editTaskId) {
      const t = getTaskByIdForFlow(editTaskId);
      if (!t || !canEditTask(editTaskId)) {
        setEditLoadError(true);
        prefillDoneRef.current = true;
        return;
      }
      setValues(taskSourceToFormData(t));
      setEditingPriorTask(t);
      prefillDoneRef.current = true;
      return;
    }
    const repeatFrom = searchParams.get("repeatFrom");
    if (!repeatFrom) return;
    const src = getTaskByIdForFlow(repeatFrom);
    if (!src) return;
    setValues(taskSourceToFormData(src));
    prefillDoneRef.current = true;
  }, [editTaskId, searchParams]);

  function onBlurField(field: keyof FormData) {
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  }

  function autosizeDescription() {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }

  const previewDuration = resolvedDurationLabel(values) || "—";
  const previewPayTotal = previewComparablePay(values);
  const previewAge = `от ${values.minAge || "14"} лет`;
  const canSubmit = useMemo(() => Object.keys(validateAll(values)).length === 0, [values]);
  const complianceResult = useMemo(() => {
    const durationHours = resolvedDurationHours(values);
    const combined = combineDeadlineLocal(values.deadlineDate, values.deadlineTime);
    const startDateTime = combined ? combined.toISOString() : new Date().toISOString();
    return getMinorComplianceResult(
      {
        minAge: Number(values.minAge),
        maxAge: DEFAULT_MAX_TEEN_AGE,
        engagementType: values.engagementType,
        startDateTime,
        durationHours: durationHours > 0 ? durationHours : 0.001,
        duringSchoolPeriodAllowed: values.duringSchoolPeriodAllowed,
        duringVacationAllowed: values.duringVacationAllowed,
        requiresMedicalExam: values.requiresMedicalExam,
        physicalLoadLevel: values.physicalLoadLevel,
        isOutdoor: values.isOutdoor,
      },
      currentMinorPeriod(),
    );
  }, [values]);

  function createNewTask(status: Task["status"]): Task {
    return publishTask(buildEmployerTaskPayload(values, complianceResult, status));
  }

  if (editLoadError && editTaskId) {
    return (
      <EmptyState
        emoji="📭"
        title="Редактирование недоступно"
        description="Задача не найдена или относится к другому аккаунту."
        action={<CTAButton href="/employer/tasks">К списку</CTAButton>}
      />
    );
  }

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
            <h2 className="mt-2 text-xl font-semibold text-ink">
              {editTaskId
                ? created.status === "draft"
                  ? "Черновик обновлён"
                  : "Изменения сохранены"
                : created.status === "draft"
                  ? "Черновик сохранён"
                  : "Задача опубликована"}
            </h2>
            <p className="mt-2 text-sm text-sub">
              {editTaskId
                ? "Карточка задачи в списке и в каталоге подростков обновлена с новыми данными."
                : created.status === "draft"
                  ? "Черновик появился в «Моих задачах». Его можно открыть, дописать и позже опубликовать."
                  : "Задача в списке «Мои задачи» и доступна подросткам в каталоге."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <CTAButton href="/employer/tasks">К списку</CTAButton>
              <CTAButton href={`/employer/tasks/${created.id}`} variant="ghost">
                Открыть задачу
              </CTAButton>
              {editTaskId ? (
                <button
                  type="button"
                  className="ui-btn-ghost border-0"
                  onClick={() => {
                    setCreated(null);
                    setSubmitted(false);
                    const t = getTaskByIdForFlow(created.id);
                    if (t) setEditingPriorTask(t);
                  }}
                >
                  Продолжить редактирование
                </button>
              ) : (
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
              )}
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
            <StatusBadge kind="task" status={created.status} />
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
        const submitDraft = submitMode === "draft";
        if (submitDraft) {
          setPublishing(true);
          window.setTimeout(() => {
            if (editTaskId) {
              const st = statusAfterSubmit(true, editTaskId, editingPriorTask);
              const nextTask = editTask(
                editTaskId,
                buildEmployerTaskPayload(values, complianceResult, st),
              );
              if (nextTask) setCreated(nextTask);
            } else {
              setCreated(createNewTask("draft"));
            }
            setPublishing(false);
          }, 220);
          return;
        }
        setSubmitted(true);
        const all = validateAll(values);
        setErrors(all);
        if (Object.keys(all).length > 0) return;
        if (complianceResult.status === "blocked") return;
        setPublishing(true);
        window.setTimeout(() => {
          if (editTaskId) {
            const st = statusAfterSubmit(false, editTaskId, editingPriorTask);
            const nextTask = editTask(
              editTaskId,
              buildEmployerTaskPayload(values, complianceResult, st),
            );
            if (nextTask) setCreated(nextTask);
          } else {
            setCreated(createNewTask("open"));
          }
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

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <label className="block min-w-0">
              <span className="mb-1 block text-sm font-medium text-sub">Минимальный возраст исполнителя</span>
              <input
                type="number"
                min={14}
                max={17}
                title="Допустимые значения: от 14 до 17 лет"
                value={values.minAge}
                onChange={(e) => setField("minAge", e.target.value)}
                onBlur={() => onBlurField("minAge")}
                className="[-moz-appearance:textfield] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full min-w-0 rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.minAge} />
            </label>

            {values.paymentType === "fixed" ? (
              <label className="block min-w-0">
                <span className="mb-1 block text-sm font-medium text-sub">Продолжительность</span>
                <input
                  value={values.durationLabel}
                  onChange={(e) => setField("durationLabel", e.target.value)}
                  onBlur={() => {
                    const next = normalizeDurationLabelDisplay(values.durationLabel);
                    setField("durationLabel", next);
                    setErrors((prev) => ({
                      ...prev,
                      durationLabel: validateField("durationLabel", { ...values, durationLabel: next }),
                    }));
                  }}
                  placeholder="Например: 2 или 2–3 ч"
                  className="w-full min-w-0 rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
                />
                <FieldError text={errors.durationLabel} />
              </label>
            ) : (
              <label className="block min-w-0">
                <span className="mb-1 block text-sm font-medium text-sub">Продолжительность, ч</span>
                <input
                  type="number"
                  inputMode="decimal"
                  title="Часы — число больше 0"
                  value={values.estimatedHours}
                  onChange={(e) => setHourlyDurationHours(e.target.value)}
                  onBlur={() => onBlurField("estimatedHours")}
                  placeholder="2"
                  className="[-moz-appearance:textfield] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full min-w-0 rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
                />
                <FieldError text={errors.estimatedHours} />
              </label>
            )}
          </div>

          <label className="block max-w-md">
            <span className="mb-1 block text-sm font-medium text-sub">Физическая нагрузка</span>
            <select
              value={values.physicalLoadLevel}
              onChange={(e) => setField("physicalLoadLevel", e.target.value as PhysicalLoadLevel)}
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
            >
              {PHYSICAL_LOAD_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {PHYSICAL_LOAD_LABELS[l]}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <p className="m-0 text-sm font-medium text-sub">Условия допуска</p>
            <label className="flex items-center gap-2 text-sm text-sub">
              <input
                type="checkbox"
                checked={values.duringSchoolPeriodAllowed}
                onChange={(e) => setField("duringSchoolPeriodAllowed", e.target.checked)}
              />
              Можно в учебный период
            </label>
            <label className="flex items-center gap-2 text-sm text-sub">
              <input
                type="checkbox"
                checked={values.duringVacationAllowed}
                onChange={(e) => setField("duringVacationAllowed", e.target.checked)}
              />
              Можно в каникулы
            </label>
            <label className="flex items-center gap-2 text-sm text-sub">
              <input
                type="checkbox"
                checked={values.requiresMedicalExam}
                onChange={(e) => setField("requiresMedicalExam", e.target.checked)}
              />
              Нужен медосмотр
            </label>
            <label className="flex items-center gap-2 text-sm text-sub">
              <input
                type="checkbox"
                checked={values.isOutdoor}
                onChange={(e) => setField("isOutdoor", e.target.checked)}
              />
              Работа на улице
            </label>
          </div>
        </section>

        <section className="ui-card space-y-4">
          <h2 className="m-0 text-base font-semibold text-ink">Оплата и дата</h2>

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
                    onClick={() => setPaymentType(opt.id)}
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
                <span className="mb-1 block text-sm font-medium text-sub">Продолжительность, ч</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={values.estimatedHours}
                  onChange={(e) => setHourlyDurationHours(e.target.value)}
                  onBlur={() => onBlurField("estimatedHours")}
                  placeholder="2"
                  className="[-moz-appearance:textfield] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
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
                (ставка × часы; то же значение, что в «Условиях»)
              </p>
            </div>
          )}

          <div className="grid max-w-xl gap-3 sm:grid-cols-2 sm:items-start">
            <label className="block min-w-0">
              <span className="mb-1 block text-sm font-medium text-sub">Дата</span>
              <input
                type="date"
                value={values.deadlineDate}
                onChange={(e) => setField("deadlineDate", e.target.value)}
                onBlur={() => onBlurField("deadlineDate")}
                className="w-full min-w-0 rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.deadlineDate} />
            </label>
            <label className="block min-w-0">
              <span className="mb-1 block text-sm font-medium text-sub">Время</span>
              <input
                type="time"
                value={values.deadlineTime}
                onChange={(e) => setField("deadlineTime", e.target.value)}
                onBlur={() => onBlurField("deadlineTime")}
                className="w-full min-w-0 rounded-xl border border-edge bg-panel px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition focus:border-accent/45 focus:ring-2"
              />
              <FieldError text={errors.deadlineTime} />
            </label>
          </div>

          <div className="block max-w-md">
            <span className="mb-1 block text-sm font-medium text-sub">Тип оформления</span>
            <div className="w-full rounded-xl border border-edge bg-panel-muted/60 px-4 py-3 text-sm text-ink">
              Самозанятость
            </div>
          </div>

          <div
            className={`rounded-xl border px-3 py-2 text-sm ${
              complianceResult.status === "blocked"
                ? "border-rose-400/50 bg-rose-50/95 text-rose-700"
                : complianceResult.status === "warning"
                  ? "border-amber-400/55 bg-amber-50/95 text-amber-900"
                  : "border-edge bg-panel text-sub"
            }`}
          >
            <p className="m-0 font-medium">Проверка 14–17: {MINOR_COMPLIANCE_STATUS_LABELS[complianceResult.status]}</p>
            {complianceResult.reasons.length > 0 ? (
              <ul className="m-0 mt-2 list-disc pl-5">
                {complianceResult.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-1">Ограничения соблюдены.</p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="submit"
              onClick={() => setSubmitMode("open")}
              className="ui-btn-primary w-full justify-center sm:w-auto disabled:cursor-wait disabled:opacity-90"
              disabled={publishing || (!canSubmit && submitted) || complianceResult.status === "blocked"}
            >
              {publishing && submitMode === "open"
                ? "Сохраняем…"
                : editTaskId
                  ? "Сохранить изменения"
                  : "Опубликовать задачу"}
            </button>
            <button
              type="submit"
              onClick={() => setSubmitMode("draft")}
              className="ui-btn-ghost w-full justify-center border border-edge sm:w-auto disabled:cursor-wait disabled:opacity-90"
              disabled={publishing}
            >
              {publishing && submitMode === "draft" ? "Сохраняем…" : "Сохранить черновик"}
            </button>
          </div>
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
          <p className="m-0 mt-1 text-xs text-sub">
            {(() => {
              const dt = combineDeadlineLocal(values.deadlineDate, values.deadlineTime);
              return dt
                ? `Дата и время: ${dt.toLocaleString("ru-RU")}`
                : "Дата и время не указаны";
            })()}{" "}
            · Продолжительность: {previewDuration}
          </p>
          <p className="m-0 mt-1 text-xs text-sub">
            14–17: {MINOR_COMPLIANCE_STATUS_LABELS[complianceResult.status]}
          </p>
        </article>
      </aside>
    </form>
  );
}
