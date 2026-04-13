import type { DurationBucket, TaskCategory, TaskStatus, WorkFormat } from "@/lib/constants";

export interface Task {
  id: string;
  title: string;
  description: string;
  employerId: string;
  employerName: string;
  category: TaskCategory;
  status: TaskStatus;
  rewardXp: number;
  /** Демо: вознаграждение в рублях для каталога */
  payRub: number;
  workFormat: WorkFormat;
  durationBucket: DurationBucket;
  /** Человекочитаемо: «до 2 ч», «полдня» */
  durationLabel: string;
  location?: string;
  /** Возрастной диапазон для исполнителя (демо). */
  minAge?: number;
  maxAge?: number;
  deadline?: string;
  createdAt: string;
}
