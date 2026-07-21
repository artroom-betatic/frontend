import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { OAuthCallbackClient } from "@/components/oauth-callback-client";
import { getSafeAuthNextPath } from "@/lib/auth-paths";

type OAuthCallbackPageProps = {
  searchParams: Promise<{
    avatarSrc?: string;
    email?: string;
    error?: string;
    name?: string;
    next?: string;
    provider?: string;
    status?: string;
  }>;
};

export const metadata: Metadata = {
  title: "OAuth 로그인 | Artroom",
};

export default async function OAuthCallbackPage({
  searchParams,
}: OAuthCallbackPageProps) {
  const params = await searchParams;

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/login" title="로그인" />
      <OAuthCallbackClient
        avatarSrc={params.avatarSrc}
        email={params.email}
        errorMessage={params.error}
        name={params.name}
        nextPath={getSafeAuthNextPath(params.next)}
        provider={params.provider}
        status={params.status}
      />
    </AppFrame>
  );
}
