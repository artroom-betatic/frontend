"use client";

import { useSyncExternalStore } from "react";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import { ProfileAvatar } from "./profile-avatar";

type FeedLikedByLineProps = {
  artistUsername: string;
  className?: string;
  likedBy: string;
};

export function FeedLikedByLine({
  artistUsername,
  className = "",
  likedBy,
}: FeedLikedByLineProps) {
  const settings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );

  if (
    artistUsername === MY_PROFILE_USERNAME &&
    settings.engagementCountDisplay === "hide"
  ) {
    return null;
  }

  return (
    <p className={`flex items-center text-2xs leading-3 text-black ${className}`}>
      <span className="relative mr-2 flex w-7 shrink-0">
        <ProfileAvatar className="border border-white" size={22} />
        <ProfileAvatar className="-ml-4 border border-white" size={22} />
      </span>
      <span>{likedBy}</span>
    </p>
  );
}
