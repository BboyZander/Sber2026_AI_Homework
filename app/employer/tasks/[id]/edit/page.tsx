import { AppShell } from "@/components/shared/AppShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TaskForm } from "@/components/employer/TaskForm";
import { Suspense } from "react";

export default async function EmployerEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell variant="employer" title="Редактирование задачи">
      <SectionTitle title="Редактирование задачи" />
      <p className="-mt-1 mb-5 max-w-3xl text-sm leading-relaxed text-sub">
        Та же форма, что при создании: все поля заполнены текущей задачей. Изменения сохраняются локально в браузере
        (демо).
      </p>
      <Suspense fallback={<div className="ui-card text-sm text-sub">Загружаем форму…</div>}>
        <TaskForm editTaskId={id} />
      </Suspense>
    </AppShell>
  );
}
