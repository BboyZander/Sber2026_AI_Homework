import { AppShell } from "@/components/shared/AppShell";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { TaskForm } from "@/components/employer/TaskForm";

export default function EmployerNewTaskPage() {
  return (
    <AppShell variant="employer" title="Новая задача">
      <SectionTitle title="Новая задача" />
      <p className="-mt-1 mb-5 max-w-3xl text-sm leading-relaxed text-sub">
        Ключевые поля и публикация — пара минут. Данные сохраняются локально в браузере (демо).
      </p>
      <TaskForm />
    </AppShell>
  );
}
