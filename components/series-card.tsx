import { ContentListCard } from "@/components/content-list-card";
import type { SeriesDetail } from "@/lib/catalog-data";

type SeriesCardProps = {
  imagePriority?: boolean;
  series: SeriesDetail;
};

export function SeriesCard({ imagePriority = false, series }: SeriesCardProps) {
  return (
    <ContentListCard
      description={series.description}
      eyebrow={`${series.statusLabel} · ${series.episodeCountLabel}`}
      href={series.href}
      imageAlt={series.imageAlt}
      imagePriority={imagePriority}
      imageSrc={series.imageSrc}
      meta={series.lastUpdatedLabel}
      title={series.title}
    />
  );
}
