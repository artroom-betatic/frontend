"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { comments } from "@/lib/artroom-data";
import { fetchFeedPage } from "@/lib/feed-client";
import type { FeedPost } from "@/lib/feed-types";
import { ActionButton } from "./action-button";
import { AssetIcon } from "./asset-icon";
import { BottomNav } from "./bottom-nav";
import { PostActionIcon } from "./figma-controls";
import { ProfileAvatar } from "./profile-avatar";
import { UiCard } from "./ui-card";

const FEED_PAGE_SIZE = 3;

type FeedStatus = "error" | "loading" | "loadingMore" | "ready";

function CommentRow({
  author,
  body,
  onReply,
  time,
}: {
  author: string;
  body: string;
  onReply: (author: string) => void;
  time: string;
}) {
  return (
    <article className="flex items-center justify-between gap-4 px-[15px] py-[10px]">
      <div className="flex min-w-0 items-start gap-[6px]">
        <ProfileAvatar size={40} />
        <div className="min-w-0">
          <p className="text-[9px] font-semibold leading-none text-[#040404]">
            {author} <span className="font-normal text-[#b0b0b0]">{time}</span>
          </p>
          <p className="mt-1 truncate text-[10px] font-medium leading-3 text-black">
            {body}
          </p>
          <button
            className="mt-1 text-[10px] font-semibold leading-3 text-[#b0b0b0]"
            onClick={() => onReply(author)}
            type="button"
          >
            답글 달기
          </button>
        </div>
      </div>
      <AssetIcon className="h-4 w-4 shrink-0 opacity-30" name="heart-small" />
    </article>
  );
}

function CommentsSheet({ onClose }: { onClose: () => void }) {
  const [commentRows, setCommentRows] = useState(comments);
  const [draftComment, setDraftComment] = useState("");

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = draftComment.trim();

    if (!body) {
      return;
    }

    setCommentRows((currentRows) => [
      { author: "user_123", body, time: "방금" },
      ...currentRows,
    ]);
    setDraftComment("");
  };

  return (
    <div className="fixed inset-0 z-40 mx-auto w-full max-w-[390px] bg-[rgba(40,36,36,0.5)]">
      <button
        aria-label="댓글창 닫기"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <section className="absolute bottom-0 left-0 z-10 h-[467px] w-full overflow-hidden rounded-t-[50px] bg-white">
        <div className="mx-auto mt-[15px] h-[3px] w-10 rounded-full bg-[#b0b0b0]" />
        <h2 className="mt-3 text-center text-xs font-medium text-black">댓글</h2>
        <div className="mt-6 max-h-[314px] overflow-y-auto">
          {commentRows.map((comment, index) => (
            <CommentRow
              {...comment}
              key={`${comment.author}-${comment.body}-${index}`}
              onReply={(author) => setDraftComment(`@${author} `)}
            />
          ))}
        </div>
        <form
          className="absolute bottom-0 left-0 flex h-[70px] w-full items-center gap-2 border-t border-[#b0b0b0] bg-white px-[17px]"
          onSubmit={submitComment}
        >
          <ProfileAvatar size={30} />
          <input
            aria-label="댓글 입력"
            className="flex h-[30px] min-w-0 flex-1 items-center rounded-full border border-[#b0b0b0] px-[14px] text-xs font-medium text-black outline-none placeholder:text-[#929aa8]"
            onChange={(event) => setDraftComment(event.currentTarget.value)}
            placeholder="대화 참여하기..."
            value={draftComment}
          />
          <button
            className="h-[30px] rounded-[5px] bg-[#307cff] px-3 text-xs font-medium text-white disabled:bg-[#d0d5dd]"
            disabled={!draftComment.trim()}
            type="submit"
          >
            등록
          </button>
        </form>
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
            <div className="h-8 w-8 rounded-full bg-[#e5e7eb]" />
            <div className="grid gap-2">
              <div className="h-3 w-24 rounded-full bg-[#e5e7eb]" />
              <div className="h-2 w-16 rounded-full bg-[#eef0f3]" />
            </div>
          </div>
          <div className="h-[360px] rounded-[6px] bg-[#f3f4f6]" />
        </div>
      ))}
    </div>
  );
}

