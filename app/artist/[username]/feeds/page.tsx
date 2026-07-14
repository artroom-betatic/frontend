import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ArtistFeedCard } from "@/components/artist-feed-card";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getArtistResource } from "@/lib/server-data";

type ArtistFeedsPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: ArtistFeedsPageProps): Promise<Metadata> {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  return {
    title: resource ? `${resource.profile.displayName}의 피드 | Artroom` : "피드 | Artroom",
  };
}

export default async function ArtistFeedsPage({
  params,
}: ArtistFeedsPageProps) {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  if (!resource) {
    notFound();
  }

  const { posts, profile } = resource;

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref={profile.href}
        title="피드"
      />
      <main className="pb-24">
        <section className="bg-white px-6 pb-5 pt-5">
          <Link className="flex min-w-0 items-center gap-3" href={profile.href}>
            <ProfileAvatar size={40} />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-black">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-xs font-medium text-muted">
                @{profile.username} · 피드 {posts.length}개
              </p>
            </div>
          </Link>
        </section>

        <section className="mt-2 bg-white px-6 py-5">
          {posts.length ? (
            <div className="grid gap-3">
              {posts.map((post, index) => (
                <ArtistFeedCard
                  imagePriority={index === 0}
                  key={post.id}
                  post={post}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-line bg-panel p-4">
              <p className="text-sm font-semibold text-black">
                아직 등록된 피드가 없습니다.
              </p>
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
