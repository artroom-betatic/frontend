import Image from "next/image";
import Link from "next/link";
import type { SeriesDetail } from "@/lib/catalog-data";

type SeriesCardProps = {
  imagePriority?: boolean;
  series: SeriesDetail;
};

export function SeriesCard({ imagePriority = false, series }: SeriesCardProps) {
  return (
    <Link
      className="block rounded-[6px] border border-[#e5e7eb] bg-white p-3"
      href={series.href}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[6px] bg-[#f9fafb]">
          <Image
            alt={series.imageAlt}
            className="object-cover"
            fill
            priority={imagePriority}
            sizes="80px"
            src={series.imageSrc}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#307cff]">
            {series.statusLabel} · {series.episodeCountLabel}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-black">
            {series.title}
          </p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#1f2937]">
            {series.description}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[#929aa8]">
            {series.lastUpdatedLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}
