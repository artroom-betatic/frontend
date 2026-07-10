import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import {
  getSeriesDetail,
  getSeriesEpisode,
  getSeriesEpisodeParams,
} from "@/lib/catalog-data";

type SeriesEpisodePageProps = {
  params: Promise<{ episodeSlug: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeriesEpisodeParams();
}

export async function generateMetadata({
  params,
}: SeriesEpisodePageProps): Promise<Metadata> {
  const { episodeSlug, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const decodedEpisodeSlug = decodeURIComponent(episodeSlug);
  const series = getSeriesDetail(decodedSlug);
  const episode = getSeriesEpisode(decodedSlug, decodedEpisodeSlug);

  return {
    title:
      series && episode
        ? `${episode.title} - ${series.title} | Artroom`
        : "회차 | Artroom",
  };
}

export default async function SeriesEpisodePage({
  params,
}: SeriesEpisodePageProps) {
  const { episodeSlug, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const decodedEpisodeSlug = decodeURIComponent(episodeSlug);
  const series = getSeriesDetail(decodedSlug);
  const episode = getSeriesEpisode(decodedSlug, decodedEpisodeSlug);

  if (!series || !episode) {
    notFound();
  }

  const episodeIndex = series.episodes.findIndex(
    (seriesEpisode) => seriesEpisode.slug === episode.slug,
  );
  const previousEpisode = series.episodes[episodeIndex - 1];
  const nextEpisode = series.episodes[episodeIndex + 1];
  const previousHref = previousEpisode
    ? `/series/${series.slug}/episodes/${previousEpisode.slug}`
    : undefined;
  const nextHref = nextEpisode
    ? `/series/${series.slug}/episodes/${nextEpisode.slug}`
    : undefined;
  const linkClassName =
    "flex h-11 items-center justify-center rounded-md border border-line bg-white text-sm font-semibold text-foreground";
  const disabledClassName =
    "flex h-11 items-center justify-center rounded-md border border-line bg-panel text-sm font-semibold text-muted";

  return (
    <AppFrame className="bg-black">
      <MobileHeader
        backBehavior="history"
        backHref={series.href}
        title="회차 보기"
      />
      <main className="min-h-screen bg-black">
        <section className="bg-white px-6 pb-5 pt-4">
          <p className="text-xs font-semibold text-primary">{series.title}</p>
          <h1 className="mt-2 text-lg font-bold text-foreground">
            {episode.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-md bg-panel px-2 py-1 text-muted">
              {episodeIndex + 1}/{series.episodes.length}
            </span>
            <span className="rounded-md bg-panel px-2 py-1 text-primary">
              {episode.statusLabel}
            </span>
            <span className="text-muted">{episode.publishedAtLabel}</span>
          </div>
        </section>

        <section
          aria-label={`${episode.title} 본문`}
          className="bg-black"
        >
          {episode.scenes.map((scene, index) => (
            <Image
              alt={scene.imageAlt}
              className="block h-auto w-full"
              height={scene.imageHeight}
              key={`${scene.imageSrc}-${index}`}
              priority={index === 0}
              sizes="390px"
              src={scene.imageSrc}
              width={scene.imageWidth}
            />
          ))}
        </section>

        <section className="bg-white px-6 py-5">
          <div className="grid grid-cols-2 gap-2">
            {previousHref ? (
              <Link className={linkClassName} href={previousHref}>
                이전 회차
              </Link>
            ) : (
              <span className={disabledClassName}>이전 회차</span>
            )}
            {nextHref ? (
              <Link className={linkClassName} href={nextHref}>
                다음 회차
              </Link>
            ) : (
              <span className={disabledClassName}>다음 회차</span>
            )}
          </div>
          <Link
            className="mt-3 flex h-11 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white"
            href={series.href}
          >
            회차 목록으로
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
