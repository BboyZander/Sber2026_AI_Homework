import type { ApplicationStatus } from "@/lib/constants";

export interface Application {
  id: string;
  taskId: string;
  teenId: string;
  status: ApplicationStatus;
  message?: string;
  createdAt: string;
}
