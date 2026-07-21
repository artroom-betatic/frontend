import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { AuthPageClient } from "@/components/auth-page-client";
import { MobileHeader } from "@/components/mobile-header";
import { getSafeAuthNextPath } from "@/lib/auth-paths";

type SignupPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "회원가입 | Artroom",
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAuthNextPath(params.next);

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="회원가입" />
      <AuthPageClient mode="signup" nextPath={nextPath} />
    </AppFrame>
  );
}
