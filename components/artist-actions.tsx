"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "./action-button";

type ArtistActionsProps = {
  artistUsername: string;
  initialFollowing: boolean;
  membershipLabel: string;
};

export function ArtistActions({
  artistUsername,
  initialFollowing,
  membershipLabel,
}: ArtistActionsProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [statusMessage, setStatusMessage] = useState("");

  const toggleFollow = () => {
    setIsFollowing((current) => {
      const next = !current;
      setStatusMessage(next ? "팔로우했습니다." : "팔로우를 취소했습니다.");
      return next;
    });
  };

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ActionButton
          aria-pressed={isFollowing}
          onClick={toggleFollow}
          variant={isFollowing ? "following" : "follow"}
        >
          {isFollowing ? "팔로잉" : "팔로우"}
        </ActionButton>
        <ActionButton
          onClick={() =>
            router.push(`/membership?artist=${encodeURIComponent(artistUsername)}`)
          }
        >
          {membershipLabel}
        </ActionButton>
      </div>
      {statusMessage ? (
        <p className="mt-3 text-xs font-medium text-[#307cff]">{statusMessage}</p>
      ) : null}
    </>
  );
}
