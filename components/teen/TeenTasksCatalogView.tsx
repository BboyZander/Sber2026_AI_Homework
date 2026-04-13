"use client";

import { useCallback, useEffect, useState } from "react";
import { TeenTasksCatalog } from "@/components/teen/TeenTasksCatalog";
import { EMPLOYER_TASKS_EVENT, EMPLOYER_TASKS_EXTRA_KEY, getPublishedTasksForTeen } from "@/lib/employer-flow";
import type { Task } from "@/types/task";

export function TeenTasksCatalogView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setTasks(getPublishedTasksForTeen());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
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

  return <TeenTasksCatalog tasks={tasks} loading={!ready} />;
}
