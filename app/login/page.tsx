import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";
import { AuthPageClient } from "@/components/auth-page-client";
import { MobileHeader } from "@/components/mobile-header";
import { getSafeAuthNextPath } from "@/lib/auth-paths";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    signedUp?: string;
  }>;
};

export const metadata: Metadata = {
  title: "로그인 | Artroom",
};

function getInitialMessage({
  error,
  signedUp,
}: {
  error?: string;
  signedUp?: string;
}) {
  if (error) {
    return decodeURIComponent(error);
  }

  if (signedUp === "1") {
    return "회원가입이 완료되었습니다. 로그인해주세요.";
  }

  return "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeAuthNextPath(params.next);

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/" title="로그인" />
      <AuthPageClient
        initialMessage={getInitialMessage(params)}
        mode="login"
        nextPath={nextPath}
      />
    </AppFrame>
  );
}
