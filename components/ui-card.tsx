import type { ReactNode } from "react";

type UiCardProps = {
  children: ReactNode;
  className?: string;
};

export function UiCard({ children, className = "" }: UiCardProps) {
  return (
    <section
      className={`rounded-md bg-white p-3 text-foreground transition-colors hover:bg-panel ${className}`}
    >
      {children}
    </section>
  );
}
