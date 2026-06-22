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
  /** Структурированное описание задачи (F3.1): что конкретно делать. */
  whatToDo: string;
  /** Структурированное описание задачи (F3.1): по каким критериям подросток поймёт, что задача выполнена. */
  completionCriteria: string;
  /** Структурированное описание задачи (F3.1): к кому обращаться по вопросам. */
  contactPerson: string;
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
  /** Время задано точно (явка к startDateTime) или гибкий график — успеть сделать к сроку (F2.6). */
  hasFixedSchedule: boolean;
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
  /** E5: рейтинг работодателя, денормализованный через JOIN при загрузке каталога. */
  employerRating?: number;
  /** E5: число отзывов работодателя. */
  employerReviewsCount?: number;
  /** E2.7: координаты для гео-фильтра (только офлайн-задачи). */
  lat?: number;
  lng?: number;
}
