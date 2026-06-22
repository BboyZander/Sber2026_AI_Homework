import type { ApplicationStatus } from "@/lib/constants";

export interface Application {
  id: string;
  taskId: string;
  teenId: string;
  status: ApplicationStatus;
  message?: string;
  createdAt: string;
  /** F16.0: дата подтверждения оплаты (из `applications.paid_at`). */
  paidAt?: string;
}
