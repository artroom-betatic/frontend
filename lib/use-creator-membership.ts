"use client";

import { useSyncExternalStore } from "react";
import {
  type CreatorMembershipStatus,
  readCreatorMembershipStatus,
  subscribeCreatorMembershipChange,
} from "./creator-membership";

export function useCreatorMembershipStatus(): CreatorMembershipStatus {
  return useSyncExternalStore(
    subscribeCreatorMembershipChange,
    readCreatorMembershipStatus,
    () => "not-started" as const,
  );
}
