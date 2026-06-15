"use client";

import { useEffect, useState } from "react";
import { CTAButton } from "@/components/shared/CTAButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TeenTaskDetailView } from "@/components/teen/TeenTaskDetailView";
import { createClient } from "@/lib/supabase/client";
import { rowToTask, type TaskRow } from "@/lib/supabase/mappers";
import {
  TEEN_APPLICATIONS_EVENT,
  getApplicationForTaskCached,
  loadApplications,
} from "@/lib/teen-applications-client";
import type { Task } from "@/types/task";

export function TeenTaskDetailPageView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<Task | null>(null);
  const [tagline, setTagline] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      await loadApplications();
      const { data } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
      if (!active) return;

      if (!data) {
        setTask(null);
        setReady(true);
        return;
      }
      const t = rowToTask(data as TaskRow);
      // Показываем открытую задачу либо ту, на которую подросток откликнулся.
      const hasOwnApplication = Boolean(getApplicationForTaskCached(taskId));
      setTask(t.status === "open" || hasOwnApplication ? t : null);

      const { data: emp } = await supabase
        .from("employer_profiles")
        .select("cabinet_description")
        .eq("id", t.employerId)
        .maybeSingle();
      if (!active) return;
      setTagline((emp as { cabinet_description: string | null } | null)?.cabinet_description ?? "");
      setReady(true);
    }

    void load();
    // Пересобрать при изменении откликов (отклик/отзыв меняют видимость и CTA).
    window.addEventListener(TEEN_APPLICATIONS_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(TEEN_APPLICATIONS_EVENT, load);
    };
  }, [taskId]);

  if (!ready) return null;

  if (!task) {
    return (
      <EmptyState
        emoji="🚧"
        title="Задача недоступна"
        description="Работодатель мог закрыть или удалить её — попробуй другую из каталога."
        action={<CTAButton href="/teen/dashboard">В каталог</CTAButton>}
      />
    );
  }

  return <TeenTaskDetailView task={task} employerTagline={tagline} />;
}
