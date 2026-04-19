import Link from "next/link";

const teenLinks = [
  { href: "/teen/dashboard", label: "Главная" },
  { href: "/teen/tasks", label: "Задачи" },
  { href: "/teen/applications", label: "Отклики" },
  { href: "/teen/profile", label: "Профиль" },
] as const;

const employerLinks = [
  { href: "/employer/dashboard", label: "Главная" },
  { href: "/employer/profile", label: "Данные" },
  { href: "/employer/tasks", label: "Мои задачи" },
  { href: "/employer/tasks/new", label: "Новая" },
] as const;

/** Один активный пункт: при вложенных путах выигрывает самый длинный совпадающий `href` (напр. `/employer/tasks/new` vs `/employer/tasks`). */
function resolveActiveNavHref(
  pathname: string,
  links: readonly { href: string }[],
): string | null {
  const sorted = [...links].sort((a, b) => b.href.length - a.href.length);
  for (const { href } of sorted) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return href;
    }
  }
  return null;
}

function navLinkClass(vertical: boolean, active: boolean): string {
  const base =
    "rounded-xl text-center transition-all duration-200 ease-out no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
  const pad = vertical ? "px-3 py-2.5 text-left sm:text-[0.9rem]" : "px-1 py-2 text-[0.7rem] sm:text-xs";
  const flex = vertical ? "" : "flex-1 min-w-0";
  const activeCls = active
    ? "bg-accent/15 font-semibold text-accent-bright shadow-sm shadow-accent/15"
    : "font-normal text-sub hover:bg-panel-muted/50 hover:text-ink";
  return `${base} ${pad} ${flex} ${activeCls}`;
}

function NavLinks({
  links,
  pathname,
  vertical,
}: {
  links: readonly { href: string; label: string }[];
  pathname: string;
  vertical: boolean;
}) {
  const activeHref = resolveActiveNavHref(pathname, links);
  return (
    <nav
      className={
        vertical
          ? "flex w-full flex-col gap-1"
          : "flex w-full items-center justify-around gap-0.5"
      }
      aria-label={vertical ? "Разделы" : "Нижняя навигация"}
    >
      {links.map(({ href, label }) => {
        const active = activeHref === href;
        return (
          <Link key={href} href={href} className={navLinkClass(vertical, active)}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop: боковая панель. Mobile-first: нижняя навигация. */
export function Sidebar({
  variant,
  pathname,
}: {
  variant: "teen" | "employer";
  pathname: string;
}) {
  const links = variant === "teen" ? teenLinks : employerLinks;

  return (
    <>
      <aside
        className="app-sidebar-desktop fixed left-0 top-[var(--header-h)] z-30 hidden h-[calc(100vh-var(--header-h))] w-[var(--sidebar-w)] border-r border-edge bg-canvas/90 p-3 backdrop-blur-md md:block"
        aria-label="Боковое меню"
      >
        <NavLinks links={links} pathname={pathname} vertical />
      </aside>
      <nav
        className="app-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex h-[var(--bottom-nav-h)] items-center border-t border-edge bg-canvas/95 px-1 backdrop-blur-lg md:hidden"
        aria-label="Мобильная навигация"
      >
        <NavLinks links={links} pathname={pathname} vertical={false} />
      </nav>
    </>
  );
}
