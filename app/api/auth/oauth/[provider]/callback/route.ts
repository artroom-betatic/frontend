import { getSafeAuthNextPath } from "@/lib/auth-paths";
import {
  getOAuthProviderConfig,
  getOAuthProviderLabel,
  isOAuthProvider,
  type OAuthProvider,
} from "@/lib/oauth-providers";

type OAuthCallbackRouteContext = {
  params: Promise<{ provider: string }>;
};

type OAuthProfile = {
  avatarSrc?: string;
  email?: string;
  name?: string;
};

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getOrigin(request: Request) {
  const url = new URL(request.url);

  return `${url.protocol}//${url.host}`;
}

function getRedirectUri(request: Request, provider: OAuthProvider) {
  const config = getOAuthProviderConfig(provider);

  return (
    process.env[config.redirectUriEnv] ??
    `${getOrigin(request)}/api/auth/oauth/${provider}/callback`
  );
}

function createClientCallbackUrl(
  request: Request,
  provider: OAuthProvider,
  nextPath: string,
) {
  const callbackUrl = new URL("/auth/oauth/callback", request.url);

  callbackUrl.searchParams.set("provider", provider);
  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl;
}

function redirectToClientError(
  request: Request,
  provider: OAuthProvider,
  nextPath: string,
  message: string,
) {
  const callbackUrl = createClientCallbackUrl(request, provider, nextPath);

  callbackUrl.searchParams.set("error", message);

  return Response.redirect(callbackUrl);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function normalizeGoogleProfile(value: unknown): OAuthProfile {
  if (!isRecord(value)) {
    return {};
  }

  return {
    avatarSrc: getString(value.picture),
    email: getString(value.email),
    name: getString(value.name),
  };
}

function normalizeKakaoProfile(value: unknown): OAuthProfile {
  if (!isRecord(value)) {
    return {};
  }

  const account = isRecord(value.kakao_account) ? value.kakao_account : {};
  const profile = isRecord(account.profile) ? account.profile : {};

  return {
    avatarSrc:
      getString(profile.profile_image_url) ??
      getString(profile.thumbnail_image_url),
    email: getString(account.email),
    name: getString(profile.nickname),
  };
}

function normalizeOAuthProfile(provider: OAuthProvider, value: unknown) {
  return provider === "google"
    ? normalizeGoogleProfile(value)
    : normalizeKakaoProfile(value);
}

async function exchangeOAuthCode({
  code,
  provider,
  redirectUri,
}: {
  code: string;
  provider: OAuthProvider;
  redirectUri: string;
}) {
  const config = getOAuthProviderConfig(provider);
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || (provider === "google" && !clientSecret)) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch(config.tokenUrl, {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `${getOAuthProviderLabel(provider)} 토큰 요청에 실패했습니다.`,
    );
  }

  const tokenResponse = (await response.json()) as unknown;

  if (!isRecord(tokenResponse) || typeof tokenResponse.access_token !== "string") {
    throw new Error(`${getOAuthProviderLabel(provider)} 토큰을 확인할 수 없습니다.`);
  }

  return {
    accessToken: tokenResponse.access_token,
  };
}

async function fetchOAuthProfile(provider: OAuthProvider, accessToken: string) {
  const config = getOAuthProviderConfig(provider);
  const response = await fetch(config.userInfoUrl, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `${getOAuthProviderLabel(provider)} 사용자 정보를 가져오지 못했습니다.`,
    );
  }

  return normalizeOAuthProfile(provider, await response.json());
}

export async function GET(
  request: Request,
  { params }: OAuthCallbackRouteContext,
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("error", "지원하지 않는 OAuth 제공자입니다.");
    return Response.redirect(loginUrl);
  }

  const requestUrl = new URL(request.url);
  const nextPath = getSafeAuthNextPath(requestUrl.searchParams.get("state"));
  const oauthError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");

  if (oauthError) {
    return redirectToClientError(request, provider, nextPath, oauthError);
  }

  if (!code) {
    return redirectToClientError(
      request,
      provider,
      nextPath,
      "OAuth 인증 코드가 없습니다.",
    );
  }

  try {
    const exchangedToken = await exchangeOAuthCode({
      code,
      provider,
      redirectUri: getRedirectUri(request, provider),
    });

    if (!exchangedToken) {
      const callbackUrl = createClientCallbackUrl(request, provider, nextPath);

      callbackUrl.searchParams.set("status", "dev");
      callbackUrl.searchParams.set(
        "email",
        `${provider}-${Date.now()}@artroom.local`,
      );
      callbackUrl.searchParams.set(
        "name",
        `${getOAuthProviderLabel(provider)} 사용자`,
      );

      return Response.redirect(callbackUrl);
    }

    const profile = await fetchOAuthProfile(
      provider,
      exchangedToken.accessToken,
    );
    const callbackUrl = createClientCallbackUrl(request, provider, nextPath);

    callbackUrl.searchParams.set("status", "success");

    if (profile.email) {
      callbackUrl.searchParams.set("email", profile.email);
    }

    if (profile.name) {
      callbackUrl.searchParams.set("name", profile.name);
    }

    if (profile.avatarSrc) {
      callbackUrl.searchParams.set("avatarSrc", profile.avatarSrc);
    }

    return Response.redirect(callbackUrl);
  } catch (error) {
    return redirectToClientError(
      request,
      provider,
      nextPath,
      error instanceof Error
        ? error.message
        : "OAuth 로그인 중 문제가 발생했습니다.",
    );
  }
}
