export type StoredFeedComment = {
  author: string;
  body: string;
  id: string;
  time: string;
};

export type FeedPostInterest = "interested" | "notInterested";

export type FeedCommentSettings = {
  commentsClosed: boolean;
  pinnedCommentKeys: string[];
};

export type UserReport = {
  createdAt: string;
  reason: string;
};

export type UserActionSnapshot = {
  blockedUsernames: string[];
  bookmarkedPostIds: string[];
  deletedArtworkSlugs: string[];
  deletedFeedPostIds: string[];
  deletedSeriesSlugs: string[];
  feedCommentSettingsByPostId: Record<string, FeedCommentSettings>;
  commentsByPostId: Record<string, StoredFeedComment[]>;
  feedInterestByPostId: Record<string, FeedPostInterest>;
  feedReportsByPostId: Record<string, UserReport>;
  followingByUsername: Record<string, boolean>;
  likedPostIds: string[];
  privateFeedPostIds: string[];
  removedFollowerUsernames: string[];
  userReportsByUsername: Record<string, UserReport>;
};

export const USER_ACTIONS_STORAGE_KEY = "artroom:user-actions";
export const USER_ACTIONS_UPDATED_EVENT = "artroom:user-actions-updated";

export const defaultUserActionSnapshot: UserActionSnapshot = {
  blockedUsernames: [],
  bookmarkedPostIds: [],
  deletedArtworkSlugs: [],
  deletedFeedPostIds: [],
  deletedSeriesSlugs: [],
  feedCommentSettingsByPostId: {},
  commentsByPostId: {},
  feedInterestByPostId: {},
  feedReportsByPostId: {},
  followingByUsername: {},
  likedPostIds: [],
  privateFeedPostIds: [],
  removedFollowerUsernames: [],
  userReportsByUsername: {},
};

const defaultFeedCommentSettings: FeedCommentSettings = {
  commentsClosed: false,
  pinnedCommentKeys: [],
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

function normalizeReportMap(value: unknown): Record<string, UserReport> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, report]): [string, UserReport] | null => {
        if (!isRecord(report)) {
          return null;
        }

        return [
          key,
          {
            createdAt:
              typeof report.createdAt === "string"
                ? report.createdAt
                : new Date().toISOString(),
            reason: typeof report.reason === "string" ? report.reason : "신고",
          },
        ];
      })
      .filter((entry): entry is [string, UserReport] => entry !== null),
  );
}

function normalizeFeedCommentSettingsByPostId(
  value: unknown,
): Record<string, FeedCommentSettings> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([postId, settings]) => {
      if (!isRecord(settings)) {
        return [postId, defaultFeedCommentSettings];
      }

      return [
        postId,
        {
          commentsClosed: settings.commentsClosed === true,
          pinnedCommentKeys: Array.from(
            new Set([
              ...(typeof settings.pinnedCommentKey === "string"
                ? [settings.pinnedCommentKey]
                : []),
              ...normalizeStringList(settings.pinnedCommentKeys),
            ]),
          ),
        },
      ];
    }),
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
    blockedUsernames: normalizeStringList(value.blockedUsernames),
    bookmarkedPostIds: normalizeStringList(value.bookmarkedPostIds),
    deletedArtworkSlugs: normalizeStringList(value.deletedArtworkSlugs),
    deletedFeedPostIds: normalizeStringList(value.deletedFeedPostIds),
    deletedSeriesSlugs: normalizeStringList(value.deletedSeriesSlugs),
    commentsByPostId: normalizeCommentsByPostId(value.commentsByPostId),
    feedCommentSettingsByPostId: normalizeFeedCommentSettingsByPostId(
      value.feedCommentSettingsByPostId,
    ),
    feedInterestByPostId: normalizeFeedInterestByPostId(
      value.feedInterestByPostId,
    ),
    feedReportsByPostId: normalizeReportMap(value.feedReportsByPostId),
    followingByUsername: normalizeFollowingByUsername(value.followingByUsername),
    likedPostIds: normalizeStringList(value.likedPostIds),
    privateFeedPostIds: normalizeStringList(value.privateFeedPostIds),
    removedFollowerUsernames: normalizeStringList(
      value.removedFollowerUsernames,
    ),
    userReportsByUsername: normalizeReportMap(value.userReportsByUsername),
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

