import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  getSeriesDetail,
  getSeriesSlugs,
} from "@/lib/catalog-data";

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
      <main className="pb-[96px]">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#f9fafb]">
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
            <p className="text-xs font-semibold text-[#307cff]">
              {series.subtitle} · {series.statusLabel}
            </p>
            <h1 className="mt-2 text-xl font-bold text-black">{series.title}</h1>
            <Link
              className="mt-2 block text-xs font-medium text-[#929aa8]"
              href={series.creator.href}
            >
              @{series.creator.username}
            </Link>
            <p className="mt-4 text-sm font-semibold text-black">
              {series.episodeCountLabel} · {series.lastUpdatedLabel}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-[6px]">
            {series.tags.map((tag) => (
              <FigmaTag key={tag}>#{tag}</FigmaTag>
            ))}
          </div>

          <p className="mt-5 text-sm leading-6 text-[#1f2937]">
            {series.description}
          </p>
        </section>

        <div className="px-6">
          <ScreenSection title="회차">
            <div className="grid gap-3">
              {series.episodes.map((episode) => (
                <UiCard className="bg-white" key={episode.title}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {episode.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#929aa8]">
                        {episode.publishedAtLabel}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-[#f9fafb] px-3 py-2 text-xs font-semibold text-[#307cff]">
                      {episode.statusLabel}
                    </span>
                  </div>
                </UiCard>
              ))}
            </div>
          </ScreenSection>
        </div>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
