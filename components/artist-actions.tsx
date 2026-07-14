"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  defaultUserActionSnapshot,
  getArtistFollowing,
  isUsernameBlocked,
  isUsernameReported,
  readUserActionSnapshot,
  setArtistFollowing,
  setUsernameBlocked,
  subscribeUserActionsChange,
} from "@/lib/user-actions";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
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
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const isFollowing = getArtistFollowing(
    actionSnapshot,
    artistUsername,
    initialFollowing,
  );
  const accountBlocked = isUsernameBlocked(actionSnapshot, artistUsername);
  const accountReported = isUsernameReported(actionSnapshot, artistUsername);
  const isOwnAccount = artistUsername === MY_PROFILE_USERNAME;

  const toggleFollow = () => {
    if (accountBlocked) {
      setStatusMessage("차단한 계정은 팔로우할 수 없습니다.");
      return;
    }

    const next = !isFollowing;

    setArtistFollowing(artistUsername, next);
    setStatusMessage(next ? "팔로우했습니다." : "팔로우를 취소했습니다.");
  };

  const toggleBlock = () => {
    const nextBlocked = !accountBlocked;

    setUsernameBlocked(artistUsername, nextBlocked);
    setStatusMessage(
      nextBlocked ? "계정을 차단했습니다." : "차단을 해제했습니다.",
    );
  };

  const reportAccount = () => {
    router.push(
      `/report?type=account&username=${encodeURIComponent(artistUsername)}`,
    );
  };

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <ActionButton
          aria-pressed={isFollowing}
          onClick={toggleFollow}
          variant={isFollowing ? "following" : "follow"}
        >
          {accountBlocked ? "차단됨" : isFollowing ? "팔로잉" : "팔로우"}
        </ActionButton>
        <ActionButton
          onClick={() =>
            router.push(`/membership?artist=${encodeURIComponent(artistUsername)}`)
          }
        >
          {membershipLabel}
        </ActionButton>
      </div>
      {!isOwnAccount ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ActionButton
            aria-pressed={accountReported}
            onClick={reportAccount}
            variant="secondary"
          >
            {accountReported ? "신고됨" : "계정 신고"}
          </ActionButton>
          <ActionButton
            aria-pressed={accountBlocked}
            onClick={toggleBlock}
            variant="secondary"
          >
            {accountBlocked ? "차단 해제" : "계정 차단"}
          </ActionButton>
        </div>
      ) : null}
      {statusMessage ? (
        <p className="mt-3 text-xs font-medium text-primary">{statusMessage}</p>
      ) : null}
    </>
  );
}
