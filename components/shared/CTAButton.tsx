import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const variantClass = variant === "primary" ? "ui-btn-primary" : "ui-btn-ghost";
  return (
    <Link href={href} className={`${variantClass} no-underline hover:no-underline ${className}`} {...rest}>
      {children}
    </Link>
  );
}
