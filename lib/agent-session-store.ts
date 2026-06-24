"use client";

// Переживает диалог между soft-навигациями: AssistantRoot монтируется внутри
// AppShell, а AppShell создаётся заново на каждой странице (в app/teen/* нет
// общего layout.tsx) — без модульного стейта переход на карточку задачи по
// рекомендации сбрасывал чат. Модуль не перезагружается при client-side навигации.
import type { AgentLocalMessage, AgentRunHistoryItem } from "@/lib/agent/contract";

let storedMessages: AgentLocalMessage[] = [];
let storedOpen = false;
let storedHistory: AgentRunHistoryItem[] = [];

export function getStoredAgentMessages(): AgentLocalMessage[] {
  return storedMessages;
}

export function setStoredAgentMessages(messages: AgentLocalMessage[]): void {
  storedMessages = messages;
}

export function getStoredAgentOpen(): boolean {
  return storedOpen;
}

export function setStoredAgentOpen(open: boolean): void {
  storedOpen = open;
}

/** Модельная история хода (function-call'ы с реальными id задач) — для непрерывности. */
export function getStoredAgentHistory(): AgentRunHistoryItem[] {
  return storedHistory;
}

export function setStoredAgentHistory(history: AgentRunHistoryItem[]): void {
  storedHistory = history;
}
