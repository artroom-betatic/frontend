"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { FeedCommentsSection } from "@/components/feed-comments-section";
import { FeedInterestMenu } from "@/components/feed-interest-controls";
import { FeedLikedByLine } from "@/components/feed-liked-by-line";
import { PostActions } from "@/components/post-actions";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import {
  getLocalFeedPostsServerSnapshot,
  readLocalFeedPosts,
  subscribeLocalFeedPostsChange,
  toFeedPost,
} from "@/lib/local-feed-posts";
import { getTagSearchHref } from "@/lib/tag-search";

type LocalFeedDetailProps = {
  feedId: string;
};

export function LocalFeedDetail({ feedId }: LocalFeedDetailProps) {
  const localFeedPosts = useSyncExternalStore(
    subscribeLocalFeedPostsChange,
    readLocalFeedPosts,
    getLocalFeedPostsServerSnapshot,
  );
  const localFeedPost =
    localFeedPosts.find((post) => post.id === feedId) ?? null;

  if (!localFeedPost) {
    return (
      <main className="pb-24">
        <section className="px-6 py-5">
          <UiCard className="bg-white">
            <p className="text-sm font-semibold text-foreground">
              피드를 찾을 수 없습니다
            </p>
            <Link
              className="mt-3 inline-flex text-xs font-semibold text-primary"
              href="/"
            >
              홈으로 돌아가기
            </Link>
          </UiCard>
        </section>
      </main>
    );
  }

  const post = toFeedPost(localFeedPost);

  return (
    <main className="pb-24">
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
              </p>
            </div>
          </Link>
          <FeedInterestMenu
            artistUsername={post.artist.username}
            postId={post.id}
          />
        </div>

        <div className="relative h-feed-media w-full overflow-hidden bg-panel">
          <Image
            alt={post.imageAlt}
            className="object-cover"
            fill
            priority
            sizes="390px"
            src={post.imageSrc}
          />
        </div>

        <div className="bg-white px-4 py-4">
          <PostActions
            artistUsername={post.artist.username}
            comments={post.comments}
            commentsClosedByDefault={post.commentsClosed}
            commentsAnchorId="feed-comments"
            initialLikes={post.likes}
            postId={post.id}
            shareText={post.body}
            shareTitle={`${post.artist.displayName}의 피드`}
            shareUrl={post.href}
          />

          <FeedLikedByLine
            artistUsername={post.artist.username}
            className="mt-1"
            likedBy={post.likedBy}
          />

          <p className="mt-4 text-sm font-medium leading-6 text-black">
            <Link className="font-bold" href={post.artist.href}>
              {post.artist.username}
            </Link>{" "}
            {post.body}
          </p>
          {post.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
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
      </article>

      <FeedCommentsSection
        artistUsername={post.artist.username}
        baseComments={[]}
        commentsClosedByDefault={post.commentsClosed}
        initialCommentCount={post.comments}
        postId={post.id}
      />
    </main>
  );
}
