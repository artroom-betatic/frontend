"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";

type ShareButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  shareText?: string;
  shareTitle: string;
  shareUrl: string;
};

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.5 11.5L15.5 7.5M8.5 12.5L15.5 16.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <circle cx="6.5" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="17.5" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function getAbsoluteShareUrl(shareUrl: string) {
  try {
    return new URL(shareUrl, window.location.origin).toString();
  } catch {
    return shareUrl;
  }
}

export function ShareButton({
  children,
  className = "",
  shareText,
  shareTitle,
  shareUrl,
  ...props
}: ShareButtonProps) {
  const [statusLabel, setStatusLabel] = useState("");

  useEffect(() => {
    if (!statusLabel) {
      return;
    }

    const timeoutId = window.setTimeout(() => setStatusLabel(""), 1800);

    return () => window.clearTimeout(timeoutId);
  }, [statusLabel]);

  const sharePost = async () => {
    const url = getAbsoluteShareUrl(shareUrl);

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          text: shareText,
          title: shareTitle,
          url,
        });
        setStatusLabel("공유됨");
        return;
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is not available.");
      }

      await navigator.clipboard.writeText(url);
      setStatusLabel("복사됨");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setStatusLabel("실패");
    }
  };

  return (
    <button
      aria-label={statusLabel || "공유하기"}
      className={`flex h-6 w-6 items-center justify-center text-black ${className}`}
      onClick={sharePost}
      type="button"
      {...props}
    >
      <ShareIcon />
      <span className="sr-only">{statusLabel || children || "공유하기"}</span>
    </button>
  );
}
