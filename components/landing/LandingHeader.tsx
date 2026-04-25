import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

const navClass =
  "text-sm font-medium text-sub transition-colors hover:text-ink no-underline hover:no-underline shrink-0";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 no-underline hover:no-underline"
        >
          <Image src="/rocket.png" alt="" width={32} height={32} className="shrink-0" />
          <span className="text-base font-extrabold tracking-tight text-ink sm:text-lg">
            Траектория
          </span>
        </Link>

        <details className="group relative md:hidden">
          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-edge bg-panel-muted/70 text-sub transition hover:border-edge-strong hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Открыть меню</span>
            <svg
              className="h-4 w-4 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <nav
            className="absolute left-0 top-11 z-50 w-48 rounded-2xl border border-edge bg-panel/95 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl"
            aria-label="Мобильная навигация"
          >
            <a href="#how-it-works" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink no-underline transition hover:bg-panel-muted hover:no-underline">
              Как работает
            </a>
            <a href="#features" className="block rounded-xl px-3 py-2 text-sm font-medium text-ink no-underline transition hover:bg-panel-muted hover:no-underline">
              Возможности
            </a>
          </nav>
        </details>

        {/* Nav */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto whitespace-nowrap md:flex sm:gap-8"
          aria-label="Основная навигация"
        >
          <a href="#how-it-works" className={navClass}>
            Как работает
          </a>
          <a href="#features" className={navClass}>
            Возможности
          </a>
        </nav>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitcher />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-dark px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/25 transition duration-200 ease-out hover:brightness-110 active:scale-[0.97] no-underline hover:no-underline sm:px-5 sm:text-sm"
          >
            Войти
          </Link>
        </div>
      </div>
    </header>
  );
}
