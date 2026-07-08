import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { SeriesCard } from "@/components/series-card";
import { getArtistSeries } from "@/lib/catalog-data";
import { getArtistResource } from "@/lib/server-data";

type ArtistSeriesPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: ArtistSeriesPageProps): Promise<Metadata> {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  return {
    title: resource
      ? `${resource.profile.displayName}의 시리즈 | Artroom`
      : "시리즈 | Artroom",
  };
}

export default async function ArtistSeriesPage({
  params,
}: ArtistSeriesPageProps) {
  const { username } = await params;
  const resource = await getArtistResource(decodeURIComponent(username));

  if (!resource) {
    notFound();
  }

  const { profile } = resource;
  const seriesList = getArtistSeries(profile.username);

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref={profile.href}
        title="시리즈"
      />
      <main className="pb-[96px]">
        <section className="bg-white px-6 pb-5 pt-5">
          <Link className="flex min-w-0 items-center gap-3" href={profile.href}>
            <ProfileAvatar size={40} />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-black">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-xs font-medium text-[#929aa8]">
                @{profile.username} · 시리즈 {seriesList.length}개
              </p>
            </div>
          </Link>
        </section>

        <section className="mt-2 bg-white px-6 py-5">
          {seriesList.length ? (
            <div className="grid gap-3">
              {seriesList.map((series, index) => (
                <SeriesCard
                  imagePriority={index === 0}
                  key={series.slug}
                  series={series}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <p className="text-sm font-semibold text-black">
                공개된 시리즈가 없습니다.
              </p>
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
