const teenSteps = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Создай профиль",
    description: "Быстрая регистрация, укажи возраст и статус самозанятого — без лишних шагов",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Найди подходящую задачу",
    description: "Фильтр «Подходит мне» автоматически учитывает возраст и ограничения по трудовому законодательству",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
      </svg>
    ),
    title: "Откликнись",
    description: "Отправь отклик — следи за статусом в разделе «Отклики» в реальном времени",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Выполни и получи выплату",
    description: "Выполни задание, работодатель подтвердит результат и переведёт оплату на твой счёт",
  },
];

const employerSteps = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Войди в кабинет",
    description: "Личный кабинет юр. лица или ИП — обзор задач, откликов и статусов",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    title: "Опубликуй задачу",
    description: "Короткая форма: что сделать, срок, оплата. Система автоматически проверит соответствие ТК",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Выбери исполнителя",
    description: "Смотри профили откликнувшихся подростков и возьми в работу подходящего",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Прими работу и оплати",
    description: "Подтверди результат и произведи выплату — всё фиксируется в системе",
  },
];

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative flex gap-4 rounded-2xl border border-edge bg-panel-muted/80 p-5 shadow-lg shadow-black/15 backdrop-blur-sm transition-all duration-300 hover:border-accent/25 hover:bg-panel-muted/95 hover:shadow-xl">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-accent-dark/20 text-sm font-bold tabular-nums text-accent-bright">
          {step}
        </span>
        {step < 4 && (
          <span className="w-px flex-1 bg-gradient-to-b from-accent/20 to-transparent" />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="mb-1 flex items-center gap-2 text-sub group-hover:text-ink/70">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-sub">{description}</p>
      </div>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/8 px-3 py-1 text-xs font-semibold text-accent-bright">
            4 шага
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Как это работает
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sub">
            От регистрации до выплаты — просто и прозрачно для обеих сторон
          </p>
        </div>

        {/* Column headers */}
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15">
              <svg className="h-4 w-4 text-accent-bright" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Подросток</p>
              <p className="text-xs text-sub">Самозанятый · 14–17 лет</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15">
              <svg className="h-4 w-4 text-accent-bright" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Работодатель</p>
              <p className="text-xs text-sub">Юридическое лицо или ИП</p>
            </div>
          </div>
        </div>

        {/* Step cards — interleaved 2-column grid so rows auto-equalize heights */}
        <div className="mt-4 grid gap-x-8 gap-y-3 lg:grid-cols-2">
          {[0, 1, 2, 3].flatMap((i) => [
            <StepCard
              key={`teen-${i}`}
              step={i + 1}
              title={teenSteps[i].title}
              description={teenSteps[i].description}
              icon={teenSteps[i].icon}
            />,
            <StepCard
              key={`employer-${i}`}
              step={i + 1}
              title={employerSteps[i].title}
              description={employerSteps[i].description}
              icon={employerSteps[i].icon}
            />,
          ])}
        </div>
      </div>
    </section>
  );
}
