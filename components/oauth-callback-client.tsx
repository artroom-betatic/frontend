"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signInWithOAuth } from "@/lib/auth-session";
import {
  getOAuthProviderLabel,
  isOAuthProvider,
  type OAuthProvider,
} from "@/lib/oauth-providers";

type OAuthCallbackClientProps = {
  avatarSrc?: string;
  email?: string;
  errorMessage?: string;
  name?: string;
  nextPath: string;
  provider?: string;
  status?: string;
};

function getStatusCopy(provider: OAuthProvider, status?: string) {
  const providerLabel = getOAuthProviderLabel(provider);

  if (status === "dev") {
    return `${providerLabel} OAuth 환경 변수가 없어 개발용 계정으로 로그인했습니다.`;
  }

  return `${providerLabel} 계정으로 로그인했습니다.`;
}

export function OAuthCallbackClient({
  avatarSrc,
  email,
  errorMessage,
  name,
  nextPath,
  provider,
  status,
}: OAuthCallbackClientProps) {
  const router = useRouter();
  const validProvider = provider && isOAuthProvider(provider) ? provider : null;
  const message = errorMessage
    ? errorMessage
    : validProvider
      ? getStatusCopy(validProvider, status)
      : "지원하지 않는 OAuth 제공자입니다.";

  useEffect(() => {
    if (errorMessage || !validProvider) {
      return;
    }

    signInWithOAuth({
      avatarSrc,
      email,
      name,
      provider: validProvider,
    });

    const timeoutId = window.setTimeout(() => {
      router.replace(nextPath);
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [
    avatarSrc,
    email,
    errorMessage,
    name,
    nextPath,
    router,
    validProvider,
  ]);

  return (
    <main className="px-6 pb-24 pt-5">
      <section className="rounded-md bg-white px-1 py-10 text-center">
        <p className="text-base font-semibold text-foreground">{message}</p>
        <p className="mt-2 text-xs font-medium leading-5 text-subtle">
          {errorMessage || !validProvider
            ? "로그인 화면에서 다시 시도해주세요."
            : "잠시 후 이전 작업 화면으로 이동합니다."}
        </p>
        <div className="mt-5 grid gap-2">
          <Link
            className="flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
            href={nextPath}
          >
            바로 이동
          </Link>
          <Link
            className="flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-panel"
            href="/login"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
