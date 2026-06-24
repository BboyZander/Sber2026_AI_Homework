"use client";

import { useEffect, useState } from "react";
import { fetchAgentStatus, runAgentTurn } from "@/lib/agent-client";
import {
  getStoredAgentHistory,
  getStoredAgentMessages,
  getStoredAgentOpen,
  setStoredAgentHistory,
  setStoredAgentMessages,
  setStoredAgentOpen,
} from "@/lib/agent-session-store";
import type { AgentLocalMessage, AgentRunHistoryItem } from "@/lib/agent/contract";
import { AssistantFab } from "./AssistantFab";
import { AssistantChatPanel } from "./AssistantChatPanel";

/**
 * Точка монтирования ИИ-ассистента (E17) в AppShell подростка.
 * Сам решает, виден ли FAB (ключ + рантайм-флаг), и держит весь стейт диалога.
 */
export function AssistantRoot() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(getStoredAgentOpen);
  const [messages, setMessages] = useState<AgentLocalMessage[]>(getStoredAgentMessages);
  const [history, setHistory] = useState<AgentRunHistoryItem[]>(getStoredAgentHistory);
  const [streaming, setStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    void fetchAgentStatus().then(setEnabled);
  }, []);

  // Переход на карточку задачи и обратно — soft-навигация: AssistantRoot
  // перемонтируется, но модульный стейт сохраняет диалог между перерисовками.
  useEffect(() => {
    setStoredAgentOpen(open);
  }, [open]);

  useEffect(() => {
    setStoredAgentMessages(messages);
  }, [messages]);

  useEffect(() => {
    setStoredAgentHistory(history);
  }, [history]);

  async function handleSend(text: string) {
    setErrorMessage(undefined);
    const placeholderIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setStreaming(true);

    const result = await runAgentTurn(history, text, (chunkSoFar) => {
      setMessages((prev) => {
        const next = [...prev];
        next[placeholderIndex] = { role: "assistant", content: chunkSoFar };
        return next;
      });
    });

    setMessages((prev) => {
      const next = [...prev];
      next[placeholderIndex] = { role: "assistant", content: result.text, actions: result.actions };
      return next;
    });
    setHistory(result.history);
    setErrorMessage(result.errorMessage);
    setStreaming(false);
  }

  function handleClear() {
    setMessages([]);
    setHistory([]);
    setErrorMessage(undefined);
  }

  if (!enabled) return null;

  return (
    <>
      <AssistantFab onClick={() => setOpen(true)} hidden={open} />
      <AssistantChatPanel
        open={open}
        messages={messages}
        streaming={streaming}
        errorMessage={errorMessage}
        onClose={() => setOpen(false)}
        onSend={handleSend}
        onClear={handleClear}
      />
    </>
  );
}
