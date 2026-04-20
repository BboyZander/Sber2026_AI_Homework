import type {
  DurationBucket,
  EngagementType,
  MinorComplianceStatus,
  PhysicalLoadLevel,
  TaskCategory,
  TaskStatus,
  WorkFormat,
} from "@/lib/constants";

export type TaskPaymentType = "fixed" | "hourly";

export interface Task {
  id: string;
  title: string;
  description: string;
  employerId: string;
  employerName: string;
  category: TaskCategory;
  status: TaskStatus;
  rewardXp: number;
  /** Фикс: сумма за задачу ₽. Почасовая: ставка ₽/ч. */
  paymentType: TaskPaymentType;
  paymentAmount: number;
  /** Только для почасовой: ожидаемая длительность в часах. */
  estimatedHours?: number;
  /**
   * Оценка «всего ₽ за задачу» для сортировки и демо-кошелька (ставка×часы или фикс).
   * Синхронизируется вместе с payment*.
   */
  payRub: number;
  workFormat: WorkFormat;
  durationBucket: DurationBucket;
  /** Человекочитаемо: «до 2 ч», «полдня» */
  durationLabel: string;
  location?: string;
  /** Возрастной диапазон для исполнителя (демо). */
  minAge?: number;
  maxAge?: number;
  engagementType: EngagementType;
  startDateTime: string;
  durationHours: number;
  weeklyHoursExpected: number;
  duringSchoolPeriodAllowed: boolean;
  duringVacationAllowed: boolean;
  requiresMedicalExam: boolean;
  physicalLoadLevel: PhysicalLoadLevel;
  isOutdoor: boolean;
  minorComplianceStatus: MinorComplianceStatus;
  minorComplianceReasons: string[];
  deadline?: string;
  createdAt: string;
}
