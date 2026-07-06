import type { ReactNode } from "react";

type ScreenSectionProps = {
  title?: string;
  label?: string;
  children: ReactNode;
};

export function ScreenSection({ title, label, children }: ScreenSectionProps) {
  return (
    <section className="mt-4">
      {label ? (
        <p className="mb-[15px] text-xs font-normal leading-none text-[#1f2937]">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2 className="mb-4 text-base font-semibold leading-none text-[#1f2937]">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
