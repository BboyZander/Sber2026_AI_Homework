"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeenPreferredTaskFormat } from "@/types/user";
import { updateTeenProfileFields } from "@/lib/teen-profile-client";
import { DEFAULT_TEEN_EARNING_GOAL_RUB } from "@/lib/teen-earning-goal";
import { TEEN_PREFERRED_FORMATS, TEEN_PREFERRED_FORMAT_LABELS } from "@/lib/teen-profile";
import { TEEN_INTEREST_LABELS } from "@/lib/teen-interest-labels";
import { TEEN_MOTIVATION_LABELS } from "@/lib/teen-motivation-labels";

const STEP_TITLES = [
  "Зачем копишь?",
  "Что мотивирует?",
  "Какой формат удобнее?",
  "Готов работать на выходных?",
  "Что тебе интересно?",
] as const;

const TOTAL_STEPS = STEP_TITLES.length;

function toggle(list: string[], code: string): string[] {
  return list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
}

/** Чип-кнопка выбора (одиночного или множественного). */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-accent bg-accent/10 text-accent-bright"
          : "border-edge bg-panel text-sub hover:border-accent/40 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function OnboardingFlow({ teenName }: { teenName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalAmount, setGoalAmount] = useState(String(DEFAULT_TEEN_EARNING_GOAL_RUB));
  const [motivation, setMotivation] = useState<string[]>([]);
  const [format, setFormat] = useState<TeenPreferredTaskFormat>("any");
  const [weekend, setWeekend] = useState<boolean | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const isLast = step === TOTAL_STEPS - 1;

  async function finish(skip = false) {
    if (saving) return;
    setSaving(true);
    try {
      if (skip) {
        await updateTeenProfileFields({ onboarded: true });
      } else {
        const amount = Number(goalAmount.replace(/\s/g, ""));
        await updateTeenProfileFields({
          onboarded: true,
          earningGoal: {
            title: goalTitle.trim() || undefined,
            amount: Number.isFinite(amount) && amount > 0 ? Math.round(amount) : undefined,
          },
          motivation,
          preferredTaskFormat: format,
          weekendAvailability: weekend ?? false,
          interests,
        });
      }
      router.replace("/teen/dashboard");
    } catch {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-8">
      <header className="mb-6">
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-accent/80">
          Давай настроим профиль
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
          Привет, {teenName}!
        </h1>
        {/* Прогресс */}
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-accent-bright" : "bg-panel-muted"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-sub">
          Шаг {step + 1} из {TOTAL_STEPS}
        </p>
      </header>

      <section className="ui-card flex-1">
        <h2 className="text-lg font-bold text-ink">{STEP_TITLES[step]}</h2>

        {step === 0 && (
          <div className="ui-stack mt-4">
            <div>
              <label htmlFor="goalTitle" className="mb-1 block text-sm font-medium text-sub">
                На что хочешь накопить? (необязательно)
              </label>
              <input
                id="goalTitle"
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Например, новый телефон"
                className="w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink focus:border-accent/50 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="goalAmount" className="mb-1 block text-sm font-medium text-sub">
                Цель по сумме, ₽
              </label>
              <input
                id="goalAmount"
                type="number"
                min={1}
                inputMode="numeric"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="w-40 rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink focus:border-accent/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4">
            <p className="mb-3 text-sm text-sub">Можно выбрать несколько.</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TEEN_MOTIVATION_LABELS).map(([code, label]) => (
                <Chip
                  key={code}
                  active={motivation.includes(code)}
                  onClick={() => setMotivation((m) => toggle(m, code))}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {TEEN_PREFERRED_FORMATS.map((f) => (
              <Chip key={f} active={format === f} onClick={() => setFormat(f)}>
                {TEEN_PREFERRED_FORMAT_LABELS[f]}
              </Chip>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex gap-2">
            <Chip active={weekend === true} onClick={() => setWeekend(true)}>
              Да, удобно
            </Chip>
            <Chip active={weekend === false} onClick={() => setWeekend(false)}>
              Нет, только будни
            </Chip>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4">
            <p className="mb-3 text-sm text-sub">Подберём задачи под твои интересы.</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TEEN_INTEREST_LABELS).map(([code, label]) => (
                <Chip
                  key={code}
                  active={interests.includes(code)}
                  onClick={() => setInterests((i) => toggle(i, code))}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={saving}
            className="ui-btn-ghost"
          >
            Назад
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void finish(true)}
            disabled={saving}
            className="text-sm font-medium text-sub transition hover:text-ink disabled:opacity-50"
          >
            Пропустить
          </button>
        )}

        {isLast ? (
          <button
            type="button"
            onClick={() => void finish(false)}
            disabled={saving}
            className="ui-btn-primary"
          >
            {saving ? "Сохраняем…" : "Готово"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={saving}
            className="ui-btn-primary"
          >
            Далее
          </button>
        )}
      </div>
    </main>
  );
}
