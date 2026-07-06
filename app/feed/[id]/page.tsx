import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { AssetIcon } from "@/components/asset-icon";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { PostActions } from "@/components/post-actions";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import { comments } from "@/lib/artroom-data";
import { getFeedPostResource } from "@/lib/server-data";

type FeedDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: FeedDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getFeedPostResource(decodeURIComponent(id));

  return {
    title: post ? `${post.artist.displayName}의 피드 | Artroom` : "피드 | Artroom",
  };
}

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
  const { id } = await params;
  const post = await getFeedPostResource(decodeURIComponent(id));

  if (!post) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="피드" />
      <main className="pb-[96px]">
        <article className="bg-white">
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
          </div>

          <div className="relative h-[491px] w-full overflow-hidden bg-[#f9fafb]">
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
              comments={post.comments}
              commentsAnchorId="feed-comments"
              initialLikes={post.likes}
            />

            <p className="mt-[5px] flex items-center text-[10px] leading-3 text-black">
              <span className="relative mr-2 flex w-[29px] shrink-0">
                <ProfileAvatar className="border border-white" size={22} />
                <ProfileAvatar className="-ml-[15px] border border-white" size={22} />
              </span>
              <span>{post.likedBy}</span>
            </p>

            <p className="mt-4 text-sm font-medium leading-6 text-black">
              <Link className="font-bold" href={post.artist.href}>
                {post.artist.username}
              </Link>{" "}
              {post.body}
            </p>
          </div>
        </article>

        <section className="mt-2 bg-white px-4 py-5" id="feed-comments">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-black">댓글</h2>
            <span className="text-xs font-medium text-[#929aa8]">
              {post.comments}개
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {comments.slice(0, 4).map((comment) => (
              <UiCard className="bg-white" key={`${comment.author}-${comment.body}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-2">
                    <ProfileAvatar size={32} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black">
                        {comment.author}
                        <span className="ml-1 font-normal text-[#929aa8]">
                          {comment.time}
                        </span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-black">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                  <AssetIcon className="h-4 w-4 shrink-0 opacity-30" name="heart-small" />
                </div>
              </UiCard>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
