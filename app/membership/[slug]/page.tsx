import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  getJoinedMembership,
  getJoinedMembershipSlugs,
} from "@/lib/membership-data";

type MembershipDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getJoinedMembershipSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: MembershipDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const membership = getJoinedMembership(decodeURIComponent(slug));

  return {
    title: membership
      ? `${membership.tierName} | Artroom`
      : "멤버십 | Artroom",
  };
}

export default async function MembershipDetailPage({
  params,
}: MembershipDetailPageProps) {
  const { slug } = await params;
  const membership = getJoinedMembership(decodeURIComponent(slug));

  if (!membership) {
    notFound();
  }

  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/membership"
        title="멤버십 상세"
      />
      <main className="pb-24">
        <section className="bg-white px-6 pb-6 pt-5">
          <div className="relative aspect-square overflow-hidden rounded-md bg-panel">
            <Image
              alt={membership.imageAlt}
              className="object-cover"
              fill
              priority
              sizes="342px"
              src={membership.imageSrc}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-primary">
              {membership.statusLabel} · {membership.priceLabel}
            </p>
            <h1 className="mt-2 text-xl font-bold text-black">
              {membership.tierName}
            </h1>
            <Link
              className="mt-2 block text-xs font-medium text-muted"
              href={membership.artistHref}
            >
              @{membership.artistUsername}
            </Link>
            <p className="mt-5 text-sm leading-6 text-subtle">
              {membership.description}
            </p>
          </div>
        </section>

        <div className="px-6">
          <ScreenSection title="멤버십 혜택">
            <div className="grid gap-3">
              {membership.benefits.map((benefit) => (
                <UiCard className="bg-white" key={benefit}>
                  <p className="text-sm font-semibold text-foreground">
                    {benefit}
                  </p>
                </UiCard>
              ))}
            </div>
          </ScreenSection>
        </div>

        <div className="px-6">
          <ScreenSection title="결제 정보">
            <UiCard className="bg-white">
              <div className="flex justify-between gap-4 text-xs">
                <span className="text-subtle">다음 결제일</span>
                <span className="font-semibold text-foreground">
                  {membership.nextBillingLabel}
                </span>
              </div>
              <div className="mt-3 flex justify-between gap-4 text-xs">
                <span className="text-subtle">결제 금액</span>
                <span className="font-semibold text-foreground">
                  {membership.priceLabel}
                </span>
              </div>
            </UiCard>
          </ScreenSection>
        </div>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
