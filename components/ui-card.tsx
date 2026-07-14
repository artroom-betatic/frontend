import type { ReactNode } from "react";

type UiCardProps = {
  children: ReactNode;
  className?: string;
};

export function UiCard({ children, className = "" }: UiCardProps) {
  return (
    <section
      className={`rounded-md border border-line bg-panel p-3 text-foreground ${className}`}
    >
      {children}
    </section>
  );
}
