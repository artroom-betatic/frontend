"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ProfileAvatar } from "@/components/profile-avatar";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import type { FeedPost } from "@/lib/feed-types";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";

type ArtistFeedCardProps = {
  imagePriority?: boolean;
  post: FeedPost;
};

export function ArtistFeedCard({
  imagePriority = false,
  post,
}: ArtistFeedCardProps) {
  const settings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const showEngagementCounts =
    post.artist.username !== MY_PROFILE_USERNAME ||
    settings.engagementCountDisplay === "show";

  return (
    <Link
      aria-label={`${post.artist.displayName}의 피드 자세히 보기`}
      className="block overflow-hidden rounded-md border border-line bg-white"
      href={post.href}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <ProfileAvatar size={28} />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-black">
            {post.artist.displayName}
          </p>
          <p className="mt-0.5 text-2xs font-medium text-muted">
            @{post.artist.username} · {post.createdAtLabel}
          </p>
        </div>
      </div>
      <div className="relative h-44 bg-panel">
        <Image
          alt={post.imageAlt}
          className="object-cover"
          fill
          priority={imagePriority}
          sizes="342px"
          src={post.imageSrc}
        />
      </div>
      <div className="px-3 py-3">
        <p className="line-clamp-3 text-xs font-medium leading-5 text-foreground">
          {post.body}
        </p>
        {showEngagementCounts ? (
          <p className="mt-3 text-2xs font-semibold text-muted">
            좋아요 {post.likes} · 댓글 {post.comments}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
