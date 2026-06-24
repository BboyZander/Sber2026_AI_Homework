"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import { Sidebar } from "./Sidebar";
import { EmployerFlowToastHost } from "./EmployerFlowToastHost";
import { TeenFlowToastHost } from "./TeenFlowToastHost";
import { AssistantRoot } from "@/components/teen/assistant/AssistantRoot";

export function AppShell({
  variant,
  title,
  children,
  fullWidth = false,
}: {
  variant: "teen" | "employer";
  title?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header title={title} />
      <Sidebar variant={variant} pathname={pathname} />
      <main className={fullWidth ? "page-shell-kanban" : "page-shell"}>
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
      {variant === "teen" ? <TeenFlowToastHost /> : null}
      {variant === "teen" ? <AssistantRoot /> : null}
      {variant === "employer" ? <EmployerFlowToastHost /> : null}
    </>
  );
}
