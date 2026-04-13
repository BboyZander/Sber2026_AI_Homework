import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-edge bg-canvas/80 px-4 py-12 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-ink">Траектория</p>
          <p className="mt-1 text-sm text-sub">MVP demo</p>
          <p className="mt-1 text-sm text-sub">Команда 2, Сбер2026</p>
        </div>
        <nav className="flex flex-col gap-3 sm:items-end" aria-label="Подвал">
          <Link
            href="/login"
            className="text-sm text-sub transition hover:text-ink no-underline hover:no-underline"
          >
            Вход
          </Link>
          <a
            href="#about"
            className="text-sm text-sub transition hover:text-ink no-underline hover:no-underline"
          >
            О проекте
          </a>
        </nav>
      </div>
    </footer>
  );
}