function FeedPostArticle({
  index,
  onOpenComments,
  post,
}: {
  index: number;
  onOpenComments: () => void;
  post: FeedPost;
}) {
  const fallbackSlide = {
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    label: "완성본",
  };
  const slides = post.imageSlides?.length ? post.imageSlides : [fallbackSlide];
  const [bookmarked, setBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.artist.isFollowing);
  const [reaction, setReaction] = useState({
    liked: false,
    likes: post.likes,
  });
  const [slideIndex, setSlideIndex] = useState(0);
  const currentSlide = slides[slideIndex] ?? fallbackSlide;

  const toggleLike = () => {
    setReaction((current) => ({
      liked: !current.liked,
      likes: Math.max(0, current.likes + (current.liked ? -1 : 1)),
    }));
  };

  const showPreviousSlide = () => {
    setSlideIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setSlideIndex((current) => (current + 1) % slides.length);
  };

  return (
    <article className="border-b border-[#f0f2f5] bg-white">
      <div className="flex h-[62px] items-center px-[14px] py-4">
        <Link className="flex min-w-0 flex-1 items-center" href={post.artist.href}>
          <ProfileAvatar className="mx-[7px]" size={32} />
          <div className="ml-2 min-w-0">
            <p className="truncate text-[13px] font-semibold leading-4 text-black">
              {post.artist.displayName}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-[#929aa8]">
              @{post.artist.username} · {post.createdAtLabel}
            </p>
          </div>
        </Link>
        <ActionButton
          aria-pressed={isFollowing}
          onClick={() => setIsFollowing((current) => !current)}
          variant={isFollowing ? "following" : "follow"}
        >
          {isFollowing ? "팔로잉" : "팔로우"}
        </ActionButton>
      </div>

      <div className="relative h-[491px] w-full overflow-hidden bg-[#f9fafb]">
        <Link
          aria-label={`${post.artist.displayName}의 피드 자세히 보기`}
          className="absolute inset-0 z-10"
          href={post.href}
        />
        <Image
          alt={currentSlide.imageAlt}
          className="object-cover"
          fill
          priority={index === 0}
          sizes="390px"
          src={currentSlide.imageSrc}
        />
        <span className="absolute right-[44px] top-[14px] z-20 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
          {slideIndex + 1}/{slides.length} {currentSlide.label}
        </span>
        <button
          aria-label="이전 이미지"
          className="absolute left-[9px] top-1/2 z-20 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#929aa8]"
          onClick={showPreviousSlide}
          type="button"
        >
          ‹
        </button>
        <button
          aria-label="다음 이미지"
          className="absolute right-[9px] top-1/2 z-20 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-[#929aa8]"
          onClick={showNextSlide}
          type="button"
        >
          ›
        </button>
      </div>

      <div className="bg-white px-4 py-4">
        <div className="flex h-10 items-center">
          <div className="flex items-center gap-1">
            <PostActionIcon
              active={reaction.liked}
              aria-label={reaction.liked ? "좋아요 취소" : "좋아요"}
              aria-pressed={reaction.liked}
              kind="heart"
              onClick={toggleLike}
            />
            <span className="text-xs font-bold text-black">{reaction.likes}</span>
          </div>
          <div className="ml-[25px] flex items-center gap-1">
            <PostActionIcon
              aria-label="댓글 보기"
              kind="message"
              onClick={onOpenComments}
            />
            <span className="text-xs font-bold text-black">{post.comments}</span>
          </div>
          <PostActionIcon
            active={bookmarked}
            aria-label={bookmarked ? "소장함에서 제거" : "소장함에 저장"}
            aria-pressed={bookmarked}
            className="ml-auto"
            kind="bookmark"
            onClick={() => setBookmarked((current) => !current)}
          />
        </div>
        <div className="mt-[5px]">
          <p className="flex items-center text-[10px] leading-3 text-black">
            <span className="relative mr-2 flex w-[29px] shrink-0">
              <ProfileAvatar className="border border-white" size={22} />
              <ProfileAvatar className="-ml-[15px] border border-white" size={22} />
            </span>
            <span>{post.likedBy}</span>
          </p>
          <p className="mt-2 text-[10px] font-medium leading-3 text-black">
            <Link className="font-bold" href={post.artist.href}>
              {post.artist.username}
            </Link>{" "}
            <Link href={post.href}>{post.body}</Link>
          </p>
        </div>
      </div>
    </article>
  );
}

export function HomeFeed() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [status, setStatus] = useState<FeedStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    fetchFeedPage({ limit: FEED_PAGE_SIZE }, controller.signal)
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
  }, [refreshKey]);

  const loadMore = useCallback(() => {
    if (!cursor || !hasMore || status !== "ready") {
      return;
    }

    setStatus("loadingMore");

    fetchFeedPage({ cursor, limit: FEED_PAGE_SIZE })
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
  }, [cursor, hasMore, status]);

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
      <div className="min-h-screen bg-white pb-[70px]">
        <header className="sticky top-0 z-20 flex h-[50px] items-center bg-white px-[26px]">
          <h1 className="text-[13px] font-bold tracking-[-0.01em] text-black">
            Artroom
          </h1>
        </header>

        {status === "loading" ? <FeedSkeleton /> : null}

        {posts.map((post, index) => (
          <FeedPostArticle
            index={index}
            key={post.id}
            onOpenComments={() => setCommentsOpen(true)}
            post={post}
          />
        ))}

        {status === "error" ? (
          <div className="px-4 py-5">
            <UiCard>
              <p className="text-sm font-semibold">피드를 불러오지 못했습니다</p>
              <p className="mt-2 text-xs leading-5 text-[#929aa8]">{errorMessage}</p>
              <button
                className="mt-4 rounded-[5px] bg-[#307cff] px-3 py-[7px] text-xs font-medium text-white"
                onClick={retryFeed}
                type="button"
              >
                다시 시도
              </button>
            </UiCard>
          </div>
        ) : null}

        {status === "loadingMore" ? (
          <p className="py-5 text-center text-xs font-medium text-[#929aa8]">
            새 피드를 불러오는 중
          </p>
        ) : null}

        {!hasMore && posts.length ? (
          <p className="py-5 text-center text-xs font-medium text-[#929aa8]">
            모든 피드를 확인했어요
          </p>
        ) : null}

        <div ref={sentinelRef} className="h-3" />
      </div>

      <BottomNav />
      {commentsOpen ? <CommentsSheet onClose={() => setCommentsOpen(false)} /> : null}
    </>
  );
}
