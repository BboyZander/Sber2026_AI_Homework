import { redirect } from "next/navigation";

export default async function EmployerTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/employer/tasks?selected=${encodeURIComponent(id)}`);
}
