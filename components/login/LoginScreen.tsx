"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  getDemoUserByCredentials,
  redirectPathAfterDemoLogin,
  setMockSession,
} from "@/lib/auth";
import { LOGIN_COPY } from "@/lib/ui-copy";

const QUICK_ACCOUNTS = [
  {
    role: "Подросток",
    login: "demo_teen",
    password: "demo123",
    accent: "from-accent/20 to-accent-dark/10",
    border: "border-accent/30",
  },
  {
    role: "Работодатель",
    login: "demo_employer",
    password: "demo123",
    accent: "from-accent/18 to-accent-dark/10",
    border: "border-accent/28",
  },
] as const;

export function LoginScreen() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tryAuth = useCallback(
    (l: string, p: string) => {
      setError(null);
      const user = getDemoUserByCredentials(l, p);
      if (!user) {
        setError(LOGIN_COPY.invalidCredentials);
        return;
      }
      setMockSession({ userId: user.id, role: user.role });
      router.push(redirectPathAfterDemoLogin(user));
    },
    [router],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    tryAuth(login, password);
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
          <span className="text-sm font-medium text-sub">Логин</span>
          <input
            type="text"
            name="login"
            autoComplete="username"
            value={login}
            onChange={(e) => {
              setLogin(e.target.value);
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
          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-dark py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition duration-200 ease-out hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98]"
        >
          Войти
        </button>
      </form>

      <div>
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-sub">
          Быстрый вход
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_ACCOUNTS.map((acc) => (
            <button
              key={acc.login}
              type="button"
              onClick={() => tryAuth(acc.login, acc.password)}
              className={`group relative overflow-hidden rounded-2xl border ${acc.border} bg-panel-muted/85 p-5 text-left shadow-xl shadow-black/20 transition duration-200 ease-out hover:border-edge-strong hover:bg-panel/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98]`}
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${acc.accent} blur-2xl`}
              />
              <p className="relative text-base font-semibold text-ink">{acc.role}</p>
              <p className="relative mt-2 font-mono text-xs text-sub">
                <span className="text-accent-bright/90">{acc.login}</span>
                <span className="text-sub-deep"> / </span>
                <span className="text-sub">{acc.password}</span>
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
