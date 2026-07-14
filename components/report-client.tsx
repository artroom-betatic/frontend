"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { UiCard } from "@/components/ui-card";
import { reportFeedPost, reportUsername } from "@/lib/user-actions";

type ReportType = "account" | "feed";

function normalizeReportType(value: string | null): ReportType | null {
  return value === "account" || value === "feed" ? value : null;
}

export function ReportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportType = normalizeReportType(searchParams.get("type"));
  const postId = searchParams.get("postId") ?? "";
  const username = searchParams.get("username") ?? "";
  const [reason, setReason] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const targetLabel = useMemo(() => {
    if (reportType === "feed") {
      return username ? `@${username}의 피드` : "피드";
    }

    if (reportType === "account") {
      return username ? `@${username}` : "계정";
    }

    return "신고 대상";
  }, [reportType, username]);
  const validTarget =
    reportType === "feed"
      ? Boolean(postId)
      : reportType === "account"
        ? Boolean(username)
        : false;

  const submitReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!reportType || !validTarget) {
      setStatusMessage("신고 대상을 확인할 수 없습니다.");
      return;
    }

    if (!trimmedReason) {
      setStatusMessage("신고 이유를 입력해주세요.");
      return;
    }

    if (reportType === "feed") {
      reportFeedPost(postId, trimmedReason);
    } else {
      reportUsername(username, trimmedReason);
    }

    setSubmitted(true);
    setStatusMessage("신고가 접수되었습니다.");
  };

  return (
    <main className="px-6 pb-24 pt-5">
      <UiCard className="bg-white">
        <p className="text-xs font-medium text-subtle">신고 대상</p>
        <p className="mt-1 text-base font-semibold text-foreground">
          {targetLabel}
        </p>
        <p className="mt-3 text-xs leading-5 text-subtle">
          신고 이유를 작성하면 운영 검토 대상으로 저장됩니다.
        </p>
      </UiCard>

      <form className="mt-4" onSubmit={submitReport}>
        <UiCard className="bg-white">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="report-reason"
          >
            신고 이유
          </label>
          <textarea
            className="mt-3 min-h-32 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-primary"
            disabled={submitted}
            id="report-reason"
            maxLength={300}
            onChange={(event) => setReason(event.currentTarget.value)}
            placeholder="문제가 되는 내용을 구체적으로 작성해주세요."
            value={reason}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-2xs font-medium text-muted">
              {reason.length}/300
            </span>
            <ActionButton disabled={submitted} type="submit">
              신고 제출
            </ActionButton>
          </div>
        </UiCard>
      </form>

      {statusMessage ? (
        <p className="mt-3 text-xs font-medium text-primary" role="status">
          {statusMessage}
        </p>
      ) : null}

      {submitted ? (
        <ActionButton
          className="mt-4 w-full"
          onClick={() => router.back()}
          variant="secondary"
        >
          돌아가기
        </ActionButton>
      ) : null}
    </main>
  );
}
