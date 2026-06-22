// Мапперы строк Supabase (snake_case) ↔ типы домена (camelCase).
import type { Task, TaskPaymentType } from "@/types/task";
import type { Application } from "@/types/application";
import type {
  ApplicationStatus,
  DurationBucket,
  EngagementType,
  MinorComplianceStatus,
  PhysicalLoadLevel,
  TaskCategory,
  TaskStatus,
  WorkFormat,
} from "@/lib/constants";

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  what_to_do: string;
  completion_criteria: string;
  contact_person: string;
  employer_id: string;
  employer_name: string;
  category: string;
  status: string;
  reward_xp: number;
  payment_type: string;
  payment_amount: number;
  estimated_hours: number | null;
  pay_rub: number;
  work_format: string;
  duration_bucket: string;
  duration_label: string;
  location: string | null;
  min_age: number | null;
  max_age: number | null;
  engagement_type: string;
  has_fixed_schedule: boolean;
  start_date_time: string | null;
  duration_hours: number;
  weekly_hours_expected: number;
  during_school_period_allowed: boolean;
  during_vacation_allowed: boolean;
  requires_medical_exam: boolean;
  physical_load_level: string;
  is_outdoor: boolean;
  minor_compliance_status: string;
  minor_compliance_reasons: string[] | null;
  deadline: string | null;
  created_at: string;
  /** E5: из LEFT JOIN employer_profiles — может отсутствовать. */
  employer_rating?: number | null;
  employer_reviews_count?: number | null;
  /** E2.7: координаты офлайн-задачи. */
  lat?: number | null;
  lng?: number | null;
}

export function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    whatToDo: r.what_to_do,
    completionCriteria: r.completion_criteria,
    contactPerson: r.contact_person,
    employerId: r.employer_id,
    employerName: r.employer_name,
    category: r.category as TaskCategory,
    status: r.status as TaskStatus,
    rewardXp: r.reward_xp,
    paymentType: r.payment_type as TaskPaymentType,
    paymentAmount: r.payment_amount,
    estimatedHours: r.estimated_hours ?? undefined,
    payRub: r.pay_rub,
    workFormat: r.work_format as WorkFormat,
    durationBucket: r.duration_bucket as DurationBucket,
    durationLabel: r.duration_label,
    location: r.location ?? undefined,
    minAge: r.min_age ?? undefined,
    maxAge: r.max_age ?? undefined,
    engagementType: r.engagement_type as EngagementType,
    hasFixedSchedule: r.has_fixed_schedule,
    startDateTime: r.start_date_time ?? "",
    durationHours: r.duration_hours,
    weeklyHoursExpected: r.weekly_hours_expected,
    duringSchoolPeriodAllowed: r.during_school_period_allowed,
    duringVacationAllowed: r.during_vacation_allowed,
    requiresMedicalExam: r.requires_medical_exam,
    physicalLoadLevel: r.physical_load_level as PhysicalLoadLevel,
    isOutdoor: r.is_outdoor,
    minorComplianceStatus: r.minor_compliance_status as MinorComplianceStatus,
    minorComplianceReasons: r.minor_compliance_reasons ?? [],
    deadline: r.deadline ?? undefined,
    createdAt: r.created_at,
    employerRating: r.employer_rating ?? undefined,
    employerReviewsCount: r.employer_reviews_count ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
  };
}

/**
 * Task (camelCase) → строка БД (snake_case) для insert/update.
 * Исключены id/created_at (генерит БД) и lat/lng (задел E2.7, нет в типе Task).
 */
export function taskToRow(t: Task): Record<string, unknown> {
  return {
    title: t.title,
    description: t.description,
    what_to_do: t.whatToDo,
    completion_criteria: t.completionCriteria,
    contact_person: t.contactPerson,
    employer_id: t.employerId,
    employer_name: t.employerName,
    category: t.category,
    status: t.status,
    reward_xp: t.rewardXp,
    payment_type: t.paymentType,
    payment_amount: t.paymentAmount,
    estimated_hours: t.estimatedHours ?? null,
    pay_rub: t.payRub,
    work_format: t.workFormat,
    duration_bucket: t.durationBucket,
    duration_label: t.durationLabel,
    location: t.location ?? null,
    min_age: t.minAge ?? null,
    max_age: t.maxAge ?? null,
    engagement_type: t.engagementType,
    has_fixed_schedule: t.hasFixedSchedule,
    start_date_time: t.startDateTime || null,
    duration_hours: t.durationHours,
    weekly_hours_expected: t.weeklyHoursExpected,
    during_school_period_allowed: t.duringSchoolPeriodAllowed,
    during_vacation_allowed: t.duringVacationAllowed,
    requires_medical_exam: t.requiresMedicalExam,
    physical_load_level: t.physicalLoadLevel,
    is_outdoor: t.isOutdoor,
    minor_compliance_status: t.minorComplianceStatus,
    minor_compliance_reasons: t.minorComplianceReasons,
    deadline: t.deadline ?? null,
  };
}

export interface ApplicationRow {
  id: string;
  task_id: string;
  teen_id: string;
  status: string;
  message: string | null;
  created_at: string;
  paid_at: string | null;
}

export function rowToApplication(r: ApplicationRow): Application {
  return {
    id: r.id,
    taskId: r.task_id,
    teenId: r.teen_id,
    status: r.status as ApplicationStatus,
    message: r.message ?? undefined,
    createdAt: r.created_at,
    paidAt: r.paid_at ?? undefined,
  };
}
