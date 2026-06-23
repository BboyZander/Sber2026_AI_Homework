import { redirect } from "next/navigation";

export default async function EmployerEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/employer/tasks?action=edit&id=${encodeURIComponent(id)}`);
}
