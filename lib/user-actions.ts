export type StoredFeedComment = {
  author: string;
  body: string;
  id: string;
  time: string;
};

export type FeedPostInterest = "interested" | "notInterested";

export type UserActionSnapshot = {
  bookmarkedPostIds: string[];
  commentsByPostId: Record<string, StoredFeedComment[]>;
  feedInterestByPostId: Record<string, FeedPostInterest>;
  followingByUsername: Record<string, boolean>;
  likedPostIds: string[];
};

export const USER_ACTIONS_STORAGE_KEY = "artroom:user-actions";
export const USER_ACTIONS_UPDATED_EVENT = "artroom:user-actions-updated";

export const defaultUserActionSnapshot: UserActionSnapshot = {
  bookmarkedPostIds: [],
  commentsByPostId: {},
  feedInterestByPostId: {},
  followingByUsername: {},
  likedPostIds: [],
};

let cachedUserActionsString: string | null = null;
let cachedUserActionsSnapshot: UserActionSnapshot = defaultUserActionSnapshot;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function normalizeCommentsByPostId(
  value: unknown,
): Record<string, StoredFeedComment[]> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([postId, comments]) => [
      postId,
      Array.isArray(comments)
        ? comments
            .map((comment): StoredFeedComment | null => {
              if (!isRecord(comment) || typeof comment.body !== "string") {
                return null;
              }

              return {
                author:
                  typeof comment.author === "string"
                    ? comment.author
                    : "user_123",
                body: comment.body,
                id:
                  typeof comment.id === "string"
                    ? comment.id
                    : `comment-${Date.now()}`,
                time: typeof comment.time === "string" ? comment.time : "방금",
              };
            })
            .filter(
              (comment): comment is StoredFeedComment => comment !== null,
            )
        : [],
    ]),
  );
}

function normalizeFollowingByUsername(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
    ),
  );
}

function normalizeFeedInterestByPostId(
  value: unknown,
): Record<string, FeedPostInterest> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, FeedPostInterest] =>
        entry[1] === "interested" || entry[1] === "notInterested",
    ),
  );
}

function normalizeUserActions(value: unknown): UserActionSnapshot {
  if (!isRecord(value)) {
    return defaultUserActionSnapshot;
  }

  return {
    bookmarkedPostIds: normalizeStringList(value.bookmarkedPostIds),
    commentsByPostId: normalizeCommentsByPostId(value.commentsByPostId),
    feedInterestByPostId: normalizeFeedInterestByPostId(
      value.feedInterestByPostId,
    ),
    followingByUsername: normalizeFollowingByUsername(value.followingByUsername),
    likedPostIds: normalizeStringList(value.likedPostIds),
  };
}

export function readUserActionSnapshot(): UserActionSnapshot {
  if (typeof window === "undefined") {
    return defaultUserActionSnapshot;
  }

  const storedActions = window.localStorage.getItem(USER_ACTIONS_STORAGE_KEY);

  if (!storedActions) {
    cachedUserActionsString = null;
    cachedUserActionsSnapshot = defaultUserActionSnapshot;
    return defaultUserActionSnapshot;
  }

  if (storedActions === cachedUserActionsString) {
    return cachedUserActionsSnapshot;
  }

  try {
    const nextSnapshot = normalizeUserActions(JSON.parse(storedActions));

    cachedUserActionsString = storedActions;
    cachedUserActionsSnapshot = nextSnapshot;

    return nextSnapshot;
  } catch {
    cachedUserActionsString = storedActions;
    cachedUserActionsSnapshot = defaultUserActionSnapshot;

    return defaultUserActionSnapshot;
  }
}

function saveUserActionSnapshot(snapshot: UserActionSnapshot) {
  const nextActionsString = JSON.stringify(snapshot);

  window.localStorage.setItem(USER_ACTIONS_STORAGE_KEY, nextActionsString);
  cachedUserActionsString = nextActionsString;
  cachedUserActionsSnapshot = snapshot;
  window.dispatchEvent(new CustomEvent(USER_ACTIONS_UPDATED_EVENT));
}

function updateUserActionSnapshot(
  updater: (snapshot: UserActionSnapshot) => UserActionSnapshot,
) {
  saveUserActionSnapshot(updater(readUserActionSnapshot()));
}

function toggleId(ids: string[], id: string) {
  return ids.includes(id)
    ? ids.filter((currentId) => currentId !== id)
    : [...ids, id];
}

export function subscribeUserActionsChange(callback: () => void) {
  const handleUserActionsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === USER_ACTIONS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(USER_ACTIONS_UPDATED_EVENT, handleUserActionsUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      USER_ACTIONS_UPDATED_EVENT,
      handleUserActionsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function isFeedPostLiked(snapshot: UserActionSnapshot, postId: string) {
  return snapshot.likedPostIds.includes(postId);
}

export function isFeedPostBookmarked(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return snapshot.bookmarkedPostIds.includes(postId);
}

export function getFeedPostInterest(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return snapshot.feedInterestByPostId[postId] ?? null;
}

export function getArtistFollowing(
  snapshot: UserActionSnapshot,
  username: string,
  fallbackFollowing: boolean,
) {
  return snapshot.followingByUsername[username] ?? fallbackFollowing;
}

export function getStoredFeedComments(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return snapshot.commentsByPostId[postId] ?? [];
}

export function getFeedPostLikeCount(
  snapshot: UserActionSnapshot,
  postId: string,
  initialLikes: number,
) {
  return initialLikes + (isFeedPostLiked(snapshot, postId) ? 1 : 0);
}

export function getFeedPostCommentCount(
  snapshot: UserActionSnapshot,
  postId: string,
  initialComments: number,
) {
  return initialComments + getStoredFeedComments(snapshot, postId).length;
}

export function toggleFeedPostLike(postId: string) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    likedPostIds: toggleId(snapshot.likedPostIds, postId),
  }));
}

export function toggleFeedPostBookmark(postId: string) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    bookmarkedPostIds: toggleId(snapshot.bookmarkedPostIds, postId),
  }));
}

export function setFeedPostInterest(
  postId: string,
  interest: FeedPostInterest | null,
) {
  updateUserActionSnapshot((snapshot) => {
    const feedInterestByPostId = { ...snapshot.feedInterestByPostId };

    if (interest) {
      feedInterestByPostId[postId] = interest;
    } else {
      delete feedInterestByPostId[postId];
    }

    return {
      ...snapshot,
      feedInterestByPostId,
    };
  });
}

export function setArtistFollowing(username: string, following: boolean) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    followingByUsername: {
      ...snapshot.followingByUsername,
      [username]: following,
    },
  }));
}

export function addFeedComment(postId: string, body: string) {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return;
  }

  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    commentsByPostId: {
      ...snapshot.commentsByPostId,
      [postId]: [
        {
          author: "user_123",
          body: trimmedBody,
          id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          time: "방금",
        },
        ...(snapshot.commentsByPostId[postId] ?? []),
      ],
    },
  }));
}
