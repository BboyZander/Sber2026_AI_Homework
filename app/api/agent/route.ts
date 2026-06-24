import { NextResponse } from "next/server";
import { Agent, run, setDefaultOpenAIKey, user, type AgentInputItem } from "@openai/agents";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServerTeenProfile } from "@/lib/supabase/queries";
import { buildAgentTeenContext } from "@/lib/agent/context";
import { buildAssistantAgent } from "@/lib/agent/agents";
import { checkAndIncrementAgentUsage, isAgentEnabled } from "@/lib/agent/guard";
import { AGENT_ACTIONS_SENTINEL, type AgentTurnPayload } from "@/lib/agent/contract";

export const runtime = "nodejs";

/**
 * Чат с ИИ-ассистентом подростка (E17). Личный OpenAI-ключ → жёсткий гейт:
 * флаг + дневной лимит. Стримит текст ответа, затем — JSON структурных действий
 * (рекомендации/предложения откликнуться), накопленных инструментами за ход.
 */
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "unauthorized", message: "Не авторизован" }, { status: 401 });
  }

  const teen = await getServerTeenProfile();
  if (!teen) {
    return NextResponse.json({ error: "forbidden", message: "Доступно только подросткам" }, { status: 403 });
  }

  if (!(await isAgentEnabled())) {
    return NextResponse.json(
      { error: "disabled", message: "Ассистент временно недоступен" },
      { status: 503 },
    );
  }

  const usage = await checkAndIncrementAgentUsage(teen.id);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: `Дневной лимит сообщений (${usage.limit}) исчерпан. Возвращайся завтра!` },
      { status: 429 },
    );
  }

  let priorHistory: AgentInputItem[] = [];
  let message = "";
  try {
    const body = (await req.json()) as { history?: AgentInputItem[]; message?: string };
    priorHistory = Array.isArray(body.history) ? body.history : [];
    message = typeof body.message === "string" ? body.message : "";
  } catch {
    // пустое/некорректное тело — упадём на проверке ниже
  }
  if (!message.trim()) {
    return NextResponse.json({ error: "server_error", message: "Пустое сообщение" }, { status: 400 });
  }

  setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

  const ctx = buildAgentTeenContext(teen);
  const toolsState = { recommendations: [], applyProposals: [], taskDetails: [] };
  const agent: Agent = buildAssistantAgent(teen, ctx, toolsState);

  // Полная история (включая function-call'ы и их результаты с реальными id задач)
  // переживает ход на клиенте — иначе агент на следующем сообщении не может сослаться
  // на задачу из своей же рекомендации и вынужден искать её заново.
  const inputItems: AgentInputItem[] = [...priorHistory, user(message)];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await run(agent, inputItems, { stream: true });
        const textStream = result.toTextStream();
        for await (const chunk of textStream as unknown as AsyncIterable<string>) {
          controller.enqueue(encoder.encode(chunk));
        }
        await result.completed;
        const payload: AgentTurnPayload = { actions: toolsState, history: result.history };
        controller.enqueue(encoder.encode(AGENT_ACTIONS_SENTINEL + JSON.stringify(payload)));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Ошибка ассистента";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
