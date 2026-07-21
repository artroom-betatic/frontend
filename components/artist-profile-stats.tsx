"use client";

import { useMemo, useSyncExternalStore } from "react";
import { UiCard } from "@/components/ui-card";
import type { ArtworkDetail } from "@/lib/catalog-data";
import {
  defaultCreatorArtworks,
  readCreatorArtworks,
  subscribeCreatorArtworksChange,
} from "@/lib/creator-artworks";
import type { ArtistProfile, FeedPost } from "@/lib/feed-types";
import {
  getLocalFeedPostsServerSnapshot,
  readLocalFeedPosts,
  subscribeLocalFeedPostsChange,
} from "@/lib/local-feed-posts";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import {
  defaultUserActionSnapshot,
  isArtworkDeleted,
  isFeedPostDeleted,
  isFeedPostPrivate,
  readUserActionSnapshot,
  subscribeUserActionsChange,
} from "@/lib/user-actions";

type ArtistProfileStatsProps = {
  artworks: ArtworkDetail[];
  commissionsCount: number;
  posts: FeedPost[];
  profile: ArtistProfile;
};

export function ArtistProfileStats({
  artworks,
  commissionsCount,
  posts,
  profile,
}: ArtistProfileStatsProps) {
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
  const visiblePostCount = useMemo(() => {
    const staticPostCount = posts.filter((post) => {
      const privatePost =
        post.visibility === "private" || isFeedPostPrivate(actionSnapshot, post.id);

      return (
        !isFeedPostDeleted(actionSnapshot, post.id) &&
        (isOwnProfile || !privatePost)
      );
    }).length;
    const localPostCount = isOwnProfile
      ? localFeedPosts.filter(
          (post) => !isFeedPostDeleted(actionSnapshot, post.id),
        ).length
      : 0;

    return staticPostCount + localPostCount;
  }, [actionSnapshot, isOwnProfile, localFeedPosts, posts]);
  const visibleArtworkCount =
    artworks.filter((artwork) => !isArtworkDeleted(actionSnapshot, artwork.slug))
      .length + (isOwnProfile ? creatorArtworks.length : 0);
  const stats = [
    { label: "게시물", value: visiblePostCount },
    { label: "작품", value: visibleArtworkCount },
    { label: "커미션", value: commissionsCount },
  ];

  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <UiCard className="p-3 text-center" key={stat.label}>
          <p className="text-lg font-bold">{stat.value}</p>
          <p className="mt-1 text-2xs text-muted">{stat.label}</p>
        </UiCard>
      ))}
    </div>
  );
}
