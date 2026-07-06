"use client";

import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";

type CreatorToolPageAction =
  | {
      href: string;
      label: string;
      onClick?: never;
    }
  | {
      href?: never;
      label: string;
      onClick: () => void;
    };

type CreatorToolPageProps = {
  title: string;
  summary: string;
  fields: {
    label: string;
    value: string;
  }[];
  checklist: string[];
  primaryAction?: CreatorToolPageAction;
};

export function CreatorToolPage({
  checklist,
  fields,
  primaryAction = { href: "/my", label: "마이페이지로 돌아가기" },
  summary,
  title,
}: CreatorToolPageProps) {
  return (
    <AppFrame>
      <MobileHeader title={title} backHref="/my" />
      <main className="px-6 pb-8 pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">{summary}</p>

        <ScreenSection title="기본 설정">
          <div className="grid gap-2">
            {fields.map((field) => (
              <UiCard className="bg-white" key={field.label}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-subtle">
                    {field.label}
                  </p>
                  <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold text-foreground">
                    {field.value}
                  </p>
                </div>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        <ScreenSection title="다음 단계">
          <div className="grid gap-2">
            {checklist.map((item, index) => (
              <UiCard className="bg-white" key={item}>
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="min-w-0 text-sm font-medium leading-5 text-foreground">
                    {item}
                  </p>
                </div>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        {"onClick" in primaryAction ? (
          <button
            className="mt-6 flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
            onClick={primaryAction.onClick}
            type="button"
          >
            {primaryAction.label}
          </button>
        ) : (
          <Link
            className="mt-6 flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
        )}
      </main>
    </AppFrame>
  );
}
