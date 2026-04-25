"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  type MockSession,
  clearMockSession,
  getDemoUserById,
  getMockSession,
} from "@/lib/auth";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { clearDemoPersistedState } from "@/lib/demo-state";
import { getEmployerProfileMerged } from "@/lib/employer-profile";
import { pushEmployerToast } from "@/lib/employer-flow";
import { PROFILE_UPDATED_EVENT } from "@/lib/profile-store";
import { pushTeenToast } from "@/lib/teen-flow";
import { getTeenProfileMerged } from "@/lib/teen-profile";
import { DEMO_COPY } from "@/lib/ui-copy";
import type { EmployerProfile, TeenProfile } from "@/types/user";

function labelForUser(user: NonNullable<ReturnType<typeof getDemoUserById>>): string {
  const { login: _l, password: _p, ...rest } = user;
  if (typeof window === "undefined") {
    return user.role === "teen" ? user.name : user.companyName;
  }
  if (user.role === "teen") {
    return getTeenProfileMerged(rest as TeenProfile).name;
  }
  if (user.role === "employer") {
    return getEmployerProfileMerged(rest as EmployerProfile).companyName;
  }
  return rest.name;
}

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<MockSession | null>(null);
  const [open, setOpen] = useState(false);
  const [, setProfileRev] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getMockSession());
  }, [pathname]);

  useEffect(() => {
    function bumpProfileLabel() {
      setProfileRev((n) => n + 1);
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, bumpProfileLabel);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, bumpProfileLabel);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const user = session ? getDemoUserById(session.userId) : null;
  const loggedIn = Boolean(session && user);

  function logout() {
    clearMockSession();
    setOpen(false);
    setSession(null);
    router.push("/login");
    router.refresh();
  }

  function resetDemoData() {
    setOpen(false);
    if (!confirm(DEMO_COPY.resetConfirm)) return;
    clearDemoPersistedState();
    const s = getMockSession();
    const u = s ? getDemoUserById(s.userId) : null;
    if (u?.role === "employer") pushEmployerToast(DEMO_COPY.resetDone);
    else if (u?.role === "teen") pushTeenToast(DEMO_COPY.resetDone);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-h)] shrink-0 items-center gap-3 border-b border-edge bg-canvas/90 px-4 backdrop-blur-md sm:px-5">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 rounded-lg font-bold tracking-tight text-ink no-underline hover:text-accent-bright hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <Image src="/rocket.png" alt="" width={28} height={28} className="shrink-0" />
        Траектория
      </Link>
      {title ? (
        <span className="hidden min-w-0 flex-1 truncate text-sm font-medium text-sub sm:block sm:text-[0.9375rem]">
          {title}
        </span>
      ) : (
        <span className="flex-1" />
      )}

      <ThemeSwitcher />

      {loggedIn && user ? (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex max-w-[10rem] items-center gap-1 rounded-lg border border-edge bg-panel-muted/50 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-edge-strong hover:bg-panel-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:max-w-[14rem]"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className="truncate">{labelForUser(user)}</span>
            <span className="text-sub" aria-hidden>
              ▾
            </span>
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-edge bg-panel py-1 shadow-xl shadow-black/40"
            >
              {user.role === "teen" ? (
                <Link
                  href="/teen/profile"
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm text-ink no-underline hover:bg-panel-muted/60 hover:no-underline focus-visible:bg-panel-muted/60 focus-visible:outline-none"
                  onClick={() => setOpen(false)}
                >
                  Профиль
                </Link>
              ) : (
                <Link
                  href="/employer/profile"
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm text-ink no-underline hover:bg-panel-muted/60 hover:no-underline focus-visible:bg-panel-muted/60 focus-visible:outline-none"
                  onClick={() => setOpen(false)}
                >
                  Данные кабинета
                </Link>
              )}
              <button
                type="button"
                role="menuitem"
                className="w-full border-0 border-t border-edge/80 bg-transparent px-4 py-2.5 text-left text-sm text-sub hover:bg-panel-muted/60 focus-visible:bg-panel-muted/60 focus-visible:outline-none"
                onClick={resetDemoData}
              >
                Сбросить данные демо
              </button>
              <button
                type="button"
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-rose-300 hover:bg-panel-muted/60 focus-visible:bg-panel-muted/60 focus-visible:outline-none"
                onClick={logout}
              >
                Выйти
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <Link
          href="/login"
          className="shrink-0 rounded-lg px-1 text-sm font-medium text-accent hover:text-accent-bright no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          Вход
        </Link>
      )}
    </header>
  );
}
