import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { FeedCommentsSection } from "@/components/feed-comments-section";
import { FeedInterestMenu } from "@/components/feed-interest-controls";
import { FeedLikedByLine } from "@/components/feed-liked-by-line";
import { FeedMediaCarousel } from "@/components/feed-media-carousel";
import { LocalFeedDetail } from "@/components/local-feed-detail";
import { MobileHeader } from "@/components/mobile-header";
import { PostActions } from "@/components/post-actions";
import { ProfileAvatar } from "@/components/profile-avatar";
import { comments } from "@/lib/artroom-data";
import { getFeedPostResource } from "@/lib/server-data";
import { getTagSearchHref } from "@/lib/tag-search";

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
  const feedId = decodeURIComponent(id);
  const post = await getFeedPostResource(feedId);

  if (!post && !feedId.startsWith("local-feed-")) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="피드" />
      {!post ? (
        <LocalFeedDetail feedId={feedId} />
      ) : (
        <main className="pb-24">
          <article className="bg-white">
            <div className="flex h-15.5 items-center px-3.5 py-4">
              <Link
                className="flex min-w-0 flex-1 items-center"
                href={post.artist.href}
              >
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
                deleteRedirectHref="/"
                postId={post.id}
              />
            </div>

            <FeedMediaCarousel
              imageAlt={post.imageAlt}
              imageSlides={post.imageSlides}
              imageSrc={post.imageSrc}
              priority
            />

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
            baseComments={comments.slice(0, 4)}
            commentsClosedByDefault={post.commentsClosed}
            initialCommentCount={post.comments}
            postId={post.id}
          />
        </main>
      )}
      <BottomNav />
    </AppFrame>
  );
}
