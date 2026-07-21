"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent, MouseEvent, TouchEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { comments, type Comment } from "@/lib/artroom-data";
import {
  contentDisplayOptions,
  defaultAppSettings,
  readAppSettings,
  sortFeedPostsByContentDisplay,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import { fetchFeedPage } from "@/lib/feed-client";
import type { FeedPost } from "@/lib/feed-types";
import {
  getLocalFeedPostsServerSnapshot,
  readLocalFeedPosts,
  subscribeLocalFeedPostsChange,
  toFeedPost,
} from "@/lib/local-feed-posts";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import { getTagSearchHref } from "@/lib/tag-search";
import { ActionButton } from "./action-button";
import { AssetIcon } from "./asset-icon";
import { BottomNav } from "./bottom-nav";
import { FeedInterestMenu } from "./feed-interest-controls";
import { PostActionIcon } from "./figma-controls";
import { ProfileAvatar } from "./profile-avatar";
import { ShareButton } from "./share-button";
import { UiCard } from "./ui-card";
import {
  addFeedComment,
  defaultUserActionSnapshot,
  getArtistFollowing,
  getFeedCommentKey,
  getFeedCommentPinnedIndex,
  getFeedCommentSettings,
  getFeedPostCommentCount,
  getFeedPostLikeCount,
  getStoredFeedComments,
  isFeedCommentPinned,
  isFeedPostDeleted,
  isFeedPostPrivate,
  isUsernameBlocked,
  isFeedPostBookmarked,
  isFeedPostLiked,
  readUserActionSnapshot,
  setArtistFollowing,
  subscribeUserActionsChange,
  togglePinnedFeedComment,
  toggleFeedPostBookmark,
  toggleFeedPostLike,
} from "@/lib/user-actions";

const FEED_PAGE_SIZE = 3;
const SLIDE_CONTROL_HIDE_DELAY_MS = 2500;
const SLIDE_SWIPE_THRESHOLD_PX = 44;
const SLIDE_SWIPE_VERTICAL_TOLERANCE_PX = 80;

type FeedStatus = "error" | "loading" | "loadingMore" | "ready";

type CommentDisplayRow = Comment & {
  commentKey: string;
  pinned: boolean;
  pinnedIndex: number;
  rowIndex: number;
};

function CommentRow({
  author,
  body,
  canPin,
  canReply,
  onPin,
  onReply,
  pinned,
  time,
}: {
  author: string;
  body: string;
  canPin: boolean;
  canReply: boolean;
  onPin: () => void;
  onReply: (author: string) => void;
  pinned: boolean;
  time: string;
}) {
  return (
    <article className="flex items-start justify-between gap-4 px-4 py-2.5">
      <div className="flex min-w-0 items-start gap-1.5">
        <ProfileAvatar size={40} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1 text-3xs font-semibold leading-none text-black">
            <span>{author}</span>
            <span className="font-normal text-muted/70">{time}</span>
            {pinned ? (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
                고정됨
              </span>
            ) : null}
          </p>
          <p className="mt-1 truncate text-2xs font-medium leading-3 text-black">
            {body}
          </p>
          {canPin || canReply ? (
            <div className="mt-1 flex flex-wrap gap-2">
              {canReply ? (
                <button
                  className="text-2xs font-semibold leading-3 text-muted/70"
                  onClick={() => onReply(author)}
                  type="button"
                >
                  답글 달기
                </button>
              ) : null}
              {canPin ? (
                <button
                  className="text-2xs font-semibold leading-3 text-primary"
                  onClick={onPin}
                  type="button"
                >
                  {pinned ? "고정 해제" : "댓글 고정"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <AssetIcon className="h-4 w-4 shrink-0 opacity-30" name="heart-small" />
    </article>
  );
}

function CommentsSheet({
  onClose,
  post,
}: {
  onClose: () => void;
  post: FeedPost;
}) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const [draftComment, setDraftComment] = useState("");
  const commentSettings = getFeedCommentSettings(
    actionSnapshot,
    post.id,
    post.commentsClosed === true,
  );
  const commentsClosed = commentSettings.commentsClosed;
  const isPostOwner = post.artist.username === MY_PROFILE_USERNAME;
  const commentRows = useMemo<CommentDisplayRow[]>(() => {
    const baseComments = post.id.startsWith("local-feed-") ? [] : comments;
    const rows = [
      ...getStoredFeedComments(actionSnapshot, post.id),
      ...baseComments,
    ].map((comment, rowIndex) => {
      const commentKey = getFeedCommentKey(comment);
      const pinnedIndex = getFeedCommentPinnedIndex(
        commentSettings,
        commentKey,
      );

      return {
        ...comment,
        commentKey,
        pinned: isFeedCommentPinned(commentSettings, commentKey),
        pinnedIndex,
        rowIndex,
      };
    });

    return rows.sort((left, right) => {
      if (left.pinned && right.pinned) {
        return left.pinnedIndex - right.pinnedIndex;
      }

      if (left.pinned || right.pinned) {
        return left.pinned ? -1 : 1;
      }

      return left.rowIndex - right.rowIndex;
    });
  }, [actionSnapshot, commentSettings, post.id]);

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = draftComment.trim();

    if (!body) {
      return;
    }

    if (commentsClosed) {
      return;
    }

    addFeedComment(post.id, body);
    setDraftComment("");
  };

  if (commentsClosed && !isPostOwner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 mx-auto w-full max-w-app bg-black/50">
      <button
        aria-label="댓글창 닫기"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <section className="absolute bottom-0 left-0 z-10 h-comments-sheet w-full overflow-hidden rounded-t-sheet bg-white">
        <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-muted/70" />
        <div className="mt-3 flex items-center justify-between gap-3 px-4">
          <h2 className="text-xs font-medium text-black">댓글</h2>
          {isPostOwner && commentsClosed ? (
            <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
              댓글 막힘
            </span>
          ) : null}
        </div>
        <div className="mt-6 max-h-80 overflow-y-auto">
          {commentRows.map((comment) => (
            <CommentRow
              {...comment}
              canPin={isPostOwner}
              canReply={!commentsClosed}
              key={`${comment.author}-${comment.commentKey}`}
              onPin={() =>
                togglePinnedFeedComment(
                  post.id,
                  comment.commentKey,
                  post.commentsClosed === true,
                )
              }
              onReply={(author) => setDraftComment(`@${author} `)}
            />
          ))}
        </div>
        {commentsClosed ? (
          <div className="absolute bottom-0 left-0 flex h-bottom-nav w-full items-center border-t border-muted/70 bg-white px-4">
            <p className="text-xs font-medium text-muted">
              이 피드의 댓글창이 닫혀 있습니다.
            </p>
          </div>
        ) : (
          <form
            className="absolute bottom-0 left-0 flex h-bottom-nav w-full items-center gap-2 border-t border-muted/70 bg-white px-4"
            onSubmit={submitComment}
          >
            <ProfileAvatar size={30} />
            <input
              aria-label="댓글 입력"
              className="flex h-7.5 min-w-0 flex-1 items-center rounded-full border border-muted/70 px-3.5 text-xs font-medium text-black outline-none placeholder:text-muted"
              onChange={(event) => setDraftComment(event.currentTarget.value)}
              placeholder="대화 참여하기..."
              value={draftComment}
            />
            <button
              className="h-7.5 rounded-md bg-primary px-3 text-xs font-medium text-white disabled:bg-line"
              disabled={!draftComment.trim()}
              type="submit"
            >
              등록
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid gap-4 px-4 py-5">
      {[0, 1].map((item) => (
        <div className="grid gap-4" key={item}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-line" />
            <div className="grid gap-2">
              <div className="h-3 w-24 rounded-full bg-line" />
              <div className="h-2 w-16 rounded-full bg-background" />
            </div>
          </div>
          <div className="h-90 rounded-md bg-panel" />
        </div>
      ))}
    </div>
  );
}

function FeedPostArticle({
  index,
  onOpenComments,
  post,
  showEngagementCounts,
}: {
  index: number;
  onOpenComments: () => void;
  post: FeedPost;
  showEngagementCounts: boolean;
}) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const fallbackSlide = {
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    label: "완성본",
  };
  const slides = post.imageSlides?.length ? post.imageSlides : [fallbackSlide];
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideControlsVisible, setSlideControlsVisible] = useState(true);
  const slideTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressSlideLinkUntilRef = useRef(0);
  const currentSlide = slides[slideIndex] ?? fallbackSlide;
  const hasMultipleSlides = slides.length > 1;
  const bookmarked = isFeedPostBookmarked(actionSnapshot, post.id);
  const isFollowing = getArtistFollowing(
    actionSnapshot,
    post.artist.username,
    post.artist.isFollowing,
  );
  const liked = isFeedPostLiked(actionSnapshot, post.id);
  const commentSettings = getFeedCommentSettings(
    actionSnapshot,
    post.id,
    post.commentsClosed === true,
  );
  const isPostOwner = post.artist.username === MY_PROFILE_USERNAME;
  const privatePost =
    post.visibility === "private" || isFeedPostPrivate(actionSnapshot, post.id);
  const canOpenComments = isPostOwner || !commentSettings.commentsClosed;
  const likes = getFeedPostLikeCount(actionSnapshot, post.id, post.likes);
  const commentCount = getFeedPostCommentCount(
    actionSnapshot,
    post.id,
    post.comments,
  );

  const revealSlideControls = useCallback(() => {
    if (hasMultipleSlides) {
      setSlideControlsVisible(true);
    }
  }, [hasMultipleSlides]);

  const showPreviousSlide = useCallback(() => {
    if (!hasMultipleSlides) {
      return;
    }

    revealSlideControls();
    setSlideIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [hasMultipleSlides, revealSlideControls, slides.length]);

  const showNextSlide = useCallback(() => {
    if (!hasMultipleSlides) {
      return;
    }

    revealSlideControls();
    setSlideIndex((current) => (current + 1) % slides.length);
  }, [hasMultipleSlides, revealSlideControls, slides.length]);

  useEffect(() => {
    if (!hasMultipleSlides || !slideControlsVisible) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setSlideControlsVisible(false),
      SLIDE_CONTROL_HIDE_DELAY_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [hasMultipleSlides, slideControlsVisible, slideIndex]);

  const handleSlideTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    revealSlideControls();
    slideTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleSlideTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStart = slideTouchStartRef.current;
    const touch = event.changedTouches[0];

    slideTouchStartRef.current = null;

    if (!touchStart || !touch || !hasMultipleSlides) {
      return;
    }

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (
      Math.abs(deltaX) < SLIDE_SWIPE_THRESHOLD_PX ||
      Math.abs(deltaY) > SLIDE_SWIPE_VERTICAL_TOLERANCE_PX
    ) {
      return;
    }

    event.preventDefault();
    suppressSlideLinkUntilRef.current = Date.now() + 450;

    if (deltaX < 0) {
      showNextSlide();
    } else {
      showPreviousSlide();
    }
  };

  const handleSlideLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (Date.now() < suppressSlideLinkUntilRef.current) {
      event.preventDefault();
    }
  };

  const slideButtonVisibilityClassName = slideControlsVisible
    ? "opacity-100"
    : "pointer-events-none opacity-0";

  return (
    <article className="bg-white">
      <div className="flex h-15.5 items-center px-3.5 py-4">
        <Link className="flex min-w-0 flex-1 items-center" href={post.artist.href}>
          <ProfileAvatar className="mx-2" size={32} />
          <div className="ml-2 min-w-0">
            <p className="truncate text-sm font-semibold leading-4 text-black">
              {post.artist.displayName}
            </p>
            <p className="mt-0.5 text-2xs font-medium text-muted">
              @{post.artist.username} · {post.createdAtLabel}
              {privatePost ? " · 비공개" : ""}
            </p>
            {post.collaborators?.length ? (
              <p className="mt-0.5 truncate text-2xs font-semibold text-primary">
                함께한 작가{" "}
                {post.collaborators
                  .map((collaborator) => `@${collaborator.username}`)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <ActionButton
            aria-pressed={isFollowing}
            onClick={() =>
              setArtistFollowing(post.artist.username, !isFollowing)
            }
            variant={isFollowing ? "following" : "follow"}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </ActionButton>
          <FeedInterestMenu
            artistUsername={post.artist.username}
            initialPrivate={privatePost}
            postId={post.id}
          />
        </div>
      </div>

      <div
        className="relative h-feed-media w-full touch-pan-y overflow-hidden bg-panel"
        onMouseMove={revealSlideControls}
        onTouchEnd={handleSlideTouchEnd}
        onTouchStart={handleSlideTouchStart}
      >
        <Link
          aria-label={`${post.artist.displayName}의 피드 자세히 보기`}
          className="absolute inset-0 z-10"
          href={post.href}
          onClick={handleSlideLinkClick}
        />
        <Image
          alt={currentSlide.imageAlt}
          className="object-cover"
          fill
          priority={index === 0}
          sizes="390px"
          src={currentSlide.imageSrc}
        />
        {hasMultipleSlides ? (
          <>
            <span className="absolute right-11 top-3.5 z-20 rounded-full bg-black/50 px-2 py-1 text-2xs font-semibold text-white">
              {slideIndex + 1}/{slides.length} {currentSlide.label}
            </span>
            <button
              aria-label="이전 이미지"
              className={`absolute left-2.25 top-1/2 z-20 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-muted transition-opacity ${slideButtonVisibilityClassName}`}
              onClick={showPreviousSlide}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="다음 이미지"
              className={`absolute right-2.25 top-1/2 z-20 flex size-6.5 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-muted transition-opacity ${slideButtonVisibilityClassName}`}
              onClick={showNextSlide}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      <div className="bg-white px-4 py-4">
        <div className="flex h-10 items-center">
          <div className="flex items-center gap-1">
            <PostActionIcon
              active={liked}
              aria-label={liked ? "좋아요 취소" : "좋아요"}
              aria-pressed={liked}
              kind="heart"
              onClick={() => toggleFeedPostLike(post.id)}
            />
            {showEngagementCounts ? (
              <span className="text-xs font-bold text-black">{likes}</span>
            ) : null}
          </div>
          {canOpenComments ? (
            <div className="ml-6 flex items-center gap-1">
              <PostActionIcon
                aria-label="댓글 보기"
                kind="message"
                onClick={onOpenComments}
              />
              {showEngagementCounts ? (
                <span className="text-xs font-bold text-black">
                  {commentCount}
                </span>
              ) : null}
            </div>
          ) : null}
          <ShareButton
            className="ml-6"
            shareText={post.body}
            shareTitle={`${post.artist.displayName}의 피드`}
            shareUrl={post.href}
          />
          <PostActionIcon
            active={bookmarked}
            aria-label={bookmarked ? "소장함에서 제거" : "소장함에 저장"}
            aria-pressed={bookmarked}
            className="ml-auto"
            kind="bookmark"
            onClick={() => toggleFeedPostBookmark(post.id)}
          />
        </div>
        <div className="mt-1">
          {showEngagementCounts ? (
            <p className="flex items-center text-2xs leading-3 text-black">
              <span className="relative mr-2 flex w-7 shrink-0">
                <ProfileAvatar className="border border-white" size={22} />
                <ProfileAvatar className="-ml-4 border border-white" size={22} />
              </span>
              <span>{post.likedBy}</span>
            </p>
          ) : null}
          <p className="mt-2 text-2xs font-medium leading-3 text-black">
            <Link className="font-bold" href={post.artist.href}>
              {post.artist.username}
            </Link>{" "}
            <Link href={post.href}>{post.body}</Link>
          </p>
          {post.tags.length ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary"
                  href={getTagSearchHref(tag)}
                  key={tag}
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function HomeFeed() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const appSettings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const localFeedPosts = useSyncExternalStore(
    subscribeLocalFeedPostsChange,
    readLocalFeedPosts,
    getLocalFeedPostsServerSnapshot,
  );
  const mergedPosts = useMemo(
    () => [...localFeedPosts.map(toFeedPost), ...posts],
    [localFeedPosts, posts],
  );
  const displayedPosts = useMemo(
    () =>
      sortFeedPostsByContentDisplay(
        mergedPosts,
        appSettings.contentDisplay,
      ).filter((post) => {
        const privatePost =
          post.visibility === "private" || isFeedPostPrivate(actionSnapshot, post.id);

        return (
          !isFeedPostDeleted(actionSnapshot, post.id) &&
          !isUsernameBlocked(actionSnapshot, post.artist.username) &&
          (post.artist.username === MY_PROFILE_USERNAME || !privatePost)
        );
      }),
    [actionSnapshot, appSettings.contentDisplay, mergedPosts],
  );
  const selectedContentDisplayOption = useMemo(
    () =>
      contentDisplayOptions.find(
        (option) => option.id === appSettings.contentDisplay,
      ) ?? contentDisplayOptions[0],
    [appSettings.contentDisplay],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchFeedPage(
      {
        contentDisplay: appSettings.contentDisplay,
        limit: FEED_PAGE_SIZE,
      },
      controller.signal,
    )
      .then((page) => {
        setPosts(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setErrorMessage("");
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "피드를 불러오지 못했습니다.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [appSettings.contentDisplay, refreshKey]);

  const loadMore = useCallback(() => {
    if (!cursor || !hasMore || status !== "ready") {
      return;
    }

    setStatus("loadingMore");

    fetchFeedPage({
      contentDisplay: appSettings.contentDisplay,
      cursor,
      limit: FEED_PAGE_SIZE,
    })
      .then((page) => {
        setPosts((currentPosts) => [...currentPosts, ...page.items]);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setErrorMessage("");
        setStatus("ready");
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "피드를 불러오지 못했습니다.",
        );
        setStatus("error");
      });
  }, [appSettings.contentDisplay, cursor, hasMore, status]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || status !== "ready") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, status]);

  const retryFeed = () => {
    setCursor(null);
    setHasMore(true);
    setPosts([]);
    setStatus("loading");
    setRefreshKey((currentKey) => currentKey + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-white pb-bottom-nav">
        <header className="sticky top-0 z-20 flex h-12.5 items-center justify-between bg-white px-6.5">
          <h1 className="text-sm font-bold tracking-normal text-black">
            Artroom
          </h1>
          <div className="flex items-center gap-2">
            {appSettings.contentDisplay !== "balanced" ? (
              <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
                {selectedContentDisplayOption.label}
              </span>
            ) : null}
            <Link
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white"
              href="/feed/new"
            >
              새 피드
            </Link>
          </div>
        </header>

        {status === "loading" ? <FeedSkeleton /> : null}

        {displayedPosts.map((post, index) => (
          <FeedPostArticle
            index={index}
            key={post.id}
            onOpenComments={() => setCommentPost(post)}
            post={post}
            showEngagementCounts={
              post.artist.username !== MY_PROFILE_USERNAME ||
              appSettings.engagementCountDisplay === "show"
            }
          />
        ))}

        {status === "ready" && posts.length > 0 && displayedPosts.length === 0 ? (
          <div className="px-4 py-5">
            <UiCard>
              <p className="text-sm font-semibold">표시할 피드가 없습니다</p>
              <p className="mt-2 text-xs leading-5 text-muted">
                차단한 계정의 피드는 홈에서 숨겨집니다.
              </p>
            </UiCard>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="px-4 py-5">
            <UiCard>
              <p className="text-sm font-semibold">피드를 불러오지 못했습니다</p>
              <p className="mt-2 text-xs leading-5 text-muted">{errorMessage}</p>
              <button
                className="mt-4 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white"
                onClick={retryFeed}
                type="button"
              >
                다시 시도
              </button>
            </UiCard>
          </div>
        ) : null}

        {status === "loadingMore" ? (
          <p className="py-5 text-center text-xs font-medium text-muted">
            새 피드를 불러오는 중
          </p>
        ) : null}

        {!hasMore && posts.length ? (
          <p className="py-5 text-center text-xs font-medium text-muted">
            모든 피드를 확인했어요
          </p>
        ) : null}

        <div ref={sentinelRef} className="h-3" />
      </div>

      <BottomNav />
      {commentPost ? (
        <CommentsSheet onClose={() => setCommentPost(null)} post={commentPost} />
      ) : null}
    </>
  );
}
