import type { ReactNode } from "react";

type UiCardProps = {
  children: ReactNode;
  className?: string;
};

export function UiCard({ children, className = "" }: UiCardProps) {
  return (
    <section
      className={`rounded-[6px] border border-line bg-panel p-[13px] text-foreground ${className}`}
    >
      {children}
    </section>
  );
}
