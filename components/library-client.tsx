"use client";

import { useSyncExternalStore } from "react";
import { ContentListCard } from "@/components/content-list-card";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import type { ArtworkDetail } from "@/lib/catalog-data";
import type { FeedPost } from "@/lib/feed-types";
import {
  defaultUserActionSnapshot,
  getFeedPostCommentCount,
  getFeedPostLikeCount,
  isFeedPostBookmarked,
  readUserActionSnapshot,
  subscribeUserActionsChange,
} from "@/lib/user-actions";

type LibraryClientProps = {
  artworks: ArtworkDetail[];
  feedPosts: FeedPost[];
};

export function LibraryClient({ artworks, feedPosts }: LibraryClientProps) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const bookmarkedPosts = feedPosts.filter((post) =>
    isFeedPostBookmarked(actionSnapshot, post.id),
  );
  const collectionSummary = [
    { label: "구매 작품", value: String(artworks.length) },
    { label: "저장한 피드", value: String(bookmarkedPosts.length) },
    { label: "멤버십 콘텐츠", value: "6" },
  ];

  return (
    <main className="px-6 pb-[96px] pt-5">
      <p className="text-sm font-medium leading-6 text-subtle">
        구매한 디지털 작품과 저장한 피드를 다시 볼 수 있습니다.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {collectionSummary.map((item) => (
          <UiCard className="bg-white p-3 text-center" key={item.label}>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-[10px] text-muted">{item.label}</p>
          </UiCard>
        ))}
      </div>

      <ScreenSection title="최근 소장 작품">
        <div className="grid gap-3">
          {artworks.map((artwork) => (
            <ContentListCard
              badge="구매 완료"
              description={artwork.description}
              href={artwork.href}
              imageAlt={artwork.imageAlt}
              imageSrc={artwork.imageSrc}
              key={artwork.slug}
              subtitle={artwork.creator.displayName}
              title={artwork.title}
            />
          ))}
        </div>
      </ScreenSection>

      <ScreenSection title="저장한 피드">
        {bookmarkedPosts.length ? (
          <div className="grid gap-3">
            {bookmarkedPosts.map((post) => (
              <ContentListCard
                badge="저장됨"
                description={post.body}
                href={post.href}
                imageAlt={post.imageAlt}
                imageSrc={post.imageSrc}
                key={post.id}
                meta={`좋아요 ${getFeedPostLikeCount(
                  actionSnapshot,
                  post.id,
                  post.likes,
                )} · 댓글 ${getFeedPostCommentCount(
                  actionSnapshot,
                  post.id,
                  post.comments,
                )}`}
                subtitle={`@${post.artist.username}`}
                title={`${post.artist.displayName}의 피드`}
              />
            ))}
          </div>
        ) : (
          <UiCard className="bg-white">
            <p className="text-sm font-semibold text-foreground">
              저장한 피드가 없습니다
            </p>
            <p className="mt-2 text-xs leading-5 text-subtle">
              피드에서 북마크를 누르면 이곳에 모입니다.
            </p>
          </UiCard>
        )}
      </ScreenSection>
    </main>
  );
}
