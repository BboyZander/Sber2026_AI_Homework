import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/register/RegisterForm";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[450px] w-[450px] rounded-full bg-accent/14 blur-[110px]" />
        <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-accent-dark/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <Image src="/rocket.png" alt="" width={30} height={30} className="shrink-0" />
          <span className="text-base font-extrabold tracking-tight text-ink">Траектория</span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Card */}
      <div className="relative mx-auto max-w-md px-4 pb-12 pt-6 sm:pt-8">
        <div className="overflow-hidden rounded-3xl border border-edge bg-panel/80 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* Card header */}
          <div className="border-b border-edge bg-gradient-to-br from-panel-muted/90 to-panel px-6 py-6 sm:px-8 sm:py-7">
            <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
              Регистрация
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-sub">
              Создайте аккаунт подростка или работодателя — дальше заполним профиль.
            </p>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 sm:px-8">
            <RegisterForm />
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
