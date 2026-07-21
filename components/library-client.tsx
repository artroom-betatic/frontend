"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ContentListCard } from "@/components/content-list-card";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import type { ArtworkDetail } from "@/lib/catalog-data";
import type { FeedPost } from "@/lib/feed-types";
import {
  addLibraryGroup,
  getLibraryGroupsServerSnapshot,
  getLibraryItemKey,
  readLibraryGroups,
  removeLibraryGroup,
  subscribeLibraryGroupsChange,
  toggleLibraryGroupItem,
  type LibraryItemType,
} from "@/lib/library-groups";
import {
  getLocalFeedPostsServerSnapshot,
  readLocalFeedPosts,
  subscribeLocalFeedPostsChange,
  toFeedPost,
} from "@/lib/local-feed-posts";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import {
  defaultUserActionSnapshot,
  getFeedPostCommentCount,
  getFeedPostLikeCount,
  isArtworkDeleted,
  isFeedPostBookmarked,
  isFeedPostDeleted,
  readUserActionSnapshot,
  subscribeUserActionsChange,
} from "@/lib/user-actions";

type LibraryClientProps = {
  artworks: ArtworkDetail[];
  feedPosts: FeedPost[];
};

type LibraryDisplayItem = {
  description?: string;
  href: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  itemKey: string;
  meta?: string;
  subtitle: string;
  title: string;
  type: LibraryItemType;
};

function GroupPicker({
  groups,
  itemKey,
}: {
  groups: ReturnType<typeof readLibraryGroups>;
  itemKey: string;
}) {
  if (!groups.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {groups.map((group) => {
        const active = group.itemKeys.includes(itemKey);

        return (
          <button
            aria-pressed={active}
            className={`rounded-md px-2 py-1 text-2xs font-semibold hover:bg-panel ${
              active ? "text-primary" : "text-subtle"
            }`}
            key={group.id}
            onClick={() => toggleLibraryGroupItem(group.id, itemKey)}
            type="button"
          >
            {active ? "제거" : "추가"} · {group.name}
          </button>
        );
      })}
    </div>
  );
}

