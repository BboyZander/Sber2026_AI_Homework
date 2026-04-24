const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Только легальные задачи",
    text: "Все задачи проходят автоматическую проверку на соответствие трудовому законодательству для несовершеннолетних",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Самозанятость",
    text: "Подростки работают с официальным налоговым статусом. Платформа помогает оформить всё правильно с первого раза",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: "Только юр. лица и ИП",
    text: "Работодатели на платформе — исключительно юридические лица и индивидуальные предприниматели. Никаких частных лиц",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Профиль и прогресс",
    text: "XP, достижения и история выплат — всё в одном месте. Цифровой портфолио первого опыта работы",
  },
] as const;

export function LandingBenefits() {
  return (
    <section
      id="features"
      className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-semibold text-accent-bright">
            Возможности
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Почему это работает
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sub">
            Платформа учитывает особенности работы с несовершеннолетними на каждом шаге
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-edge bg-panel-muted/90 p-6 shadow-lg shadow-black/15 backdrop-blur-sm transition-all duration-300 hover:border-accent/25 hover:shadow-xl"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent-dark/15 text-accent-bright transition-transform duration-300 group-hover:scale-110">
                {b.icon}
              </div>
              <h3 className="mt-4 text-sm font-bold leading-snug text-ink">{b.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sub">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
