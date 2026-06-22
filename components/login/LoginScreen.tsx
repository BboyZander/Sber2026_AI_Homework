"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LOGIN_COPY } from "@/lib/ui-copy";

// Тестовые сид-учётки Supabase (см. supabase/seed). Пароль общий.
const QUICK_ACCOUNTS = [
  {
    role: "Подросток",
    email: "teen@trajectory.demo",
    password: "demo123456",
    accent: "from-accent/20 to-accent-dark/10",
    border: "border-accent/30",
  },
  {
    role: "Работодатель",
    email: "x5@trajectory.demo",
    password: "demo123456",
    accent: "from-accent/18 to-accent-dark/10",
    border: "border-accent/28",
  },
] as const;

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Единый реальный вход через Supabase (форма и быстрые кнопки).
  const signIn = useCallback(
    async (em: string, pw: string) => {
      setError(null);
      setPending(true);

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: em.trim(),
        password: pw,
      });

      if (signInError) {
        setError(LOGIN_COPY.emailSignInFailed);
        setPending(false);
        return;
      }

      // /auth/callback гарантирует профиль и уводит в кабинет по роли (включая онбординг).
      // window.location.href нужен для полного GET-запроса: router.push не следует
      // серверным редиректам Route Handler.
      window.location.href = "/auth/callback";
    },
    [],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
  }

  const inputClass =
    "w-full rounded-xl border border-edge bg-panel-muted/95 px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition placeholder:text-sub-deep focus:border-accent/45 focus:ring-2";

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sub">E-mail</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className={inputClass}
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-sub">Пароль</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className={inputClass}
            required
          />
        </label>

        {error ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-rose-500/35 bg-rose-950/40 px-4 py-3 text-sm text-rose-100 shadow-lg shadow-rose-950/20 backdrop-blur-sm"
          >
            <span className="shrink-0 text-rose-400" aria-hidden>
              !
            </span>
            <p className="m-0 leading-relaxed">{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-dark py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition duration-200 ease-out hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Входим…" : "Войти"}
        </button>
      </form>

      <div>
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-sub">
          Быстрый вход
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={pending}
              onClick={() => signIn(acc.email, acc.password)}
              className={`group relative overflow-hidden rounded-2xl border ${acc.border} bg-panel-muted/85 p-5 text-left shadow-xl shadow-black/20 transition duration-200 ease-out hover:border-edge-strong hover:bg-panel/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${acc.accent} blur-2xl`}
              />
              <p className="relative text-base font-semibold text-ink">{acc.role}</p>
              <p className="relative mt-2 break-all font-mono text-xs text-accent-bright/90">
                {acc.email}
              </p>
              <p className="relative mt-3 text-xs font-medium text-accent/80 group-hover:text-accent-bright">
                Войти сразу →
              </p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
