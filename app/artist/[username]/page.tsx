import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { ArtistActions } from "@/components/artist-actions";
import { BottomNav } from "@/components/bottom-nav";
import { FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import { getArtistResource } from "@/lib/server-data";

type ArtistPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: ArtistPageProps): Promise<Metadata> {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  return {
    title: resource ? `${resource.profile.displayName} | Artroom` : "작가 | Artroom",
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  if (!resource) {
    notFound();
  }

  const { posts, profile } = resource;

  return (
    <AppFrame>
      <MobileHeader title={profile.displayName} />
      <main className="pb-[96px]">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="flex items-start gap-4">
            <ProfileAvatar size={72} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-black">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-xs font-medium text-[#929aa8]">
                @{profile.username}
              </p>
              <p className="mt-2 text-xs font-medium text-[#307cff]">
                {profile.followersLabel}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-black">{profile.coverTitle}</p>
          <p className="mt-3 text-xs leading-5 text-[#1f2937]">{profile.bio}</p>

          <div className="mt-4 flex flex-wrap gap-[6px]">
            {profile.tags.map((tag) => (
              <FigmaTag key={tag}>{tag}</FigmaTag>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <UiCard className="p-3 text-center">
              <p className="text-lg font-bold">{profile.stats.posts}</p>
              <p className="mt-1 text-[10px] text-[#929aa8]">게시물</p>
            </UiCard>
            <UiCard className="p-3 text-center">
              <p className="text-lg font-bold">{profile.stats.works}</p>
              <p className="mt-1 text-[10px] text-[#929aa8]">작품</p>
            </UiCard>
            <UiCard className="p-3 text-center">
              <p className="text-lg font-bold">{profile.stats.commissions}</p>
              <p className="mt-1 text-[10px] text-[#929aa8]">커미션</p>
            </UiCard>
          </div>

          <ArtistActions
            artistUsername={profile.username}
            initialFollowing={profile.isFollowing}
            membershipLabel={profile.membershipLabel}
          />
        </section>

        <section className="mt-2 bg-white px-6 py-5">
          <h2 className="text-base font-semibold">최근 피드</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {posts.map((post) => (
              <Link
                aria-label={`${post.artist.displayName}의 피드 자세히 보기`}
                className="block overflow-hidden rounded-[6px] border border-[#e5e7eb] bg-white"
                href={post.href}
                key={post.id}
              >
                <div className="relative aspect-square bg-[#f9fafb]">
                  <Image
                    alt={post.imageAlt}
                    className="object-cover"
                    fill
                    sizes="164px"
                    src={post.imageSrc}
                  />
                </div>
                <p className="line-clamp-2 p-2 text-[10px] font-medium leading-4">
                  {post.body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
