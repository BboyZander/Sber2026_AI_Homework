import Link from "next/link";
import { LoginDemoReset } from "@/components/login/LoginDemoReset";
import { LoginScreen } from "@/components/login/LoginScreen";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[450px] w-[450px] rounded-full bg-accent/14 blur-[110px]" />
        <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-accent-dark/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline hover:no-underline"
        >
          <span className="text-base font-extrabold tracking-tight text-ink">Траектория</span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Card */}
      <div className="relative mx-auto max-w-md px-4 pb-12 pt-6 sm:pt-8">
        <div className="overflow-hidden rounded-3xl border border-edge bg-panel/80 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* Card header */}
          <div className="border-b border-edge bg-gradient-to-br from-panel-muted/90 to-panel px-6 py-6 sm:px-8 sm:py-7">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15">
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
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Вход в демо</h1>
            </div>
            <p className="text-sm leading-relaxed text-sub">
              Выберите тестовый аккаунт или введите логин и пароль — откроются сценарии подростка и работодателя.
            </p>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 sm:px-8">
            {/* Demo notice */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-sub">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span>Это демо: вход упрощён, без реальной интеграции. Все данные хранятся локально в браузере.</span>
            </div>

            <LoginScreen />
            <LoginDemoReset />
          </div>
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-sub underline-offset-4 transition hover:text-ink hover:underline no-underline"
          >
            ← Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  );
}
