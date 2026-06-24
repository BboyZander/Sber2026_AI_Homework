// Контракт между сервером (app/api/agent) и клиентом (lib/agent-client.ts).
// Общие типы держим в одном месте, чтобы стрим текста и структурные действия
// (рекомендации, предложения откликнуться) были типобезопасны на обоих концах.

export type AgentChatRole = "user" | "assistant";

export type AgentChatMessage = {
  role: AgentChatRole;
  content: string;
};

/** Компактная карточка задачи для рекомендаций (context offloading — без полного Task). */
export type AgentTaskSummary = {
  id: string;
  title: string;
  payRub: number;
  paymentLabel: string;
  category: string;
  categoryLabel: string;
  workFormat: "online" | "offline";
  workFormatLabel: string;
  durationLabel: string;
};

export type AgentRecommendation = {
  task: AgentTaskSummary;
  reasons: { id: string; icon: string; text: string }[];
};

/** Предложение откликнуться: требует явного клика в UI (human-in-the-loop). */
export type AgentApplyProposal = {
  task: AgentTaskSummary;
  allowed: boolean;
  blockReason?: string;
};

/** Полная карточка задачи (виджет вместо markdown-простыни в тексте ответа). */
export type AgentTaskDetail = {
  task: AgentTaskSummary;
  description: string;
  whatToDo: string;
  completionCriteria: string;
  contactPerson: string;
  location: string | null;
};

/** Структурные действия, которые агент собрал за ход — летят отдельным событием после текста. */
export type AgentTurnActions = {
  recommendations: AgentRecommendation[];
  applyProposals: AgentApplyProposal[];
  taskDetails: AgentTaskDetail[];
};

/** Полная история хода для модели (function-call'ы и их результаты, включая id задач) —
 * непрозрачный блоб, переживающий ход, чтобы агент мог сослаться на задачу из предыдущего
 * сообщения без повторного поиска. Сервер заполняет/использует, клиент только хранит. */
export type AgentRunHistoryItem = unknown;

export type AgentTurnPayload = {
  actions: AgentTurnActions;
  history: AgentRunHistoryItem[];
};

export const AGENT_ACTIONS_SENTINEL = "\n__AGENT_ACTIONS__:";

/** Сообщение в клиентском стейте чата: история + действия, привязанные к ходу ассистента. */
export type AgentLocalMessage = AgentChatMessage & { actions?: AgentTurnActions };

export type AgentStatusResponse = { enabled: boolean };

export type AgentErrorCode = "unauthorized" | "forbidden" | "disabled" | "rate_limited" | "server_error";

export type AgentErrorResponse = { error: AgentErrorCode; message: string };
