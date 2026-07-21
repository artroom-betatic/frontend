"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { ArtworkDetail, SeriesDetail } from "@/lib/catalog-data";
import {
  readCreatorArtworks,
  removeCreatorArtwork,
  subscribeCreatorArtworksChange,
  defaultCreatorArtworks,
} from "@/lib/creator-artworks";
import type { ArtistProfile, ArtistSummary, FeedPost } from "@/lib/feed-types";
import {
  getLocalFeedPostsServerSnapshot,
  readLocalFeedPosts,
  removeLocalFeedPost,
  subscribeLocalFeedPostsChange,
  toFeedPost,
} from "@/lib/local-feed-posts";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import {
  defaultUserActionSnapshot,
  deleteArtwork,
  deleteFeedPost,
  deleteSeries,
  isArtworkDeleted,
  isFeedPostDeleted,
  isFeedPostPrivate,
  isSeriesDeleted,
  readUserActionSnapshot,
  subscribeUserActionsChange,
} from "@/lib/user-actions";

type ArtistProfileTabId = "collaborators" | "feeds" | "series" | "works";

type ArtistProfileTabsProps = {
  artworks: ArtworkDetail[];
  posts: FeedPost[];
  profile: ArtistProfile;
  series: SeriesDetail[];
};

type GridItem = {
  badge?: string;
  href: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  meta: string;
  onDelete?: () => void;
  title: string;
};

const tabs = [
  { id: "feeds", label: "피드" },
  { id: "works", label: "작품" },
  { id: "series", label: "시리즈" },
  { id: "collaborators", label: "공동작업자" },
] satisfies { id: ArtistProfileTabId; label: string }[];

function confirmDelete() {
  return window.confirm("정말 삭제할 것입니까?");
}

function getProfileSummary(profile: ArtistSummary): GridItem {
  return {
    href: profile.href,
    id: profile.username,
    imageAlt: `${profile.displayName} 프로필 이미지`,
    imageSrc: profile.avatarSrc,
    meta: `@${profile.username}`,
    title: profile.displayName,
  };
}

