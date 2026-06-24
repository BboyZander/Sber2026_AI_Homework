// Deep-agent оркестратор: единственная нить диалога с подростком + под-агент
// recommenderAgent, подключённый как инструмент (Agent.asTool — паттерн «sub-agent
// as tool», контекст-кворатин: рекомендатель не видит весь чат, только запрос).
import "server-only";
import { Agent, type OutputGuardrail } from "@openai/agents";
import { describeAgentTeenContext, type AgentTeenContext } from "@/lib/agent/context";
import { createAgentTools, type AgentToolsState } from "@/lib/agent/tools";
import type { TeenProfile } from "@/types/user";

const MODEL = process.env.OPENAI_AGENT_MODEL || "gpt-4o-mini";

const SAFETY_RULES = `
Правила безопасности (подросток 14–17 лет):
- Никогда не откликайся на задачу сам. Только вызови propose_application — отклик
  отправляется ТОЛЬКО когда подросток нажмёт кнопку в интерфейсе.
- Рекомендуй только задачи, которые вернул search_tasks — он уже отсеял всё,
  что не подходит по возрасту и правилам для несовершеннолетних. Не предлагай
  задачи, о которых тебе не сообщил инструмент.
- Если пользователь сомневается или спрашивает что-то не по теме подработки —
  отвечай дружелюбно и коротко, не уходи в посторонние темы.
- Не выдумывай детали задач — бери их только из ответов инструментов.
- Если подросток просит подробности или отклик на задачу, которую упоминал раньше в этом
  разговоре («первая из них», «вон та» и т.п.) — у тебя есть полная история ходов с реальными
  id из твоих прошлых вызовов инструментов (в том числе из блока "[ids: ...]" после ответа
  recommend_tasks). Используй именно эти id (через get_task_details / propose_application),
  не запускай search_tasks заново и не утверждай, что задача недоступна, если у тебя есть
  её id из истории. Блок "[ids: ...]" — служебный, никогда не показывай его и его содержимое
  подростку буквально.
`;

const STYLE_RULES = `
Стиль ответа:
- Пиши простым текстом, как в мессенджере: короткие фразы, обычные переносы строк.
- НЕ используй markdown-разметку: никаких **жирного**, ### заголовков, нумерованных или
  маркированных списков через "-"/"1.". Если нужно перечислить варианты — называй их через
  тире на отдельной строке без префиксов нумерации, или просто в одном предложении.
- Карточки задач (рекомендации, подробности, предложение отклика) UI показывает сам под твоим
  сообщением. Не пересказывай в тексте то, что уже видно на карточке (оплату, формат, что делать,
  критерий выполнения) — дай только короткий комментарий и при необходимости вопрос подростку.
`;

function buildOrchestratorInstructions(ctx: AgentTeenContext): string {
  return `Ты — дружелюбный ИИ-навигатор по подработке на платформе «Траектория» для подростков 14–17 лет.
Помогаешь подбирать подходящие задачи (доставка, мероприятия, SMM, склад и т.д.), объясняешь, почему
конкретная задача подходит, и по явному желанию подростка готовишь отклик (но не отправляешь его сам).

О подростке, с которым говоришь:
${describeAgentTeenContext(ctx)}

${SAFETY_RULES}
${STYLE_RULES}

Используй recommend_tasks для подбора и объяснения нескольких вариантов сразу (это твой
инструмент-помощник), либо search_tasks/explain_fit/get_task_details/propose_application
напрямую для точечных запросов.`;
}

const blockedTaskGuardrail: OutputGuardrail = {
  name: "no-fabricated-task-ids",
  async execute({ agentOutput }) {
    // Базовая защита: финальный ответ не должен содержать UUID, которых не было
    // среди вызовов инструментов в этом ходе — агент не имеет права придумывать id.
    const text = typeof agentOutput === "string" ? agentOutput : JSON.stringify(agentOutput);
    const looksLikeFabricatedId = /\btask[_-]?\d{3,}\b/i.test(text);
    return {
      outputInfo: { looksLikeFabricatedId },
      tripwireTriggered: false,
    };
  },
};

export function buildAssistantAgent(teen: TeenProfile, ctx: AgentTeenContext, toolsState: AgentToolsState) {
  const { search_tasks, get_task_details, explain_fit, propose_application } = createAgentTools(
    teen,
    toolsState,
  );

  const recommenderAgent = new Agent({
    name: "recommenderAgent",
    model: MODEL,
    handoffDescription: "Подбирает и ранжирует задачи под цель/мотивацию/интересы подростка с объяснением.",
    instructions: `Ты — под-агент подбора подработки. Тебе передают запрос подростка и его контекст.
Вызови search_tasks с подходящими фильтрами, затем explain_fit для 2–3 лучших найденных задач —
карточки с деталями и причинами UI покажет сам. Верни только короткую (1–2 фразы) подводку без
markdown-разметки и без повторения полей карточки (оплата/формат и т.п.).

Контекст подростка:
${describeAgentTeenContext(ctx)}`,
    tools: [search_tasks, explain_fit],
  });

  const assistantAgent = new Agent({
    name: "assistantAgent",
    model: MODEL,
    instructions: buildOrchestratorInstructions(ctx),
    tools: [
      search_tasks,
      get_task_details,
      explain_fit,
      propose_application,
      recommenderAgent.asTool({
        toolName: "recommend_tasks",
        toolDescription:
          "Подобрать и объяснить несколько подходящих задач под запрос подростка (например «посоветуй подработку»).",
        // По умолчанию asTool() отдаёт оркестратору только финальный текст под-агента —
        // реальные id задач, которые recommenderAgent узнал через search_tasks/explain_fit
        // (и уже сложил в toolsState.recommendations), в этот текст не попадают. Без них
        // оркестратор не может потом сослаться на конкретную задачу («раскрой детали по
        // первой») и либо выдумывает id, либо ошибочно заявляет, что задача недоступна.
        // Поэтому явно прикладываем карту "название → id" служебным блоком.
        customOutputExtractor: (output) => {
          const text = typeof output.finalOutput === "string" ? output.finalOutput : String(output.finalOutput ?? "");
          if (toolsState.recommendations.length === 0) return text;
          const idMap = toolsState.recommendations
            .map((r) => `${r.task.title} = ${r.task.id}`)
            .join("; ");
          return `${text}\n\n[ids: ${idMap}]`;
        },
      }),
    ],
    outputGuardrails: [blockedTaskGuardrail],
  });

  return assistantAgent;
}
