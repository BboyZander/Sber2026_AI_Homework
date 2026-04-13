"use client";

import { useState } from "react";
import { clearDemoPersistedState } from "@/lib/demo-state";
import { DEMO_COPY } from "@/lib/ui-copy";

export function LoginDemoReset() {
  const [done, setDone] = useState(false);

  function reset() {
    if (!confirm(DEMO_COPY.resetConfirm)) return;
    clearDemoPersistedState();
    setDone(true);
    window.setTimeout(() => setDone(false), 5000);
  }

  return (
    <div className="mt-8 border-t border-edge pt-6 text-center">
      {done ? (
        <p className="text-sm font-medium text-accent-bright" role="status">
          {DEMO_COPY.resetDone}
        </p>
      ) : (
        <button
          type="button"
          className="border-0 bg-transparent text-sm text-sub underline-offset-2 transition hover:text-ink hover:underline"
          onClick={reset}
        >
          Сбросить данные демо в этом браузере
        </button>
      )}
      <p className="mt-2 text-xs leading-relaxed text-sub-deep">
        Перед скринкастом или чистым прогоном. В кабинете то же самое — в меню по имени в шапке.
      </p>
    </div>
  );
}
