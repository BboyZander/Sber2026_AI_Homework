"use client";

import { useCallback, useEffect, useState } from "react";
import { applyTheme, getStoredTheme, type ThemeMode, toggleTheme } from "@/lib/theme";

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored ?? "dark";
    setMode(initial);
    applyTheme(initial);
  }, []);

  const onToggle = useCallback(() => {
    setMode((prev) => {
      const next = toggleTheme(prev);
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-edge bg-panel-muted px-3 text-xs font-semibold text-sub transition hover:border-accent/35 hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${className}`}
      aria-label={mode === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      title={mode === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      <span className="text-base leading-none" aria-hidden>
        {mode === "dark" ? "☀" : "☾"}
      </span>
      <span className="hidden min-[380px]:inline">{mode === "dark" ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}