export function getFeedCommentSettings(
  snapshot: UserActionSnapshot,
  postId: string,
  fallbackCommentsClosed = false,
) {
  return (
    snapshot.feedCommentSettingsByPostId[postId] ?? {
      ...defaultFeedCommentSettings,
      commentsClosed: fallbackCommentsClosed,
    }
  );
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

export function getFeedCommentKey(comment: {
  author: string;
  body: string;
  id?: string;
  time: string;
}) {
  return comment.id
    ? `stored:${comment.id}`
    : `base:${comment.author}:${comment.time}:${comment.body}`;
}

export function isFeedCommentPinned(
  settings: FeedCommentSettings,
  commentKey: string,
) {
  return settings.pinnedCommentKeys.includes(commentKey);
}

export function getFeedCommentPinnedIndex(
  settings: FeedCommentSettings,
  commentKey: string,
) {
  return settings.pinnedCommentKeys.indexOf(commentKey);
}

export function isUsernameBlocked(
  snapshot: UserActionSnapshot,
  username: string,
) {
  return snapshot.blockedUsernames.includes(username);
}

export function isFeedPostReported(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return Boolean(snapshot.feedReportsByPostId[postId]);
}

export function isUsernameReported(
  snapshot: UserActionSnapshot,
  username: string,
) {
  return Boolean(snapshot.userReportsByUsername[username]);
}

export function isFeedPostDeleted(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return snapshot.deletedFeedPostIds.includes(postId);
}

export function isArtworkDeleted(
  snapshot: UserActionSnapshot,
  artworkSlug: string,
) {
  return snapshot.deletedArtworkSlugs.includes(artworkSlug);
}

export function isSeriesDeleted(
  snapshot: UserActionSnapshot,
  seriesSlug: string,
) {
  return snapshot.deletedSeriesSlugs.includes(seriesSlug);
}

export function isFeedPostPrivate(
  snapshot: UserActionSnapshot,
  postId: string,
) {
  return snapshot.privateFeedPostIds.includes(postId);
}

export function isFollowerRemoved(
  snapshot: UserActionSnapshot,
  username: string,
) {
  return snapshot.removedFollowerUsernames.includes(username);
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

export function deleteFeedPost(postId: string) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    bookmarkedPostIds: snapshot.bookmarkedPostIds.filter(
      (currentPostId) => currentPostId !== postId,
    ),
    deletedFeedPostIds: Array.from(
      new Set([...snapshot.deletedFeedPostIds, postId]),
    ),
    likedPostIds: snapshot.likedPostIds.filter(
      (currentPostId) => currentPostId !== postId,
    ),
    privateFeedPostIds: snapshot.privateFeedPostIds.filter(
      (currentPostId) => currentPostId !== postId,
    ),
  }));
}

export function deleteArtwork(artworkSlug: string) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    deletedArtworkSlugs: Array.from(
      new Set([...snapshot.deletedArtworkSlugs, artworkSlug]),
    ),
  }));
}

export function deleteSeries(seriesSlug: string) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    deletedSeriesSlugs: Array.from(
      new Set([...snapshot.deletedSeriesSlugs, seriesSlug]),
    ),
  }));
}

export function setFeedPostPrivate(postId: string, privatePost: boolean) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    privateFeedPostIds: privatePost
      ? Array.from(new Set([...snapshot.privateFeedPostIds, postId]))
      : snapshot.privateFeedPostIds.filter(
          (currentPostId) => currentPostId !== postId,
        ),
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

export function setFeedCommentsClosed(postId: string, commentsClosed: boolean) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    feedCommentSettingsByPostId: {
      ...snapshot.feedCommentSettingsByPostId,
      [postId]: {
        ...getFeedCommentSettings(snapshot, postId),
        commentsClosed,
      },
    },
  }));
}

export function setPinnedFeedComment(
  postId: string,
  pinnedCommentKey: string | null,
) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    feedCommentSettingsByPostId: {
      ...snapshot.feedCommentSettingsByPostId,
      [postId]: {
        ...getFeedCommentSettings(snapshot, postId),
        pinnedCommentKeys: pinnedCommentKey ? [pinnedCommentKey] : [],
      },
    },
  }));
}

export function togglePinnedFeedComment(
  postId: string,
  commentKey: string,
  fallbackCommentsClosed = false,
) {
  updateUserActionSnapshot((snapshot) => {
    const currentSettings = getFeedCommentSettings(
      snapshot,
      postId,
      fallbackCommentsClosed,
    );
    const pinnedCommentKeys = currentSettings.pinnedCommentKeys.includes(
      commentKey,
    )
      ? currentSettings.pinnedCommentKeys.filter(
          (currentCommentKey) => currentCommentKey !== commentKey,
        )
      : [
          commentKey,
          ...currentSettings.pinnedCommentKeys.filter(
            (currentCommentKey) => currentCommentKey !== commentKey,
          ),
        ];

    return {
      ...snapshot,
      feedCommentSettingsByPostId: {
        ...snapshot.feedCommentSettingsByPostId,
        [postId]: {
          ...currentSettings,
          pinnedCommentKeys,
        },
      },
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

export function removeFollower(username: string, unfollow = false) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    followingByUsername: unfollow
      ? {
          ...snapshot.followingByUsername,
          [username]: false,
        }
      : snapshot.followingByUsername,
    removedFollowerUsernames: Array.from(
      new Set([...snapshot.removedFollowerUsernames, username]),
    ),
  }));
}

export function setUsernameBlocked(username: string, blocked: boolean) {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    blockedUsernames: blocked
      ? Array.from(new Set([...snapshot.blockedUsernames, username]))
      : snapshot.blockedUsernames.filter(
          (currentUsername) => currentUsername !== username,
        ),
    followingByUsername: blocked
      ? {
          ...snapshot.followingByUsername,
          [username]: false,
        }
      : snapshot.followingByUsername,
    removedFollowerUsernames: blocked
      ? Array.from(new Set([...snapshot.removedFollowerUsernames, username]))
      : snapshot.removedFollowerUsernames,
  }));
}

export function reportFeedPost(postId: string, reason = "부적절한 피드") {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    feedReportsByPostId: {
      ...snapshot.feedReportsByPostId,
      [postId]: {
        createdAt: new Date().toISOString(),
        reason,
      },
    },
  }));
}

export function reportUsername(username: string, reason = "부적절한 계정") {
  updateUserActionSnapshot((snapshot) => ({
    ...snapshot,
    userReportsByUsername: {
      ...snapshot.userReportsByUsername,
      [username]: {
        createdAt: new Date().toISOString(),
        reason,
      },
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
