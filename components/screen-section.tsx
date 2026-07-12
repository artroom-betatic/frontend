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
        <p className="mb-[15px] text-xs font-normal leading-none text-foreground">
          {label}
        </p>
      ) : null}
      {title ? (
        <h2 className="mb-4 text-base font-semibold leading-none text-foreground">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
