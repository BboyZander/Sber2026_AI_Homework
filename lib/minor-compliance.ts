import type { MinorComplianceStatus } from "@/lib/constants";
import type { Task } from "@/types/task";

export type ComplianceAgeGroup = "14_15" | "16_17";
export type CompliancePeriod = "school" | "vacation";

export type MinorComplianceResult = {
  status: MinorComplianceStatus;
  reasons: string[];
  warnings: string[];
};

type ComplianceLimits = {
  maxShiftHours: number;
};

const LIMITS: Record<ComplianceAgeGroup, ComplianceLimits> = {
  "14_15": { maxShiftHours: 4 },
  "16_17": { maxShiftHours: 7 },
};

function ageGroupForTask(task: Pick<Task, "minAge">): ComplianceAgeGroup {
  return (task.minAge ?? 14) <= 15 ? "14_15" : "16_17";
}

function isNightStart(startDateTime: string): boolean {
  const dt = new Date(startDateTime);
  if (Number.isNaN(dt.getTime())) return false;
  const h = dt.getHours();
  return h >= 22 || h < 6;
}

function isWeekend(startDateTime: string): boolean {
  const dt = new Date(startDateTime);
  if (Number.isNaN(dt.getTime())) return false;
  const day = dt.getDay();
  return day === 0 || day === 6;
}

export function currentMinorPeriod(now = new Date()): CompliancePeriod {
  const month = now.getMonth() + 1;
  return month >= 6 && month <= 8 ? "vacation" : "school";
}

export function getMinorComplianceResult(
  task: Pick<
    Task,
    | "minAge"
    | "maxAge"
    | "engagementType"
    | "startDateTime"
    | "durationHours"
    | "duringSchoolPeriodAllowed"
    | "duringVacationAllowed"
    | "requiresMedicalExam"
    | "physicalLoadLevel"
    | "isOutdoor"
  >,
  period: CompliancePeriod,
): MinorComplianceResult {
  const blocked: string[] = [];
  const warnings: string[] = [];

  const group = ageGroupForTask(task);
  const limits = LIMITS[group];

  if (isNightStart(task.startDateTime)) {
    blocked.push("Ночное время недоступно для несовершеннолетних.");
  }
  if (isWeekend(task.startDateTime)) {
    blocked.push("Задачи на выходных в MVP недоступны для несовершеннолетних.");
  }

  if (task.durationHours > limits.maxShiftHours) {
    blocked.push(
      `Продолжительность ${task.durationHours} ч превышает лимит ${limits.maxShiftHours} ч для выбранного возраста.`,
    );
  }

  if (task.requiresMedicalExam) {
    warnings.push("Задача требует медосмотра: проверьте допустимость и документы.");
  }
  if (task.isOutdoor) {
    warnings.push("Работа на улице: уточните безопасные условия и продолжительность.");
  }

  if (period === "school" && !task.duringSchoolPeriodAllowed) {
    blocked.push("Задача недоступна в учебный период.");
  }
  if (period === "vacation" && !task.duringVacationAllowed) {
    blocked.push("Задача недоступна в каникулярный период.");
  }

  if (blocked.length > 0) return { status: "blocked", reasons: blocked, warnings };
  if (warnings.length > 0) return { status: "warning", reasons: warnings, warnings };
  return { status: "passed", reasons: [], warnings: [] };
}

