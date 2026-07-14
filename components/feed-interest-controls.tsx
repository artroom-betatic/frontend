"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  defaultUserActionSnapshot,
  getFeedPostInterest,
  readUserActionSnapshot,
  setFeedPostInterest,
  subscribeUserActionsChange,
} from "@/lib/user-actions";
import type { FeedPostInterest } from "@/lib/user-actions";

type FeedInterestControlsProps = {
  className?: string;
  postId: string;
};

const interestOptions = [
  { label: "관심 있음", value: "interested" },
  { label: "관심 없음", value: "notInterested" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: FeedPostInterest;
}>;

function getInterestButtonClassName(active: boolean) {
  return `min-h-8 flex-1 rounded-md border px-3 py-2 text-xs font-semibold leading-none ${
    active
      ? "border-primary bg-primary/10 text-primary"
      : "border-line bg-panel text-foreground"
  }`;
}

export function FeedInterestControls({
  className = "",
  postId,
}: FeedInterestControlsProps) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const selectedInterest = getFeedPostInterest(actionSnapshot, postId);

  return (
    <div aria-label="피드 관심도" className={`flex gap-2 ${className}`} role="group">
      {interestOptions.map((option) => {
        const active = selectedInterest === option.value;

        return (
          <button
            aria-pressed={active}
            className={getInterestButtonClassName(active)}
            key={option.value}
            onClick={() =>
              setFeedPostInterest(postId, active ? null : option.value)
            }
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type FeedInterestMenuProps = {
  className?: string;
  postId: string;
};

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

export function FeedInterestMenu({
  className = "",
  postId,
}: FeedInterestMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const selectedInterest = getFeedPostInterest(actionSnapshot, postId);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeMenu);

    return () => window.removeEventListener("pointerdown", closeMenu);
  }, [open]);

  const selectInterest = (interest: FeedPostInterest) => {
    setFeedPostInterest(
      postId,
      selectedInterest === interest ? null : interest,
    );
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="피드 옵션"
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          selectedInterest ? "text-primary" : "text-black"
        }`}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        type="button"
      >
        <MoreIcon />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-md border border-line bg-white shadow-lg"
          role="menu"
        >
          {interestOptions.map((option) => {
            const active = selectedInterest === option.value;

            return (
              <button
                aria-checked={active}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold ${
                  active ? "text-primary" : "text-foreground"
                }`}
                key={option.value}
                onClick={() => selectInterest(option.value)}
                role="menuitemcheckbox"
                type="button"
              >
                <span>{option.label}</span>
                {active ? <span aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
