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
          className="shrink-0 no-underline hover:no-underline"
        >
          <span className="text-base font-extrabold tracking-tight text-ink sm:text-lg">
            Траектория
          </span>
        </Link>

        {/* Nav */}
        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto whitespace-nowrap sm:gap-8"
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
