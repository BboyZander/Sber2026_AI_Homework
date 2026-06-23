import { redirect } from "next/navigation";

export default function EmployerNewTaskPage() {
  redirect("/employer/tasks?action=create");
}
