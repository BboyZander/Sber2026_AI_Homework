"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { PageTransition } from "./PageTransition";
import { Sidebar } from "./Sidebar";
import { EmployerFlowToastHost } from "./EmployerFlowToastHost";
import { TeenFlowToastHost } from "./TeenFlowToastHost";

export function AppShell({
  variant,
  title,
  children,
}: {
  variant: "teen" | "employer";
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header title={title} />
      <Sidebar variant={variant} pathname={pathname} />
      <main className="page-shell">
        <PageTransition pathname={pathname}>{children}</PageTransition>
      </main>
      {variant === "teen" ? <TeenFlowToastHost /> : null}
      {variant === "employer" ? <EmployerFlowToastHost /> : null}
    </>
  );
}
