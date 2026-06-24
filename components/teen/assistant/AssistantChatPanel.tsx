"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AssistantMessage } from "./AssistantMessage";
import { TaskRecommendationCard } from "./TaskRecommendationCard";
import { TaskDetailCard } from "./TaskDetailCard";
import { ApplyProposalCard } from "./ApplyProposalCard";
import type { AgentLocalMessage } from "@/lib/agent/contract";

const SPRING = { type: "spring" as const, damping: 30, stiffness: 300 };

type Props = {
  open: boolean;
  messages: AgentLocalMessage[];
  streaming: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSend: (text: string) => void;
  onClear: () => void;
};

export function AssistantChatPanel({
  open,
  messages,
  streaming,
  errorMessage,
  onClose,
  onSend,
  onClear,
}: Props) {
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, streaming]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    onSend(text);
    setInput("");
  }

  const header = (
    <div className="flex shrink-0 items-center justify-between border-b border-edge px-4 py-3">
      <div>
        <p className="m-0 text-sm font-semibold text-ink">ИИ-ассистент</p>
        <p className="m-0 text-xs text-sub">Подскажет подработку и объяснит, почему подходит</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-sub transition hover:text-ink"
        >
          Очистить
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-sub transition hover:text-ink"
          aria-label="Закрыть ассистента"
        >
          ✕
        </button>
      </div>
    </div>
  );

  const body = (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-edge px-3 py-6 text-center text-sm text-sub">
            Привет! Спроси меня, например: «Посоветуй подработку рядом» или «Что есть на выходные?»
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-2">
            <AssistantMessage message={m} />
            {m.actions?.recommendations.map((r) => (
              <TaskRecommendationCard key={r.task.id} recommendation={r} />
            ))}
            {m.actions?.taskDetails.map((d) => (
              <TaskDetailCard key={d.task.id} detail={d} />
            ))}
            {m.actions?.applyProposals.map((p) => (
              <ApplyProposalCard key={p.task.id} proposal={p} />
            ))}
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-edge bg-panel px-3.5 py-2.5 text-sm text-sub">
              печатает…
            </div>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );

  const inputRow = (
    <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-edge px-4 py-3">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Напиши сообщение…"
        className="min-w-0 flex-1 rounded-xl border border-edge bg-panel px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/60"
      />
      <button
        type="submit"
        disabled={streaming || !input.trim()}
        className="ui-btn-primary px-4 py-2 text-sm disabled:opacity-60"
      >
        Отправить
      </button>
    </form>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {isMobile ? (
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed inset-x-0 bottom-0 top-[56px] z-[61] flex flex-col rounded-t-2xl border-t border-edge bg-canvas shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRING}
            >
              {header}
              {body}
              {inputRow}
            </motion.div>
          ) : (
            <motion.div
              role="dialog"
              aria-modal="true"
              className="fixed inset-y-0 right-0 z-[61] flex w-[min(420px,92vw)] flex-col border-l border-edge bg-canvas shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              {header}
              {body}
              {inputRow}
            </motion.div>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );
}
