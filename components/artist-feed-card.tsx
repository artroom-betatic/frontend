import Image from "next/image";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { FeedPost } from "@/lib/feed-types";

type ArtistFeedCardProps = {
  imagePriority?: boolean;
  post: FeedPost;
};

export function ArtistFeedCard({
  imagePriority = false,
  post,
}: ArtistFeedCardProps) {
  return (
    <Link
      aria-label={`${post.artist.displayName}의 피드 자세히 보기`}
      className="block overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-white"
      href={post.href}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <ProfileAvatar size={28} />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-black">
            {post.artist.displayName}
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-[#929aa8]">
            @{post.artist.username} · {post.createdAtLabel}
          </p>
        </div>
      </div>
      <div className="relative h-44 bg-[#f9fafb]">
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
        <p className="line-clamp-3 text-xs font-medium leading-5 text-[#1f2937]">
          {post.body}
        </p>
        <p className="mt-3 text-[10px] font-semibold text-[#929aa8]">
          좋아요 {post.likes} · 댓글 {post.comments}
        </p>
      </div>
    </Link>
  );
}
