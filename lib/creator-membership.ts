export type CreatorMembershipStatus = "not-started" | "active";

export const CREATOR_MEMBERSHIP_STORAGE_KEY =
  "artroom:creator-membership-status";
export const CREATOR_MEMBERSHIP_UPDATED_EVENT =
  "artroom:creator-membership-updated";

export function readCreatorMembershipStatus(): CreatorMembershipStatus {
  if (typeof window === "undefined") {
    return "not-started";
  }

  return window.localStorage.getItem(CREATOR_MEMBERSHIP_STORAGE_KEY) === "active"
    ? "active"
    : "not-started";
}

export function activateCreatorMembership() {
  window.localStorage.setItem(CREATOR_MEMBERSHIP_STORAGE_KEY, "active");
  window.dispatchEvent(
    new CustomEvent(CREATOR_MEMBERSHIP_UPDATED_EVENT, { detail: "active" }),
  );
}

export function subscribeCreatorMembershipChange(
  callback: (status: CreatorMembershipStatus) => void,
) {
  const handleCreatorMembershipUpdated = (event: Event) => {
    callback(
      event instanceof CustomEvent
        ? event.detail === "active"
          ? "active"
          : "not-started"
        : readCreatorMembershipStatus(),
    );
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CREATOR_MEMBERSHIP_STORAGE_KEY) {
      callback(event.newValue === "active" ? "active" : "not-started");
    }
  };

  window.addEventListener(
    CREATOR_MEMBERSHIP_UPDATED_EVENT,
    handleCreatorMembershipUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      CREATOR_MEMBERSHIP_UPDATED_EVENT,
      handleCreatorMembershipUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function getCreatorMembershipMenuItem(
  status: CreatorMembershipStatus,
) {
  if (status === "active") {
    return {
      description: "등급, 혜택, 전용 콘텐츠를 관리합니다.",
      href: "/creator/membership",
      icon: "membership" as const,
      title: "구독 멤버십 관리",
    };
  }

  return {
    description: "후원 등급과 전용 콘텐츠 구성을 준비합니다.",
    href: "/creator/membership",
    icon: "membership" as const,
    title: "구독 멤버십 만들기",
  };
}
