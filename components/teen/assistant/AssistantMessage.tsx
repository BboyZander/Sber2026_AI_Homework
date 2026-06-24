"use client";

import type { AgentChatMessage } from "@/lib/agent/contract";

export function AssistantMessage({ message }: { message: AgentChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-accent to-accent-dark text-white"
            : "border border-edge bg-panel text-ink"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
