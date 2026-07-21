import { getSafeAuthNextPath } from "@/lib/auth-paths";
import {
  getOAuthProviderConfig,
  getOAuthProviderLabel,
  isOAuthProvider,
} from "@/lib/oauth-providers";

type OAuthStartRouteContext = {
  params: Promise<{ provider: string }>;
};

export const dynamic = "force-dynamic";

function getOrigin(request: Request) {
  const url = new URL(request.url);

  return `${url.protocol}//${url.host}`;
}

function getRedirectUri(request: Request, provider: string) {
  const config = isOAuthProvider(provider)
    ? getOAuthProviderConfig(provider)
    : null;

  if (!config) {
    return "";
  }

  return (
    process.env[config.redirectUriEnv] ??
    `${getOrigin(request)}/api/auth/oauth/${provider}/callback`
  );
}

function redirectToLocalCallback(
  request: Request,
  provider: string,
  nextPath: string,
) {
  const callbackUrl = new URL("/auth/oauth/callback", request.url);
  const providerLabel = isOAuthProvider(provider)
    ? getOAuthProviderLabel(provider)
    : "OAuth";

  callbackUrl.searchParams.set("provider", provider);
  callbackUrl.searchParams.set("status", "dev");
  callbackUrl.searchParams.set(
    "email",
    `${provider}-${Date.now()}@artroom.local`,
  );
  callbackUrl.searchParams.set("name", `${providerLabel} 사용자`);
  callbackUrl.searchParams.set("next", nextPath);

  return Response.redirect(callbackUrl);
}

export async function GET(
  request: Request,
  { params }: OAuthStartRouteContext,
) {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("error", "지원하지 않는 OAuth 제공자입니다.");
    return Response.redirect(loginUrl);
  }

  const requestUrl = new URL(request.url);
  const nextPath = getSafeAuthNextPath(requestUrl.searchParams.get("next"));
  const config = getOAuthProviderConfig(provider);
  const clientId = process.env[config.clientIdEnv];

  if (!clientId) {
    return redirectToLocalCallback(request, provider, nextPath);
  }

  const authorizationUrl = new URL(config.authorizationUrl);

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set(
    "redirect_uri",
    getRedirectUri(request, provider),
  );
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", config.scope);
  authorizationUrl.searchParams.set("state", nextPath);

  return Response.redirect(authorizationUrl);
}
