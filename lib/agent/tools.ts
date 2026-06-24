// Инструменты ассистента: тонкие обёртки над уже существующей бизнес-логикой
// каталога/compliance/фита (lib/teen-task-*, lib/minor-compliance, lib/task-age).
// Агент сам не придумывает данные — только читает то, что разрешено эвристикой.
import "server-only";
import { z } from "zod";
import { tool } from "@openai/agents";
import { CATEGORY_LABELS, WORK_FORMAT_LABELS, type TaskCategory, type WorkFormat } from "@/lib/constants";
import { getOpenTasks } from "@/lib/supabase/queries";
import { filterTeenCatalogTasks } from "@/lib/teen-task-catalog-filter";
import { computeTaskFitReasons } from "@/lib/teen-task-fit";
import { teenCanRespondByAge } from "@/lib/task-age";
import { currentMinorPeriod, getMinorComplianceResult } from "@/lib/minor-compliance";
import { taskPaymentEmployerSummary } from "@/lib/task-payment";
import type { Task } from "@/types/task";
import type { TeenProfile } from "@/types/user";
import type {
  AgentApplyProposal,
  AgentRecommendation,
  AgentTaskDetail,
  AgentTaskSummary,
} from "@/lib/agent/contract";

const SEARCH_TASKS_LIMIT = 5;

function toSummary(task: Task): AgentTaskSummary {
  return {
    id: task.id,
    title: task.title,
    payRub: task.payRub,
    paymentLabel: taskPaymentEmployerSummary(task),
    category: task.category,
    categoryLabel: CATEGORY_LABELS[task.category],
    workFormat: task.workFormat,
    workFormatLabel: WORK_FORMAT_LABELS[task.workFormat],
    durationLabel: task.durationLabel,
  };
}

/** Задачи, разрешённые подростку по возрасту и compliance — единая точка отсева. */
function allowedTasksForTeen(tasks: Task[], teen: TeenProfile): Task[] {
  return filterTeenCatalogTasks(tasks, {
    query: "",
    category: null,
    workFormat: "all",
    maxDurationHours: null,
    paymentType: "all",
    weekday: "all",
    schedule: "all",
    sort: "recommended",
    ageFitMode: "mine",
    teenAge: teen.age,
  });
}

export type AgentToolsState = {
  recommendations: AgentRecommendation[];
  applyProposals: AgentApplyProposal[];
  taskDetails: AgentTaskDetail[];
};

/**
 * Создаёт набор tool() для одного хода ассистента. `state` собирает структурные
 * действия (рекомендации/предложения отклика) — UI берёт их из financial-сентинела
 * после текстового стрима (см. app/api/agent/route.ts).
 */
