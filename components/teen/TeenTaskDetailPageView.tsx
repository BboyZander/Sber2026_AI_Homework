"use client";

import { useCallback, useEffect, useState } from "react";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TeenTaskDetailView } from "@/components/teen/TeenTaskDetailView";
import { employerSnippet } from "@/data/employer-snippets";
import { EMPLOYER_TASKS_EVENT, EMPLOYER_TASKS_EXTRA_KEY, getTaskByIdForFlow } from "@/lib/employer-flow";
import type { Task } from "@/types/task";

export function TeenTaskDetailPageView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<Task | null>(null);

  const refresh = useCallback(() => {
    const t = getTaskByIdForFlow(taskId);
    setTask(t && t.status === "published" ? t : null);
  }, [taskId]);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === EMPLOYER_TASKS_EXTRA_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(EMPLOYER_TASKS_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EMPLOYER_TASKS_EVENT, refresh);
    };
  }, [refresh]);

  if (!task) {
    return (
      <EmptyState
        emoji="🚧"
        title="Задача недоступна"
        description="Работодатель мог закрыть или удалить её — попробуй другую из каталога."
        action={<CTAButton href="/teen/tasks">В каталог</CTAButton>}
      />
    );
  }

  return <TeenTaskDetailView task={task} employerTagline={employerSnippet(task.employerId)} />;
}
