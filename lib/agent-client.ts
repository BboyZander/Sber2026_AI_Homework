"use client";

// Клиентский слой ассистента: статус (видимость FAB), стрим хода диалога,
// согласие на отклик — переиспользует существующий applyToTask (RLS + событие).
import { applyToTask } from "@/lib/teen-applications-client";
import { pushTeenToast } from "@/lib/teen-flow";
import {
  AGENT_ACTIONS_SENTINEL,
  type AgentRunHistoryItem,
  type AgentStatusResponse,
  type AgentTurnActions,
  type AgentTurnPayload,
} from "@/lib/agent/contract";

export async function fetchAgentStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/agent/status");
    if (!res.ok) return false;
    const data = (await res.json()) as AgentStatusResponse;
    return data.enabled;
  } catch {
    return false;
  }
}

export type AgentTurnResult = {
  text: string;
  actions: AgentTurnActions;
  history: AgentRunHistoryItem[];
  errorMessage?: string;
};

const EMPTY_ACTIONS: AgentTurnActions = { recommendations: [], applyProposals: [], taskDetails: [] };

/**
 * Отправляет новое сообщение + накопленную модельную историю хода (function-call'ы
 * с реальными id задач — иначе агент не сможет сослаться на свою же рекомендацию
 * на следующем сообщении) на /api/agent и стримит текст по мере поступления.
 */
export async function runAgentTurn(
  priorHistory: AgentRunHistoryItem[],
  message: string,
  onTextChunk: (chunkSoFar: string) => void,
): Promise<AgentTurnResult> {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history: priorHistory, message }),
  });

  if (!res.ok || !res.body) {
    let errorMessage = "Не получилось связаться с ассистентом";
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) errorMessage = data.message;
    } catch {
      // тело не JSON — оставляем дефолтное сообщение
    }
    return { text: "", actions: EMPTY_ACTIONS, history: priorHistory, errorMessage };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    raw += decoder.decode(value, { stream: true });
    const sentinelIdx = raw.indexOf(AGENT_ACTIONS_SENTINEL);
    const visibleSoFar = sentinelIdx >= 0 ? raw.slice(0, sentinelIdx) : raw;
    onTextChunk(visibleSoFar);
  }

  const sentinelIdx = raw.indexOf(AGENT_ACTIONS_SENTINEL);
  if (sentinelIdx < 0) {
    return { text: raw, actions: EMPTY_ACTIONS, history: priorHistory };
  }

  const text = raw.slice(0, sentinelIdx);
  const tail = raw.slice(sentinelIdx + AGENT_ACTIONS_SENTINEL.length);
  let actions = EMPTY_ACTIONS;
  let history = priorHistory;
  try {
    const payload = JSON.parse(tail) as AgentTurnPayload;
    actions = payload.actions;
    history = payload.history;
  } catch {
    // не удалось распарсить хвост — действия/историю просто не обновим
  }
  return { text, actions, history };
}

/** Согласие подростка на отклик (карточка с кнопкой) — реальный отклик через RLS. */
export async function confirmAgentApplyProposal(taskId: string): Promise<boolean> {
  const { added } = await applyToTask(taskId);
  if (added) pushTeenToast("Отклик отправлен");
  return added;
}
