import Link from "next/link";
import type { ReactNode } from "react";

/* ---- Icons ---- */
function IconHome() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
function IconList() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  );
}
function IconBriefcase() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

const teenLinks: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/teen/dashboard", label: "Главная", icon: <IconHome /> },
  { href: "/teen/tasks", label: "Задачи", icon: <IconList /> },
  { href: "/teen/applications", label: "Отклики", icon: <IconInbox /> },
  { href: "/teen/profile", label: "Профиль", icon: <IconUser /> },
];

const employerLinks: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/employer/dashboard", label: "Главная", icon: <IconHome /> },
  { href: "/employer/profile", label: "Данные", icon: <IconBuilding /> },
  { href: "/employer/tasks", label: "Мои задачи", icon: <IconBriefcase /> },
  { href: "/employer/tasks/new", label: "Новая", icon: <IconPlus /> },
];

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

function DesktopNavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
        active
          ? "bg-accent/15 text-accent-bright shadow-sm shadow-accent/10"
          : "text-sub hover:bg-panel-muted/60 hover:text-ink"
      }`}
    >
      <span
        className={`transition-colors duration-200 ${
          active ? "text-accent-bright" : "text-sub-deep group-hover:text-sub"
        }`}
      >
        {icon}
      </span>
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-bright" />
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1 text-[0.65rem] font-medium transition-all duration-200 no-underline hover:no-underline focus-visible:outline-none ${
        active ? "text-accent-bright" : "text-sub hover:text-ink"
      }`}
    >
      <span
        className={`rounded-lg p-1.5 transition-colors duration-200 ${
          active ? "bg-accent/15 text-accent-bright" : "text-sub-deep"
        }`}
      >
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </Link>
  );
}

export function Sidebar({
  variant,
  pathname,
}: {
  variant: "teen" | "employer";
  pathname: string;
}) {
  const links = variant === "teen" ? teenLinks : employerLinks;
  const activeHref = resolveActiveNavHref(pathname, links);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-[var(--header-h)] z-30 hidden h-[calc(100vh-var(--header-h))] w-[var(--sidebar-w)] flex-col border-r border-edge bg-canvas/90 p-3 backdrop-blur-md md:flex"
        aria-label="Боковое меню"
      >
        <nav className="flex flex-col gap-1" aria-label="Разделы">
          {links.map(({ href, label, icon }) => (
            <DesktopNavLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={activeHref === href}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-[var(--bottom-nav-h)] items-center border-t border-edge bg-canvas/95 px-2 backdrop-blur-lg md:hidden"
        aria-label="Мобильная навигация"
      >
        {links.map(({ href, label, icon }) => (
          <MobileNavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={activeHref === href}
          />
        ))}
      </nav>
    </>
  );
}
