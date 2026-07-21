import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { DeleteContentButton } from "@/components/delete-content-button";
import { FigmaTag } from "@/components/figma-controls";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import { getArtworkSlugs } from "@/lib/catalog-data";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import { getArtworkResource } from "@/lib/server-data";

type ArtworkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getArtworkSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkResource(decodeURIComponent(slug));

  return {
    title: artwork ? `${artwork.title} | Artroom` : "작품 | Artroom",
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getArtworkResource(decodeURIComponent(slug));

  if (!artwork) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/search?type=artwork"
        title="작품 상세"
      />
      <main className="pb-24">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="relative aspect-square overflow-hidden rounded-md bg-panel">
            <Image
              alt={artwork.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="342px"
              src={artwork.imageSrc}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-primary">
              {artwork.subtitle}
            </p>
            <h1 className="mt-2 text-xl font-bold text-black">{artwork.title}</h1>
            <Link
              className="mt-2 block text-xs font-medium text-muted"
              href={artwork.creator.href}
            >
              @{artwork.creator.username}
            </Link>
            <p className="mt-4 text-2xl font-bold text-black">
              {artwork.priceLabel}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {artwork.tags.map((tag) => (
              <FigmaTag key={tag}>#{tag}</FigmaTag>
            ))}
          </div>

          <p className="mt-5 text-sm leading-6 text-foreground">
            {artwork.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              className="flex min-h-9 items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-white"
              href="/my"
            >
              내 소장함 확인
            </Link>
            <Link
              className="flex min-h-9 items-center justify-center rounded-md bg-line/20 px-3 py-2 text-xs font-medium text-black"
              href={artwork.creator.href}
            >
              작가 프로필
            </Link>
          </div>

          {artwork.creator.username === MY_PROFILE_USERNAME ? (
            <DeleteContentButton
              contentId={artwork.slug}
              contentType="artwork"
              redirectHref={artwork.creator.href}
            />
          ) : null}
        </section>

        <div className="px-6">
          <ScreenSection title="작품 구성">
            <div className="grid gap-3">
              {artwork.includes.map((item) => (
                <UiCard className="bg-white" key={item}>
                  <p className="text-sm font-semibold">{item}</p>
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
