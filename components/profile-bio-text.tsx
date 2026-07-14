"use client";

import { useSyncExternalStore } from "react";
import {
  MY_PROFILE_USERNAME,
  readStoredProfileBio,
  subscribeProfileBioChange,
} from "@/lib/my-profile";

type ProfileBioTextProps = {
  className?: string;
  fallbackBio: string;
  username: string;
};

const subscribeStaticBio = () => () => {};

export function ProfileBioText({
  className = "",
  fallbackBio,
  username,
}: ProfileBioTextProps) {
  const isMyProfile = username === MY_PROFILE_USERNAME;
  const bio = useSyncExternalStore(
    isMyProfile ? subscribeProfileBioChange : subscribeStaticBio,
    () => (isMyProfile ? readStoredProfileBio(fallbackBio) : fallbackBio),
    () => fallbackBio,
  );

  return <p className={className}>{bio}</p>;
}
