import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { ContentListCard } from "@/components/content-list-card";
import { DeleteContentButton } from "@/components/delete-content-button";
import { FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import {
  getSeriesDetail,
  getSeriesSlugs,
} from "@/lib/catalog-data";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";

type SeriesPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getSeriesSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesDetail(decodeURIComponent(slug));

  return {
    title: series ? `${series.title} | Artroom` : "시리즈 | Artroom",
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = getSeriesDetail(decodeURIComponent(slug));

  if (!series) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref={series.creator.href}
        title="시리즈"
      />
      <main className="pb-24">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="relative aspect-square overflow-hidden rounded-md bg-panel">
            <Image
              alt={series.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="342px"
              src={series.imageSrc}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-primary">
              {series.subtitle} · {series.statusLabel}
            </p>
            <h1 className="mt-2 text-xl font-bold text-black">{series.title}</h1>
            <Link
              className="mt-2 block text-xs font-medium text-muted"
              href={series.creator.href}
            >
              @{series.creator.username}
            </Link>
            <p className="mt-4 text-sm font-semibold text-black">
              {series.episodeCountLabel} · {series.lastUpdatedLabel}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {series.tags.map((tag) => (
              <FigmaTag key={tag}>#{tag}</FigmaTag>
            ))}
          </div>

          <p className="mt-5 text-sm leading-6 text-foreground">
            {series.description}
          </p>

          {series.creator.username === MY_PROFILE_USERNAME ? (
            <DeleteContentButton
              contentId={series.slug}
              contentType="series"
              redirectHref={series.creator.href}
            />
          ) : null}
        </section>

        <div className="px-6">
          <ScreenSection title="회차">
            <div className="grid gap-3">
              {series.episodes.map((episode) => (
                <ContentListCard
                  ariaLabel={`${episode.title} 보기`}
                  badge={episode.statusLabel}
                  href={`/series/${series.slug}/episodes/${episode.slug}`}
                  imageAlt={episode.imageAlt}
                  imageSrc={episode.imageSrc}
                  key={episode.title}
                  subtitle={episode.publishedAtLabel}
                  title={episode.title}
                />
              ))}
            </div>
          </ScreenSection>
        </div>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