export function LibraryClient({ artworks, feedPosts }: LibraryClientProps) {
  const [groupName, setGroupName] = useState("");
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const appSettings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const localFeedPosts = useSyncExternalStore(
    subscribeLocalFeedPostsChange,
    readLocalFeedPosts,
    getLocalFeedPostsServerSnapshot,
  );
  const groups = useSyncExternalStore(
    subscribeLibraryGroupsChange,
    readLibraryGroups,
    getLibraryGroupsServerSnapshot,
  );
  const mergedFeedPosts = useMemo(
    () => [...localFeedPosts.map(toFeedPost), ...feedPosts],
    [feedPosts, localFeedPosts],
  );
  const bookmarkedPosts = mergedFeedPosts.filter(
    (post) =>
      isFeedPostBookmarked(actionSnapshot, post.id) &&
      !isFeedPostDeleted(actionSnapshot, post.id),
  );
  const visibleArtworks = artworks.filter(
    (artwork) => !isArtworkDeleted(actionSnapshot, artwork.slug),
  );
  const artworkItems = visibleArtworks.map<LibraryDisplayItem>((artwork) => ({
    description: artwork.description,
    href: artwork.href,
    id: artwork.slug,
    imageAlt: artwork.imageAlt,
    imageSrc: artwork.imageSrc,
    itemKey: getLibraryItemKey("artwork", artwork.slug),
    subtitle: artwork.creator.displayName,
    title: artwork.title,
    type: "artwork",
  }));
  const feedItems = bookmarkedPosts.map<LibraryDisplayItem>((post) => ({
    description: post.body,
    href: post.href,
    id: post.id,
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    itemKey: getLibraryItemKey("feed", post.id),
    meta:
      post.artist.username !== MY_PROFILE_USERNAME ||
      appSettings.engagementCountDisplay === "show"
        ? `좋아요 ${getFeedPostLikeCount(
            actionSnapshot,
            post.id,
            post.likes,
          )} · 댓글 ${getFeedPostCommentCount(
            actionSnapshot,
            post.id,
            post.comments,
          )}`
        : undefined,
    subtitle: `@${post.artist.username}`,
    title: `${post.artist.displayName}의 피드`,
    type: "feed",
  }));
  const allItems = [...artworkItems, ...feedItems];
  const itemByKey = new Map(allItems.map((item) => [item.itemKey, item]));
  const collectionSummary = [
    { label: "구매 작품", value: String(visibleArtworks.length) },
    { label: "저장한 피드", value: String(bookmarkedPosts.length) },
    { label: "그룹", value: String(groups.length) },
  ];

  const createGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!groupName.trim()) {
      return;
    }

    addLibraryGroup(groupName);
    setGroupName("");
  };

  return (
    <main className="px-6 pb-24 pt-5">
      <p className="text-sm font-medium leading-6 text-subtle">
        구매한 디지털 작품과 저장한 피드를 다시 볼 수 있습니다.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {collectionSummary.map((item) => (
          <UiCard className="p-3 text-center" key={item.label}>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
            <p className="mt-1 text-2xs text-muted">{item.label}</p>
          </UiCard>
        ))}
      </div>

      <ScreenSection title="그룹">
        <form className="flex gap-2" onSubmit={createGroup}>
          <label className="sr-only" htmlFor="library-group-name">
            그룹 이름
          </label>
          <input
            className="h-11 min-w-0 flex-1 rounded-md bg-white px-3 text-sm font-semibold text-foreground outline-none placeholder:text-muted focus:bg-panel"
            id="library-group-name"
            onChange={(event) => setGroupName(event.currentTarget.value)}
            placeholder="새 그룹 이름"
            value={groupName}
          />
          <button
            className="rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:bg-line"
            disabled={!groupName.trim()}
            type="submit"
          >
            만들기
          </button>
        </form>

        {groups.length ? (
          <div className="mt-3 grid gap-2">
            {groups.map((group) => {
              const groupItems = group.itemKeys
                .map((itemKey) => itemByKey.get(itemKey))
                .filter((item): item is LibraryDisplayItem => Boolean(item));

              return (
                <UiCard className="bg-white" key={group.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {group.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        항목 {groupItems.length}개
                      </p>
                    </div>
                    <button
                      className="shrink-0 rounded-md bg-white px-3 py-2 text-xs font-semibold text-foreground hover:bg-panel"
                      onClick={() => removeLibraryGroup(group.id)}
                      type="button"
                    >
                      삭제
                    </button>
                  </div>
                  {groupItems.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-1">
                      {groupItems.map((item) => (
                        <a
                          className="truncate rounded-md px-2 py-2 text-2xs font-semibold text-primary hover:bg-panel"
                          href={item.href}
                          key={item.itemKey}
                        >
                          {item.title}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-5 text-subtle">
                      아래 저장 항목에서 이 그룹에 추가할 수 있습니다.
                    </p>
                  )}
                </UiCard>
              );
            })}
          </div>
        ) : (
          <UiCard className="mt-3 bg-white">
            <p className="text-sm font-semibold text-foreground">
              아직 만든 그룹이 없습니다
            </p>
            <p className="mt-2 text-xs leading-5 text-subtle">
              저장한 피드와 작품을 원하는 주제로 묶어둘 수 있습니다.
            </p>
          </UiCard>
        )}
      </ScreenSection>

      <ScreenSection title="최근 소장 작품">
        <div className="grid gap-3">
          {artworkItems.map((artwork) => (
            <div className="grid gap-2" key={artwork.itemKey}>
              <ContentListCard
                badge="구매 완료"
                description={artwork.description}
                href={artwork.href}
                imageAlt={artwork.imageAlt}
                imageSrc={artwork.imageSrc}
                subtitle={artwork.subtitle}
                title={artwork.title}
              />
              <GroupPicker groups={groups} itemKey={artwork.itemKey} />
            </div>
          ))}
        </div>
      </ScreenSection>

      <ScreenSection title="저장한 피드">
        {feedItems.length ? (
          <div className="grid gap-3">
            {feedItems.map((post) => (
              <div className="grid gap-2" key={post.itemKey}>
                <ContentListCard
                  badge="저장됨"
                  description={post.description}
                  href={post.href}
                  imageAlt={post.imageAlt}
                  imageSrc={post.imageSrc}
                  meta={post.meta}
                  subtitle={post.subtitle}
                  title={post.title}
                />
                <GroupPicker groups={groups} itemKey={post.itemKey} />
              </div>
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
