"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "teen" | "employer";

const ROLES: { value: Role; label: string }[] = [
  { value: "teen", label: "Подросток" },
  { value: "employer", label: "Работодатель" },
];

export function RegisterForm() {
  const [role, setRole] = useState<Role>("teen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    if (data.session) {
      // Подтверждение e-mail выключено — сессия уже есть, создаём профиль и входим.
      // window.location.href нужен для полного GET-запроса: router.push не следует
      // серверным редиректам Route Handler (callback → /teen/onboarding).
      window.location.href = "/auth/callback";
    } else {
      // Подтверждение e-mail включено — ждём перехода по ссылке из письма.
      setCheckEmail(true);
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-edge bg-panel-muted/95 px-4 py-3 text-sm text-ink outline-none ring-accent/40 transition placeholder:text-sub-deep focus:border-accent/45 focus:ring-2";

  if (checkEmail) {
    return (
      <div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-5 text-sm text-sub">
        <p className="m-0 font-semibold text-ink">Проверь почту</p>
        <p className="mt-2 leading-relaxed">
          Отправили письмо на <span className="text-ink">{email}</span>. Перейди по ссылке из
          письма, чтобы подтвердить адрес и войти.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-medium text-sub">Я регистрируюсь как</span>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === r.value
                    ? "border-accent/50 bg-accent/12 text-ink"
                    : "border-edge bg-panel-muted/85 text-sub hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-sub">
            {role === "employer" ? "Наименование компании" : "Имя"}
          </span>
          <input
            type="text"
            name="name"
            autoComplete={role === "employer" ? "organization" : "name"}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className={inputClass}
            required
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className={inputClass}
            minLength={6}
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
          {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-sub">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent-bright underline-offset-4 hover:underline"
        >
          Войти
        </Link>
      </p>
    </motion.div>
  );
}
