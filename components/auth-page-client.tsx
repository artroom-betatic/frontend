"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useSyncExternalStore } from "react";
import {
  createEmailAccount,
  readAuthSession,
  signInWithEmail,
  signOutAuthSession,
  subscribeAuthSessionChange,
} from "@/lib/auth-session";
import { oauthProviders, getOAuthProviderLabel } from "@/lib/oauth-providers";

type AuthPageMode = "login" | "signup";

type AuthPageClientProps = {
  initialMessage?: string;
  mode: AuthPageMode;
  nextPath: string;
};

const modeCopy = {
  login: {
    alternateHref: "/signup",
    alternateLabel: "회원가입",
    alternatePrompt: "아직 계정이 없다면",
    buttonLabel: "로그인",
    title: "로그인",
  },
  signup: {
    alternateHref: "/login",
    alternateLabel: "로그인",
    alternatePrompt: "이미 계정이 있다면",
    buttonLabel: "회원가입",
    title: "회원가입",
  },
} satisfies Record<
  AuthPageMode,
  {
    alternateHref: string;
    alternateLabel: string;
    alternatePrompt: string;
    buttonLabel: string;
    title: string;
  }
>;

function getProviderTone(provider: (typeof oauthProviders)[number]) {
  return provider === "kakao" ? "K" : "G";
}

function withNextPath(href: string, nextPath: string) {
  return `${href}?next=${encodeURIComponent(nextPath)}`;
}

export function AuthPageClient({
  initialMessage = "",
  mode,
  nextPath,
}: AuthPageClientProps) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeAuthSessionChange,
    readAuthSession,
    () => null,
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [statusMessage, setStatusMessage] = useState(initialMessage);
  const copy = modeCopy[mode];
  const alternateHref = withNextPath(copy.alternateHref, nextPath);

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (mode === "signup" && password !== passwordConfirm) {
      setStatusMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const result =
      mode === "login"
        ? signInWithEmail({ email, password })
        : createEmailAccount({ email, name, password });

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    router.replace(nextPath);
  };

  const signOut = () => {
    signOutAuthSession();
    setStatusMessage("로그아웃했습니다.");
  };

  return (
    <main className="px-6 pb-24 pt-5">
      <section className="bg-white">
        <h1 className="text-2xl font-bold leading-8 text-foreground">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-subtle">
          이메일 계정이나 소셜 계정으로 Artroom을 계속 이용하세요.
        </p>
      </section>

      {session ? (
        <section className="mt-7 rounded-md bg-white px-1 py-3 transition-colors hover:bg-panel">
          <p className="text-sm font-semibold text-foreground">
            {session.name}님으로 로그인되어 있습니다.
          </p>
          <p className="mt-1 text-xs font-medium text-subtle">
            {session.email} ·{" "}
            {session.provider === "email"
              ? "이메일"
              : getOAuthProviderLabel(session.provider)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white"
              onClick={() => router.replace(nextPath)}
              type="button"
            >
              계속하기
            </button>
            <button
              className="h-11 rounded-md bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-panel"
              onClick={signOut}
              type="button"
            >
              로그아웃
            </button>
          </div>
        </section>
      ) : null}

      <form className="mt-7 grid gap-4" onSubmit={submitAuth}>
        {mode === "signup" ? (
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-foreground">이름</span>
            <input
              autoComplete="name"
              className="h-12 rounded-md border border-line bg-white px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:border-primary"
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="프로필에 표시할 이름"
              required
              value={name}
            />
          </label>
        ) : null}

        <label className="grid gap-2">
          <span className="text-xs font-semibold text-foreground">이메일</span>
          <input
            autoComplete="email"
            className="h-12 rounded-md border border-line bg-white px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:border-primary"
            inputMode="email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="email@example.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold text-foreground">비밀번호</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="h-12 rounded-md border border-line bg-white px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:border-primary"
            minLength={8}
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="8자 이상"
            required
            type="password"
            value={password}
          />
        </label>

        {mode === "signup" ? (
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-foreground">
              비밀번호 확인
            </span>
            <input
              autoComplete="new-password"
              className="h-12 rounded-md border border-line bg-white px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:border-primary"
              minLength={8}
              onChange={(event) => setPasswordConfirm(event.currentTarget.value)}
              placeholder="비밀번호 다시 입력"
              required
              type="password"
              value={passwordConfirm}
            />
          </label>
        ) : null}

        {statusMessage ? (
          <p className="text-xs font-semibold text-primary" role="status">
            {statusMessage}
          </p>
        ) : null}

        <button
          className="h-12 rounded-md bg-primary px-4 text-sm font-semibold text-white"
          type="submit"
        >
          {copy.buttonLabel}
        </button>
      </form>

      <section className="mt-7">
        <div className="grid gap-2">
          {oauthProviders.map((provider) => (
            <a
              className="flex h-12 items-center justify-center gap-3 rounded-md bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-panel"
              href={withNextPath(`/api/auth/oauth/${provider}`, nextPath)}
              key={provider}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                {getProviderTone(provider)}
              </span>
              {getOAuthProviderLabel(provider)}로 계속
            </a>
          ))}
        </div>
      </section>

      <p className="mt-7 text-center text-xs font-medium text-subtle">
        {copy.alternatePrompt}{" "}
        <Link className="font-semibold text-primary" href={alternateHref}>
          {copy.alternateLabel}
        </Link>
      </p>
    </main>
  );
}
