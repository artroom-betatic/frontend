import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/bottom-nav";
import { ContentListCard } from "@/components/content-list-card";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { joinedMemberships } from "@/lib/membership-data";

export const metadata: Metadata = {
  title: "가입한 멤버십 관리 | Artroom",
};

export default function MembershipPage() {
  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/my"
        title="가입한 멤버십 관리"
      />
      <main className="px-6 pb-24 pt-6">
        <p className="text-sm font-medium leading-6 text-subtle">
          현재 가입 중인 멤버십과 다음 결제일을 확인합니다.
        </p>

        <ScreenSection title="가입한 멤버십">
          <div className="grid gap-3">
            {joinedMemberships.map((membership) => (
              <ContentListCard
                badge={membership.statusLabel}
                description={membership.description}
                href={membership.href}
                imageAlt={membership.imageAlt}
                imageSrc={membership.imageSrc}
                key={membership.slug}
                meta={`${membership.priceLabel} · 다음 결제 ${membership.nextBillingLabel}`}
                subtitle={`@${membership.artistUsername}`}
                title={membership.tierName}
              />
            ))}
          </div>
        </ScreenSection>
      </main>
      <BottomNav />
    </AppFrame>
  );
}
