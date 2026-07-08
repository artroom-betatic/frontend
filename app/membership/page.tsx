import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { MembershipManager } from "@/components/membership-manager";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "가입한 멤버십 관리 | Artroom",
};

export default function MembershipPage() {
  return (
    <AppFrame>
      <MobileHeader
        backBehavior="history"
        backHref="/menu"
        title="가입한 멤버십 관리"
      />
      <main className="px-6 pb-8 pt-6">
        <MembershipManager />
      </main>
    </AppFrame>
  );
}