export function createAgentTools(teen: TeenProfile, state: AgentToolsState) {
  const search_tasks = tool({
    name: "search_tasks",
    description:
      "Найти открытые задачи (подработки) на платформе, доступные подростку по возрасту и правилам 14–17 лет. " +
      "Используй category/format/query, чтобы сузить поиск под запрос подростка. Возвращает компактный список (без полного описания).",
    parameters: z.object({
      query: z.string().nullable().describe("Поисковый текст (название/категория), или null"),
      category: z
        .enum([
          "delivery", "events", "promo", "creative", "smm", "data", "warehouse", "household", "other",
        ])
        .nullable()
        .describe("Категория задачи, или null без фильтра"),
      format: z.enum(["online", "offline", "all"]).describe("Формат работы"),
      maxHours: z.number().nullable().describe("Максимальная длительность в часах, или null без ограничения"),
    }),
    async execute({ query, category, format, maxHours }) {
      const all = await getOpenTasks();
      const allowed = allowedTasksForTeen(all, teen);

      const baseFilter = {
        workFormat: format as WorkFormat | "all",
        maxDurationHours: maxHours ?? null,
        paymentType: "all" as const,
        weekday: "all" as const,
        schedule: "all" as const,
        sort: "recommended" as const,
        ageFitMode: "all" as const,
      };

      // Категорию модель угадывает по тексту запроса и иногда промахивается (например
      // «ПВЗ» → delivery, хотя реальная категория — warehouse). Жёсткий AND category+query
      // в таком случае обрезает всё до нуля, хотя по чистому тексту задачи нашлись бы.
      // Поэтому ослабляем фильтр по шагам, пока не появятся результаты.
      let filtered = filterTeenCatalogTasks(allowed, {
        ...baseFilter,
        query: query ?? "",
        category: (category as TaskCategory | null) ?? null,
      });
      if (filtered.length === 0 && category) {
        filtered = filterTeenCatalogTasks(allowed, { ...baseFilter, query: query ?? "", category: null });
      }
      if (filtered.length === 0 && query) {
        filtered = filterTeenCatalogTasks(allowed, { ...baseFilter, query: "", category: null });
      }

      const top = filtered.slice(0, SEARCH_TASKS_LIMIT).map(toSummary);
      return JSON.stringify({ count: top.length, tasks: top });
    },
  });

  const get_task_details = tool({
    name: "get_task_details",
    description:
      "Получить полную информацию по одной задаче (описание, что делать, критерий выполнения) по её id. " +
      "Подробная карточка автоматически показывается подростку в интерфейсе — НЕ пересказывай все поля " +
      "(оплату, формат, что делать) в своём текстовом ответе, это дублирует карточку. Дай только короткий " +
      "комментарий (1–2 фразы) и спроси, готов ли подросток откликнуться.",
    parameters: z.object({ taskId: z.string() }),
    async execute({ taskId }) {
      const all = await getOpenTasks();
      const task = all.find((t) => t.id === taskId);
      if (!task) return JSON.stringify({ found: false });
      state.taskDetails.push({
        task: toSummary(task),
        description: task.description,
        whatToDo: task.whatToDo,
        completionCriteria: task.completionCriteria,
        contactPerson: task.contactPerson,
        location: task.location ?? null,
      });
      return JSON.stringify({
        found: true,
        title: task.title,
        description: task.description,
        whatToDo: task.whatToDo,
        completionCriteria: task.completionCriteria,
        contactPerson: task.contactPerson,
        payment: taskPaymentEmployerSummary(task),
        category: CATEGORY_LABELS[task.category],
        workFormat: WORK_FORMAT_LABELS[task.workFormat],
        durationLabel: task.durationLabel,
        location: task.location ?? null,
      });
    },
  });

  const explain_fit = tool({
    name: "explain_fit",
    description:
      "Объяснить, почему конкретная задача подходит подростку (детерминированные причины, не выдумывай свои). " +
      "Вызови после search_tasks, когда хочешь показать рекомендацию с обоснованием.",
    parameters: z.object({ taskId: z.string() }),
    async execute({ taskId }) {
      const all = await getOpenTasks();
      const task = all.find((t) => t.id === taskId);
      if (!task) return JSON.stringify({ found: false });
      const reasons = computeTaskFitReasons(task, teen);
      state.recommendations.push({ task: toSummary(task), reasons });
      return JSON.stringify({ found: true, reasons });
    },
  });

  const propose_application = tool({
    name: "propose_application",
    description:
      "Подготовить предложение откликнуться на задачу. НЕ откликается сам — только формирует карточку с кнопкой, " +
      "которую увидит подросток. Используй только после явного интереса подростка к конкретной задаче.",
    parameters: z.object({ taskId: z.string() }),
    async execute({ taskId }) {
      const all = await getOpenTasks();
      const task = all.find((t) => t.id === taskId);
      if (!task) {
        return JSON.stringify({ allowed: false, reason: "Задача не найдена или больше не открыта" });
      }
      const ageOk = teenCanRespondByAge(task, teen.age);
      const compliance = getMinorComplianceResult(task, currentMinorPeriod());
      const allowed = ageOk && compliance.status !== "blocked";
      const blockReason = !ageOk
        ? "Не подходит по возрасту"
        : compliance.status === "blocked"
          ? compliance.reasons[0] ?? "Недоступно по правилам для несовершеннолетних"
          : undefined;
      state.applyProposals.push({ task: toSummary(task), allowed, blockReason });
      return JSON.stringify({ allowed, blockReason: blockReason ?? null });
    },
  });

  return { search_tasks, get_task_details, explain_fit, propose_application };
}
