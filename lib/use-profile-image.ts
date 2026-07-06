"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_MY_PROFILE_IMAGE_SRC,
  readStoredProfileImage,
  subscribeProfileImageChange,
} from "./my-profile";

export function useProfileImage() {
  return useSyncExternalStore(
    subscribeProfileImageChange,
    readStoredProfileImage,
    () => DEFAULT_MY_PROFILE_IMAGE_SRC,
  );
}
