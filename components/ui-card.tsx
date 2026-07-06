import type { ReactNode } from "react";

type UiCardProps = {
  children: ReactNode;
  className?: string;
};

export function UiCard({ children, className = "" }: UiCardProps) {
  return (
    <section
      className={`rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] p-[13px] text-[#1f2937] ${className}`}
    >
      {children}
    </section>
  );
}
