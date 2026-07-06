"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

type HistoryBackButtonProps = {
  className?: string;
  fallbackHref: string;
};

export function HistoryBackButton({
  className = "",
  fallbackHref,
}: HistoryBackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      aria-label="뒤로 가기"
      className={className}
      onClick={goBack}
      type="button"
    >
      <BackIcon className="h-5 w-5" />
    </button>
  );
}
