import Link from "next/link";

const roles = [
  {
    role: "Подросток",
    sub: "14–17 лет · Самозанятый",
    description:
      "Зарабатывай официально — без посредников. Выбирай задания, которые подходят по возрасту и расписанию.",
    bullets: [
      "Каталог задач с фильтром «Подходит мне»",
      "Проверка соответствия трудовому законодательству",
      "История откликов и статусы в реальном времени",
      "Цифровой профиль: XP, достижения, выплаты",
    ],
    cta: "Войти как подросток",
    accentFrom: "from-accent/22",
    accentTo: "to-accent-dark/12",
    borderColor: "border-accent/30",
    badgeBg: "bg-accent/12",
    badgeText: "text-accent-bright",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: "Работодатель",
    sub: "Юр. лицо или ИП",
    description:
      "Публикуй задачи для молодых исполнителей — быстро, прозрачно и с соблюдением законодательства.",
    bullets: [
      "Публикация задач за несколько минут",
      "Автоматическая проверка соответствия ТК",
      "Управление откликами и статусами",
      "Подтверждение работы и выплата исполнителю",
    ],
    cta: "Войти как работодатель",
    accentFrom: "from-accent/16",
    accentTo: "to-accent-dark/8",
    borderColor: "border-accent/20",
    badgeBg: "bg-accent/8",
    badgeText: "text-accent",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
] as const;

export function LandingRoles() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-semibold text-accent-bright">
            Два сценария
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Выберите роль
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sub">
            Один сервис — два разных кабинета со своей логикой и инструментами
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.role}
              className={`group relative overflow-hidden rounded-3xl border ${role.borderColor} bg-panel-muted/80 p-8 shadow-2xl shadow-black/25 backdrop-blur-md transition-all duration-300 hover:shadow-accent/5 sm:p-10`}
            >
              {/* Background glow */}
              <div
                className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${role.accentFrom} ${role.accentTo} blur-3xl transition-all duration-500 group-hover:scale-110`}
              />

              {/* Header */}
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 rounded-xl ${role.badgeBg} px-3 py-1.5`}>
                    <span className={role.badgeText}>{role.icon}</span>
                    <span className={`text-xs font-bold ${role.badgeText}`}>{role.sub}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-extrabold text-ink">{role.role}</h3>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed text-sub">
                {role.description}
              </p>

              <ul className="relative mt-6 space-y-2.5">
                {role.bullets.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-sub">
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15">
                      <svg
                        className="h-2.5 w-2.5 text-accent-bright"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              <div className="relative mt-8">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent/80 to-accent-dark/70 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition duration-200 ease-out hover:from-accent hover:to-accent-dark hover:shadow-accent/30 active:scale-[0.98] no-underline hover:no-underline sm:w-auto sm:px-8"
                >
                  {role.cta}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
