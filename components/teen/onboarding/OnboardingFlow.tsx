"use client";

import { useEffect, useState } from "react";
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
  "Откуда будешь работать?",
  "Что тебе интересно?",
] as const;

type AddressSuggestion = { value: string; unrestrictedValue?: string; lat?: number; lng?: number };
const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 20] as const;

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
  const [homeAddress, setHomeAddress] = useState("");
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState(5);
  const [addrSuggestions, setAddrSuggestions] = useState<AddressSuggestion[]>([]);
  const [addrSuggestLoading, setAddrSuggestLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const isLast = step === TOTAL_STEPS - 1;

  useEffect(() => {
    if (step !== 4 || homeAddress.trim().length < 3) {
      setAddrSuggestions([]);
      setAddrSuggestLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddrSuggestLoading(true);
      try {
        const res = await fetch(`/api/address-suggest?query=${encodeURIComponent(homeAddress.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { suggestions?: AddressSuggestion[] };
        setAddrSuggestions(data.suggestions?.slice(0, 5) ?? []);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") setAddrSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setAddrSuggestLoading(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [homeAddress, step]);

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
          homeAddress: homeAddress.trim() || undefined,
          homeLat: homeLat ?? undefined,
          homeLng: homeLng ?? undefined,
          searchRadiusKm,
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
          <div className="ui-stack mt-4">
            <div>
              <label htmlFor="onb-address" className="mb-1 block text-sm font-medium text-sub">
                Домашний адрес (необязательно)
              </label>
              <input
                id="onb-address"
                type="text"
                value={homeAddress}
                onChange={(e) => {
                  setHomeAddress(e.target.value);
                  setHomeLat(null);
                  setHomeLng(null);
                }}
                placeholder="Начни вводить адрес"
                autoComplete="street-address"
                className="w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink focus:border-accent/50 focus:outline-none"
              />
              {addrSuggestions.length > 0 ? (
                <div className="mt-1 overflow-hidden rounded-xl border border-edge bg-panel shadow-lg shadow-black/10">
                  {addrSuggestions.map((item) => (
                    <button
                      key={item.unrestrictedValue ?? item.value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setHomeAddress(item.value);
                        setHomeLat(item.lat ?? null);
                        setHomeLng(item.lng ?? null);
                        setAddrSuggestions([]);
                      }}
                      className="block w-full border-0 bg-transparent px-4 py-2.5 text-left text-sm text-ink transition hover:bg-panel-muted"
                    >
                      {item.value}
                    </button>
                  ))}
                </div>
              ) : addrSuggestLoading ? (
                <p className="m-0 mt-1 text-xs text-sub">Ищем адрес…</p>
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-sub">
                Радиус поиска задач: {searchRadiusKm} км
              </p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map((km) => (
                  <Chip key={km} active={searchRadiusKm === km} onClick={() => setSearchRadiusKm(km)}>
                    {km} км
                  </Chip>
                ))}
              </div>
              <p className="mt-2 m-0 text-xs text-sub-deep">
                Задачи за пределами радиуса не пропадут — это только фильтр по умолчанию.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
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
