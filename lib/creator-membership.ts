export type CreatorMembershipStatus = "not-started" | "active";
export type CreatorMembershipVisibility = "private" | "public";

export type CreatorMembershipTier = {
  benefit: string;
  id: string;
  name: string;
  price: string;
};

export type CreatorMembershipContent = {
  id: string;
  status: "scheduled" | "published";
  title: string;
  type: "feed" | "process" | "file";
};

export type CreatorMembershipDraft = {
  contents: CreatorMembershipContent[];
  payoutConfirmed: boolean;
  tiers: CreatorMembershipTier[];
  visibility: CreatorMembershipVisibility;
};

export const CREATOR_MEMBERSHIP_STORAGE_KEY =
  "artroom:creator-membership-status";
export const CREATOR_MEMBERSHIP_DRAFT_STORAGE_KEY =
  "artroom:creator-membership-draft";
export const CREATOR_MEMBERSHIP_UPDATED_EVENT =
  "artroom:creator-membership-updated";
export const CREATOR_MEMBERSHIP_DRAFT_UPDATED_EVENT =
  "artroom:creator-membership-draft-updated";

export const defaultCreatorMembershipDraft: CreatorMembershipDraft = {
  contents: [
    {
      id: "content-first-feed",
      status: "scheduled",
      title: "첫 멤버십 전용 피드",
      type: "feed",
    },
  ],
  payoutConfirmed: false,
  tiers: [
    {
      benefit: "작업 과정 피드, 고화질 이미지, 월간 공지",
      id: "tier-supporter",
      name: "월간 후원",
      price: "4900",
    },
  ],
  visibility: "private",
};

let cachedCreatorMembershipDraftString: string | null = null;
let cachedCreatorMembershipDraft: CreatorMembershipDraft =
  defaultCreatorMembershipDraft;

function normalizeCreatorMembershipContent(
  content: CreatorMembershipContent,
): CreatorMembershipContent {
  return {
    ...content,
    status: content.status === "published" ? "published" : "scheduled",
  };
}

export function readCreatorMembershipStatus(): CreatorMembershipStatus {
  if (typeof window === "undefined") {
    return "not-started";
  }

  return window.localStorage.getItem(CREATOR_MEMBERSHIP_STORAGE_KEY) === "active"
    ? "active"
    : "not-started";
}

export function readCreatorMembershipDraft(): CreatorMembershipDraft {
  if (typeof window === "undefined") {
    return defaultCreatorMembershipDraft;
  }

  const storedDraft = window.localStorage.getItem(
    CREATOR_MEMBERSHIP_DRAFT_STORAGE_KEY,
  );

  if (!storedDraft) {
    return defaultCreatorMembershipDraft;
  }

  if (storedDraft === cachedCreatorMembershipDraftString) {
    return cachedCreatorMembershipDraft;
  }

  try {
    const parsedDraft = JSON.parse(
      storedDraft,
    ) as Partial<CreatorMembershipDraft>;
    const nextDraft: CreatorMembershipDraft = {
      contents: Array.isArray(parsedDraft.contents)
        ? parsedDraft.contents.map((content) =>
            normalizeCreatorMembershipContent(
              content as CreatorMembershipContent,
            ),
          )
        : defaultCreatorMembershipDraft.contents,
      payoutConfirmed:
        typeof parsedDraft.payoutConfirmed === "boolean"
          ? parsedDraft.payoutConfirmed
          : defaultCreatorMembershipDraft.payoutConfirmed,
      tiers: Array.isArray(parsedDraft.tiers)
        ? parsedDraft.tiers
        : defaultCreatorMembershipDraft.tiers,
      visibility:
        parsedDraft.visibility === "public"
          ? "public"
          : defaultCreatorMembershipDraft.visibility,
    };

    cachedCreatorMembershipDraftString = storedDraft;
    cachedCreatorMembershipDraft = nextDraft;

    return nextDraft;
  } catch {
    return defaultCreatorMembershipDraft;
  }
}

export function saveCreatorMembershipDraft(draft: CreatorMembershipDraft) {
  const nextDraftString = JSON.stringify(draft);

  window.localStorage.setItem(
    CREATOR_MEMBERSHIP_DRAFT_STORAGE_KEY,
    nextDraftString,
  );
  cachedCreatorMembershipDraftString = nextDraftString;
  cachedCreatorMembershipDraft = draft;
  window.dispatchEvent(
    new CustomEvent(CREATOR_MEMBERSHIP_DRAFT_UPDATED_EVENT, { detail: draft }),
  );
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

export function subscribeCreatorMembershipDraftChange(
  callback: () => void,
) {
  const handleCreatorMembershipDraftUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CREATOR_MEMBERSHIP_DRAFT_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(
    CREATOR_MEMBERSHIP_DRAFT_UPDATED_EVENT,
    handleCreatorMembershipDraftUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      CREATOR_MEMBERSHIP_DRAFT_UPDATED_EVENT,
      handleCreatorMembershipDraftUpdated,
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
