import type { FeedImageSlide, FeedPost, FeedVisibility } from "./feed-types";
import { getArtistProfile } from "./feed-data";
import { MY_PROFILE_USERNAME } from "./my-profile";

export type StoredLocalFeedPost = {
  body: string;
  collaboratorUsernames: string[];
  commentsClosed: boolean;
  createdAt: string;
  id: string;
  imageSlides: FeedImageSlide[];
  tags: string[];
  visibility: FeedVisibility;
};

type LocalFeedPostInput = {
  body: string;
  collaboratorUsernames: string[];
  commentsClosed: boolean;
  imageSlides: FeedImageSlide[];
  tags: string[];
  visibility: FeedVisibility;
};

export const LOCAL_FEED_POSTS_STORAGE_KEY = "artroom:local-feed-posts";
export const LOCAL_FEED_POSTS_UPDATED_EVENT = "artroom:local-feed-posts-updated";

const localFeedImageSrc = "/figma/post-hamster-red.png";
const emptyLocalFeedPosts: StoredLocalFeedPost[] = [];

export const localFeedImageOptions = [
  {
    imageAlt: "빨간 캐릭터 피드 이미지",
    imageSrc: "/figma/post-hamster-red.png",
    label: "이미지 A",
  },
  {
    imageAlt: "흑백 캐릭터 피드 이미지",
    imageSrc: "/figma/post-hamster-mono.png",
    label: "이미지 B",
  },
  {
    imageAlt: "대화 장면 피드 이미지",
    imageSrc: "/figma/post-anime-dialogue.png",
    label: "이미지 C",
  },
  {
    imageAlt: "판타지 배경 피드 이미지",
    imageSrc: "/figma/home-post.png",
    label: "이미지 D",
  },
] satisfies FeedImageSlide[];

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

function normalizeCollaboratorUsernames(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (username): username is string =>
          typeof username === "string" && username !== MY_PROFILE_USERNAME,
      ),
    ),
  ).slice(0, 6);
}

function normalizeImageSlides(value: unknown): FeedImageSlide[] {
  if (!Array.isArray(value)) {
    return [
      {
        imageAlt: "새로 작성한 피드 이미지",
        imageSrc: localFeedImageSrc,
        label: "피드",
      },
    ];
  }

  const slides = value
    .map((slide, index): FeedImageSlide | null => {
      if (!isRecord(slide) || typeof slide.imageSrc !== "string") {
        return null;
      }

      return {
        imageAlt:
          typeof slide.imageAlt === "string" && slide.imageAlt
            ? slide.imageAlt
            : `피드 이미지 ${index + 1}`,
        imageSrc: slide.imageSrc,
        label:
          typeof slide.label === "string" && slide.label
            ? slide.label
            : `이미지 ${index + 1}`,
      };
    })
    .filter((slide): slide is FeedImageSlide => slide !== null);

  return slides.length ? slides.slice(0, 10) : normalizeImageSlides(null);
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
        collaboratorUsernames: normalizeCollaboratorUsernames(
          post.collaboratorUsernames,
        ),
        commentsClosed: post.commentsClosed === true,
        createdAt:
          typeof post.createdAt === "string"
            ? post.createdAt
            : new Date().toISOString(),
        id:
          typeof post.id === "string"
            ? post.id
            : `local-feed-${Date.now()}`,
        imageSlides: normalizeImageSlides(post.imageSlides),
        tags: normalizeLocalFeedTags(
          Array.isArray(post.tags)
            ? post.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        ),
        visibility: post.visibility === "private" ? "private" : "public",
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
  collaboratorUsernames,
  commentsClosed,
  imageSlides,
  tags,
  visibility,
}: LocalFeedPostInput) {
  const now = Date.now();
  const post: StoredLocalFeedPost = {
    body: body.trim(),
    collaboratorUsernames: normalizeCollaboratorUsernames(
      collaboratorUsernames,
    ),
    commentsClosed,
    createdAt: new Date(now).toISOString(),
    id: `local-feed-${now}-${Math.random().toString(36).slice(2, 8)}`,
    imageSlides: normalizeImageSlides(imageSlides),
    tags: normalizeLocalFeedTags(tags),
    visibility,
  };

  saveLocalFeedPosts([post, ...readLocalFeedPosts()]);

  return post;
}

export function removeLocalFeedPost(postId: string) {
  saveLocalFeedPosts(
    readLocalFeedPosts().filter((post) => post.id !== postId),
  );
}

export function setLocalFeedPostVisibility(
  postId: string,
  visibility: FeedVisibility,
) {
  saveLocalFeedPosts(
    readLocalFeedPosts().map((post) =>
      post.id === postId ? { ...post, visibility } : post,
    ),
  );
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
  const collaborators = post.collaboratorUsernames
    .map((username) => getArtistProfile(username))
    .filter((profile): profile is NonNullable<ReturnType<typeof getArtistProfile>> =>
      Boolean(profile),
    )
    .map((profile) => ({
      avatarSrc: profile.avatarSrc,
      displayName: profile.displayName,
      href: profile.href,
      isFollowing: profile.isFollowing,
      username: profile.username,
    }));
  const fallbackSlide = {
    imageAlt: "새로 작성한 피드 이미지",
    imageSrc: localFeedImageSrc,
    label: "피드",
  };
  const imageSlides = post.imageSlides.length ? post.imageSlides : [fallbackSlide];
  const firstSlide = imageSlides[0] ?? fallbackSlide;

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
    collaborators,
    createdAtLabel: "방금",
    href: `/feed/${encodeURIComponent(post.id)}`,
    id: post.id,
    imageAlt: firstSlide.imageAlt,
    imageSlides,
    imageSrc: firstSlide.imageSrc,
    likedBy: "아직 좋아요가 없습니다",
    likes: 0,
    tags: post.tags,
    visibility: post.visibility,
  };
}
