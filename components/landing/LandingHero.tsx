import Link from "next/link";

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
  },
  {
    title: "Помощь на мероприятии",
    meta: "Онлайн · 6 ч · 16+ лет",
    pay: "4 200 ₽",
  },
  {
    title: "Тестирование продукта",
    meta: "Удалённо · 2 ч · 14+ лет",
    pay: "1 800 ₽",
  },
];

export function LandingHero() {
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

        {/* Right — mock task list */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          {/* Glow */}
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-accent-dark/10 to-transparent blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-edge bg-panel/80 shadow-2xl shadow-black/40 backdrop-blur-md">
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
            <div className="divide-y divide-edge">
              {mockTasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-panel-muted/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-accent-dark/20">
                    <svg
                      className="h-4 w-4 text-accent-bright"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{task.title}</p>
                    <p className="mt-0.5 text-xs text-sub">{task.meta}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">{task.pay}</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      <svg
                        className="h-3 w-3 text-accent-bright"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] font-medium text-accent-bright">Подходит</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-edge px-5 py-3.5">
              <p className="text-xs text-sub-deep">
                Статус:{" "}
                <span className="font-semibold text-accent-bright">самозанятый · проверено</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
