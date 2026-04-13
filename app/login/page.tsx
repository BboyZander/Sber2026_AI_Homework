import Link from "next/link";
import { LoginDemoReset } from "@/components/login/LoginDemoReset";
import { LoginScreen } from "@/components/login/LoginScreen";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeSwitcher />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-accent/16 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-accent-dark/12 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-md px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-10 inline-block text-sm font-semibold text-sub transition hover:text-ink no-underline hover:no-underline"
        >
          Траектория
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Вход в демо</h1>
          <p className="mt-3 text-base leading-relaxed text-sub">
            Выберите тестовый аккаунт или введите логин и пароль — откроются сценарии подростка и работодателя.
          </p>
        </header>

        <div className="mb-8 rounded-2xl border border-edge bg-panel-muted/85 p-4 text-sm leading-relaxed text-sub shadow-lg shadow-black/20 backdrop-blur-sm">
          Это демо: вход упрощён, без реальной интеграции со SberID. Все данные хранятся локально в браузере.
        </div>

        <LoginScreen />

        <LoginDemoReset />

        <p className="mt-10 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-accent/90 underline-offset-4 transition hover:text-accent-bright hover:underline"
          >
            Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  );
}