function ProfileGrid({
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: GridItem[];
}) {
  if (!items.length) {
    return (
      <div className="px-2 py-10 text-center">
        <p className="text-sm font-semibold text-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {items.map((item) => (
        <article className="group relative min-w-0" key={item.id}>
          <Link
            aria-label={`${item.title} 보기`}
            className="block rounded-md p-1 transition-colors hover:bg-panel"
            href={item.href}
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-white">
              <Image
                alt={item.imageAlt}
                className="object-cover"
                fill
                sizes="112px"
                src={item.imageSrc}
              />
              {item.badge ? (
                <span className="absolute left-1 top-1 rounded-md bg-black/55 px-1.5 py-0.5 text-2xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate text-2xs font-semibold text-foreground">
              {item.title}
            </p>
            <p className="truncate text-3xs font-medium text-muted">
              {item.meta}
            </p>
          </Link>
          {item.onDelete ? (
            <button
              aria-label={`${item.title} 삭제`}
              className="absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-1 text-3xs font-bold text-foreground opacity-100 shadow-sm transition-colors hover:bg-panel"
              onClick={item.onDelete}
              type="button"
            >
              삭제
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ArtistProfileTabs({
  artworks,
  posts,
  profile,
  series,
}: ArtistProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ArtistProfileTabId>("feeds");
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
  const creatorArtworks = useSyncExternalStore(
    subscribeCreatorArtworksChange,
    readCreatorArtworks,
    () => defaultCreatorArtworks,
  );
  const isOwnProfile = profile.username === MY_PROFILE_USERNAME;
  const visiblePosts = useMemo(() => {
    const localPosts = isOwnProfile ? localFeedPosts.map(toFeedPost) : [];

    return [...localPosts, ...posts].filter((post) => {
      const privatePost =
        post.visibility === "private" || isFeedPostPrivate(actionSnapshot, post.id);

      return (
        !isFeedPostDeleted(actionSnapshot, post.id) &&
        (isOwnProfile || !privatePost)
      );
    });
  }, [actionSnapshot, isOwnProfile, localFeedPosts, posts]);
  const feedItems = visiblePosts.map<GridItem>((post) => ({
    badge:
      post.visibility === "private" || isFeedPostPrivate(actionSnapshot, post.id)
        ? "비공개"
        : post.imageSlides && post.imageSlides.length > 1
          ? `${post.imageSlides.length}장`
          : undefined,
    href: post.href,
    id: post.id,
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    meta: `좋아요 ${post.likes} · 댓글 ${post.comments}`,
    onDelete: isOwnProfile
      ? () => {
          if (!confirmDelete()) {
            return;
          }

          if (post.id.startsWith("local-feed-")) {
            removeLocalFeedPost(post.id);
          } else {
            deleteFeedPost(post.id);
          }
        }
      : undefined,
    title: post.body,
  }));
  const creatorArtworkItems = isOwnProfile
    ? creatorArtworks.map<GridItem>((artwork) => ({
        badge: artwork.status === "published" ? "공개" : "초안",
        href: "/creator/artworks",
        id: artwork.id,
        imageAlt: artwork.imageAlt,
        imageSrc: artwork.imageSrc,
        meta: artwork.price ? `₩${Number(artwork.price).toLocaleString("ko-KR")}` : "가격 미설정",
        onDelete: () => {
          if (confirmDelete()) {
            removeCreatorArtwork(artwork.id);
          }
        },
        title: artwork.title,
      }))
    : [];
  const artworkItems = [
    ...artworks
      .filter((artwork) => !isArtworkDeleted(actionSnapshot, artwork.slug))
      .map<GridItem>((artwork) => ({
        badge: artwork.priceLabel,
        href: artwork.href,
        id: artwork.slug,
        imageAlt: artwork.imageAlt,
        imageSrc: artwork.imageSrc,
        meta: artwork.subtitle,
        onDelete: isOwnProfile
          ? () => {
              if (confirmDelete()) {
                deleteArtwork(artwork.slug);
              }
            }
          : undefined,
        title: artwork.title,
      })),
    ...creatorArtworkItems,
  ];
  const seriesItems = series
    .filter((seriesItem) => !isSeriesDeleted(actionSnapshot, seriesItem.slug))
    .map<GridItem>((seriesItem) => ({
      badge: seriesItem.statusLabel,
      href: seriesItem.href,
      id: seriesItem.slug,
      imageAlt: seriesItem.imageAlt,
      imageSrc: seriesItem.imageSrc,
      meta: seriesItem.episodeCountLabel,
      onDelete: isOwnProfile
        ? () => {
            if (confirmDelete()) {
              deleteSeries(seriesItem.slug);
            }
          }
        : undefined,
      title: seriesItem.title,
    }));
  const collaboratorItems = Array.from(
    new Map(
      visiblePosts
        .flatMap((post) => post.collaborators ?? [])
        .map((collaborator) => [collaborator.username, collaborator]),
    ).values(),
  ).map(getProfileSummary);
  const gridByTab = {
    collaborators: {
      emptyLabel: "공동작업자가 있는 피드가 없습니다.",
      items: collaboratorItems,
    },
    feeds: {
      emptyLabel: "표시할 피드가 없습니다.",
      items: feedItems,
    },
    series: {
      emptyLabel: "표시할 시리즈가 없습니다.",
      items: seriesItems,
    },
    works: {
      emptyLabel: "표시할 작품이 없습니다.",
      items: artworkItems,
    },
  } satisfies Record<ArtistProfileTabId, { emptyLabel: string; items: GridItem[] }>;
  const activeGrid = gridByTab[activeTab];

  return (
    <section className="mt-2 bg-white px-3 py-4">
      <div
        aria-label="프로필 콘텐츠 종류"
        className="grid grid-cols-4 gap-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              aria-selected={selected}
              className={`min-h-10 rounded-md px-1 text-xs font-semibold transition-colors hover:bg-panel ${
                selected ? "text-primary" : "text-subtle"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3">
        <ProfileGrid emptyLabel={activeGrid.emptyLabel} items={activeGrid.items} />
      </div>
    </section>
  );
}
