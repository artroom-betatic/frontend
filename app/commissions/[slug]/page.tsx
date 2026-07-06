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
import { getCommissionOfferSlugs } from "@/lib/catalog-data";
import { getCommissionOfferResource } from "@/lib/server-data";

type CommissionOfferPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCommissionOfferSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CommissionOfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const commission = await getCommissionOfferResource(decodeURIComponent(slug));

  return {
    title: commission ? `${commission.title} | Artroom` : "커미션 | Artroom",
  };
}

export default async function CommissionOfferPage({
  params,
}: CommissionOfferPageProps) {
  const { slug } = await params;
  const commission = await getCommissionOfferResource(decodeURIComponent(slug));

  if (!commission) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader backHref="/search?tag=commission" title="커미션 상세" />
      <main className="pb-[96px]">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="relative aspect-square overflow-hidden rounded-[6px] bg-[#f9fafb]">
            <Image
              alt={commission.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="342px"
              src={commission.imageSrc}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-[#307cff]">
              {commission.subtitle}
            </p>
            <h1 className="mt-2 text-xl font-bold text-black">
              {commission.title}
            </h1>
            <Link
              className="mt-2 block text-xs font-medium text-[#929aa8]"
              href={commission.creator.href}
            >
              @{commission.creator.username}
            </Link>
            <p className="mt-4 text-2xl font-bold text-black">
              {commission.priceLabel}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-[6px]">
            {commission.tags.map((tag) => (
              <FigmaTag key={tag}>#{tag}</FigmaTag>
            ))}
          </div>

          <p className="mt-5 text-sm leading-6 text-[#1f2937]">
            {commission.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              className="flex min-h-9 items-center justify-center rounded-[5px] bg-[#307cff] px-3 py-2 text-xs font-medium text-white"
              href="/commissions"
            >
              의뢰 현황으로
            </Link>
            <Link
              className="flex min-h-9 items-center justify-center rounded-[5px] bg-[rgba(208,213,221,0.2)] px-3 py-2 text-xs font-medium text-black"
              href={commission.creator.href}
            >
              작가 프로필
            </Link>
          </div>
        </section>

        <ScreenSection title="작업 과정">
          <div className="grid gap-3 px-6">
            {commission.process.map((item, index) => (
              <UiCard className="bg-white" key={item}>
                <p className="text-sm font-semibold">
                  {index + 1}. {item}
                </p>
              </UiCard>
            ))}
          </div>
        </ScreenSection>

        <ScreenSection title="제공 파일">
          <div className="grid gap-3 px-6">
            {commission.deliverables.map((item) => (
              <UiCard className="bg-white" key={item}>
                <p className="text-sm font-semibold">{item}</p>
              </UiCard>
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
