"use client";

import Link from "next/link";
import { useState } from "react";

type PanelKey = "teen" | "employer";

const stats = [
  { value: "14–17", label: "лет" },
  { value: "100%", label: "легально" },
  { value: "ЮЛ / ИП", label: "работодатели" },
];

const mockTasks = [
  {
    title: "Раздача листовок на промо",
    meta: "Москва · 4 ч · 14+ лет",
    pay: "2 500 ₽",
    iconPath:
      "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  {
    title: "Помощь на мероприятии",
    meta: "Онлайн · 6 ч · 16+ лет",
    pay: "4 200 ₽",
    iconPath:
      "M8 7V3m8 4V3M5 11h14M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Тестирование продукта",
    meta: "Онлайн · 2 ч · 14+ лет",
    pay: "1 800 ₽",
    iconPath:
      "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

const mockEmployerTasks = [
  {
    title: "Упаковка подарочных наборов",
    status: "open" as const,
    statusLabel: "Идет набор",
    applicants: 6,
    pay: "3 600 ₽",
    iconPath:
      "M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7m16 0H4m16 0V8a2 2 0 00-2-2h-3.5M4 12V8a2 2 0 012-2h3.5m5 0H12m0 0H9.5M12 6v15m0-15c0-1.657 1.12-3 2.5-3S17 4.343 17 6c0 1.105-.895 2-2 2h-3m0-2c0-1.657-1.12-3-2.5-3S7 4.343 7 6c0 1.105.895 2 2 2h3",
  },
  {
    title: "Фотоотчёт витрины",
    status: "in_progress" as const,
    statusLabel: "Исполнитель найден",
    applicants: 2,
    pay: "1 400 ₽",
    iconPath:
      "M3 9a2 2 0 012-2h2.5l1.4-2.1A2 2 0 0110.56 4h2.88a2 2 0 011.66.9L16.5 7H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm9 7a3 3 0 100-6 3 3 0 000 6z",
  },
  {
    title: "Помощь на мастер-классе",
    status: "completed" as const,
    statusLabel: "Оплачено",
    applicants: 3,
    pay: "5 200 ₽",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253",
  },
];

const statusColors = {
  open: "bg-accent/15 text-accent-bright",
  in_progress: "bg-blue-500/15 text-blue-400",
  completed: "bg-panel-muted/80 text-sub",
};

const panelNav: Array<{ key: PanelKey; label: string }> = [
  { key: "teen", label: "Подросток" },
  { key: "employer", label: "Работодатель" },
];

function formatApplicants(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} отклик`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `${count} отклика`;
  }
  return `${count} откликов`;
}

function TeenPanel() {
  return (
    <div className="relative overflow-visible rounded-3xl border border-edge bg-panel/80 shadow-2xl shadow-black/40 backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sub">
            Открытые задачи
          </p>
          <p className="mt-0.5 text-[11px] text-sub-deep">Подходят по возрасту</p>
        </div>
        <span className="rounded-xl bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent-bright">
          3 задачи
        </span>
      </div>

      {/* Task cards */}
      <div className="relative py-1">
        {mockTasks.map((task, i) => {
          const isFeatured = i === 1;

          return (
            <div
              key={i}
              className={`relative flex items-center gap-4 border-edge transition duration-200 ${
                i > 0 ? "border-t" : ""
              } ${
                isFeatured
                  ? "z-20 -mx-2 my-2 scale-[1.035] cursor-pointer rounded-3xl border border-accent/45 bg-panel/95 px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.34),0_0_26px_rgba(52,211,153,0.14)] ring-1 ring-white/10 hover:scale-[1.055] hover:border-accent/70 sm:-mx-5 sm:translate-x-2 sm:scale-[1.105] sm:px-6 sm:py-5 sm:shadow-[0_24px_55px_rgba(0,0,0,0.42),0_0_35px_rgba(52,211,153,0.18)] sm:hover:scale-[1.125] sm:hover:shadow-[0_28px_65px_rgba(0,0,0,0.46),0_0_45px_rgba(52,211,153,0.24)]"
                  : "px-5 py-4 hover:bg-panel-muted/40"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-accent-dark/20">
                <svg
                  className="h-4 w-4 text-accent-bright"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={task.iconPath} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{task.title}</p>
                <p className="mt-0.5 text-xs text-sub">{task.meta}</p>
              </div>
              <div className="relative text-right">
                <p className={`text-sm font-bold ${isFeatured ? "relative z-10 text-base text-ink" : "text-ink/60 blur-[1px]"}`}>
                  {task.pay}
                </p>
                <div className="mt-0.5 flex items-center justify-end gap-1">
                  <svg
                    className={`h-3 w-3 text-accent-bright ${isFeatured ? "relative z-10" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-[10px] text-accent-bright ${isFeatured ? "relative z-10 font-bold" : "font-medium"}`}>
                    Подходит
                  </span>
                </div>
                {isFeatured ? (
                  <div className="pointer-events-none absolute -inset-x-4 -inset-y-4" aria-hidden="true">
                    <div className="absolute right-1 top-[-0.35rem] h-[4.8rem] w-[4.8rem] rounded-full border-[3px] border-accent-bright/80 bg-transparent shadow-[0_0_22px_rgba(52,211,153,0.2),inset_0_0_0_1px_rgba(255,255,255,0.2)] sm:-right-1 sm:top-[-0.7rem] sm:h-[6rem] sm:w-[6rem] sm:shadow-[0_0_26px_rgba(52,211,153,0.22),inset_0_0_0_1px_rgba(255,255,255,0.2)]" />
                    <div className="absolute -right-3 bottom-[-0.25rem] h-1.5 w-6 origin-left rotate-45 rounded-full bg-accent-bright/80 shadow-[0_0_14px_rgba(52,211,153,0.22)] sm:-right-5 sm:bottom-[-0.65rem] sm:h-2 sm:w-8" />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-edge px-5 py-3.5">
        <p className="text-xs text-sub-deep">
          Статус:{" "}
          <span className="font-semibold text-accent-bright">самозанятый · проверено</span>
        </p>
      </div>
    </div>
  );
}

function EmployerPanel() {
  return (
    <div className="relative overflow-visible rounded-3xl border border-edge bg-panel/80 shadow-2xl shadow-black/40 backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sub">
            Статус поиска
          </p>
          <p className="mt-0.5 text-[11px] text-sub-deep">Задачи и отклики в работе</p>
        </div>
        <span className="rounded-xl bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent-bright">
          3 задачи
        </span>
      </div>

      {/* Task rows */}
      <div className="relative py-1">
        {mockEmployerTasks.map((task, i) => {
          const isFeatured = i === 1;

          return (
            <div
              key={i}
              className={`relative flex items-center gap-4 border-edge transition duration-200 ${
                i > 0 ? "border-t" : ""
              } ${
                isFeatured
                  ? "z-20 -mx-2 my-2 scale-[1.035] cursor-pointer rounded-3xl border border-accent/45 bg-panel/95 px-4 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.34),0_0_26px_rgba(52,211,153,0.14)] ring-1 ring-white/10 hover:scale-[1.055] hover:border-accent/70 sm:-mx-5 sm:translate-x-2 sm:scale-[1.105] sm:px-6 sm:py-5 sm:shadow-[0_24px_55px_rgba(0,0,0,0.42),0_0_35px_rgba(52,211,153,0.18)] sm:hover:scale-[1.125] sm:hover:shadow-[0_28px_65px_rgba(0,0,0,0.46),0_0_45px_rgba(52,211,153,0.24)]"
                  : "px-5 py-4 hover:bg-panel-muted/40"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-dark/10">
                <svg
                  className="h-4 w-4 text-accent-bright"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={task.iconPath} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{task.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${statusColors[task.status]}`}>
                    {task.statusLabel}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink">{task.pay}</p>
                <p className="mt-0.5 text-[10px] text-sub">{formatApplicants(task.applicants)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-edge px-5 py-3.5">
        <p className="text-xs text-sub-deep">
          Компания:{" "}
          <span className="font-semibold text-ink">
            ООО «Ромашка» · ИНН{" "}
            <span className="inline-block select-none blur-[3px]" aria-hidden="true">
              9999999999
            </span>
          </span>
        </p>
      </div>
    </div>
  );
}

export function LandingHero() {
  const [tab, setTab] = useState<PanelKey>("teen");

  return (
    <section
      id="about"
      className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Left */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]">
            Первая легальная
            <br />
            <span className="text-accent-bright">подработка</span>
            <br />
            для подростков
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-sub sm:text-lg">
            Платформа соединяет подростков‑самозанятых с работодателями — юридическими
            лицами и ИП. Всё по закону, прозрачно и понятно.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-accent to-accent-dark px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-accent/25 transition duration-200 ease-out hover:brightness-110 active:scale-[0.98] no-underline hover:no-underline"
            >
              Я ищу подработку
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-edge-strong bg-panel-muted/50 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur-sm transition duration-200 ease-out hover:border-accent/30 hover:bg-raised/60 active:scale-[0.98] no-underline hover:no-underline"
            >
              Я ищу исполнителя
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-edge pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold leading-none text-ink sm:text-2xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium text-sub">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mock panels with bottom pagination */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          {/* Glow */}
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-accent-dark/10 to-transparent blur-3xl" />

          <div className="relative">
            {tab === "teen" ? <TeenPanel /> : <EmployerPanel />}
          </div>

          <ul className="relative mt-5 flex items-center justify-center gap-0.5" aria-label="Переключение примеров интерфейса">
            {panelNav.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setTab(item.key)}
                  aria-label={`Показать блок: ${item.label}`}
                  aria-pressed={tab === item.key}
                  className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all duration-200 ${
                      tab === item.key
                        ? "w-7 bg-accent-bright shadow-lg shadow-accent/25"
                        : "w-2.5 bg-sub-deep/35 group-hover:bg-sub"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
