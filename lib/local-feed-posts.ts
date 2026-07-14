import type { FeedPost } from "./feed-types";
import { MY_PROFILE_USERNAME } from "./my-profile";

export type StoredLocalFeedPost = {
  body: string;
  commentsClosed: boolean;
  createdAt: string;
  id: string;
  tags: string[];
};

type LocalFeedPostInput = {
  body: string;
  commentsClosed: boolean;
  tags: string[];
};

export const LOCAL_FEED_POSTS_STORAGE_KEY = "artroom:local-feed-posts";
export const LOCAL_FEED_POSTS_UPDATED_EVENT = "artroom:local-feed-posts-updated";

const localFeedImageSrc = "/figma/post-hamster-red.png";
const emptyLocalFeedPosts: StoredLocalFeedPost[] = [];

let cachedLocalFeedPostsString: string | null = null;
let cachedLocalFeedPostsSnapshot: StoredLocalFeedPost[] = emptyLocalFeedPosts;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTag(tag: string) {
  const trimmedTag = tag.trim().replace(/^#+/, "");

  return trimmedTag ? `#${trimmedTag}` : "";
}

export function normalizeLocalFeedTags(tags: string[]) {
  return Array.from(
    new Set(tags.map(normalizeTag).filter((tag) => tag.length > 1)),
  ).slice(0, 6);
}

function normalizeLocalFeedPosts(value: unknown): StoredLocalFeedPost[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((post): StoredLocalFeedPost | null => {
      if (!isRecord(post) || typeof post.body !== "string") {
        return null;
      }

      return {
        body: post.body,
        commentsClosed: post.commentsClosed === true,
        createdAt:
          typeof post.createdAt === "string"
            ? post.createdAt
            : new Date().toISOString(),
        id:
          typeof post.id === "string"
            ? post.id
            : `local-feed-${Date.now()}`,
        tags: normalizeLocalFeedTags(
          Array.isArray(post.tags)
            ? post.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        ),
      };
    })
    .filter((post): post is StoredLocalFeedPost => post !== null);
}

export function readLocalFeedPosts() {
  if (typeof window === "undefined") {
    return emptyLocalFeedPosts;
  }

  const storedPosts = window.localStorage.getItem(LOCAL_FEED_POSTS_STORAGE_KEY);

  if (!storedPosts) {
    cachedLocalFeedPostsString = null;
    cachedLocalFeedPostsSnapshot = emptyLocalFeedPosts;
    return cachedLocalFeedPostsSnapshot;
  }

  if (storedPosts === cachedLocalFeedPostsString) {
    return cachedLocalFeedPostsSnapshot;
  }

  try {
    const nextSnapshot = normalizeLocalFeedPosts(JSON.parse(storedPosts));

    cachedLocalFeedPostsString = storedPosts;
    cachedLocalFeedPostsSnapshot = nextSnapshot;

    return nextSnapshot;
  } catch {
    cachedLocalFeedPostsString = storedPosts;
    cachedLocalFeedPostsSnapshot = emptyLocalFeedPosts;

    return cachedLocalFeedPostsSnapshot;
  }
}

export function getLocalFeedPostsServerSnapshot() {
  return emptyLocalFeedPosts;
}

function saveLocalFeedPosts(posts: StoredLocalFeedPost[]) {
  const nextPostsString = JSON.stringify(posts);

  window.localStorage.setItem(LOCAL_FEED_POSTS_STORAGE_KEY, nextPostsString);
  cachedLocalFeedPostsString = nextPostsString;
  cachedLocalFeedPostsSnapshot = posts;
  window.dispatchEvent(new CustomEvent(LOCAL_FEED_POSTS_UPDATED_EVENT));
}

export function addLocalFeedPost({
  body,
  commentsClosed,
  tags,
}: LocalFeedPostInput) {
  const now = Date.now();
  const post: StoredLocalFeedPost = {
    body: body.trim(),
    commentsClosed,
    createdAt: new Date(now).toISOString(),
    id: `local-feed-${now}-${Math.random().toString(36).slice(2, 8)}`,
    tags: normalizeLocalFeedTags(tags),
  };

  saveLocalFeedPosts([post, ...readLocalFeedPosts()]);

  return post;
}

export function getLocalFeedPost(id: string) {
  return readLocalFeedPosts().find((post) => post.id === id) ?? null;
}

export function subscribeLocalFeedPostsChange(callback: () => void) {
  const handleLocalFeedPostsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_FEED_POSTS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(
    LOCAL_FEED_POSTS_UPDATED_EVENT,
    handleLocalFeedPostsUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      LOCAL_FEED_POSTS_UPDATED_EVENT,
      handleLocalFeedPostsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function toFeedPost(post: StoredLocalFeedPost): FeedPost {
  return {
    artist: {
      avatarSrc: "/figma/profile.png",
      displayName: "작가의 이름",
      href: `/artist/${encodeURIComponent(MY_PROFILE_USERNAME)}`,
      isFollowing: true,
      username: MY_PROFILE_USERNAME,
    },
    body: post.body,
    comments: 0,
    commentsClosed: post.commentsClosed,
    createdAtLabel: "방금",
    href: `/feed/${encodeURIComponent(post.id)}`,
    id: post.id,
    imageAlt: "새로 작성한 피드 이미지",
    imageSlides: [
      {
        imageAlt: "새로 작성한 피드 이미지",
        imageSrc: localFeedImageSrc,
        label: "피드",
      },
    ],
    imageSrc: localFeedImageSrc,
    likedBy: "아직 좋아요가 없습니다",
    likes: 0,
    tags: post.tags,
  };
}
