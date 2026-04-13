import Link from "next/link";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";

const navClass =
  "text-sm font-medium text-sub transition-colors hover:text-ink";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-canvas/65 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-ink transition-opacity duration-200 hover:opacity-90 no-underline hover:no-underline sm:text-lg"
        >
          Траектория
        </Link>
        <nav
          className="flex min-w-0 flex-1 items-center justify-center gap-3 overflow-x-auto whitespace-nowrap sm:gap-6 md:gap-8"
          aria-label="Основная навигация"
        >
          <a href="#how-it-works" className={`${navClass} shrink-0 no-underline hover:no-underline`}>
            Как это работает
          </a>
          <a href="#features" className={`${navClass} shrink-0 no-underline hover:no-underline`}>
            Возможности
          </a>
          <Link href="/login" className={`${navClass} shrink-0 no-underline hover:no-underline`}>
            Вход
          </Link>
        </nav>
        <ThemeSwitcher />
        <Link
          href="/login"
          className="shrink-0 rounded-full bg-gradient-to-r from-accent to-accent-dark px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-accent/25 transition duration-200 ease-out hover:brightness-110 active:scale-[0.97] no-underline hover:no-underline sm:px-4 sm:text-sm"
        >
          <span className="sm:hidden">Демо</span>
          <span className="hidden sm:inline">Открыть демо</span>
        </Link>
      </div>
    </header>
  );
}
