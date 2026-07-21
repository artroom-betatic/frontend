export type OAuthProvider = "google" | "kakao";

export type OAuthProviderConfig = {
  authorizationUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  label: string;
  redirectUriEnv: string;
  scope: string;
  tokenUrl: string;
  userInfoUrl: string;
};

export const oauthProviderConfigs = {
  google: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientIdEnv: "GOOGLE_OAUTH_CLIENT_ID",
    clientSecretEnv: "GOOGLE_OAUTH_CLIENT_SECRET",
    label: "Google",
    redirectUriEnv: "GOOGLE_OAUTH_REDIRECT_URI",
    scope: "openid email profile",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  kakao: {
    authorizationUrl: "https://kauth.kakao.com/oauth/authorize",
    clientIdEnv: "KAKAO_OAUTH_CLIENT_ID",
    clientSecretEnv: "KAKAO_OAUTH_CLIENT_SECRET",
    label: "Kakao",
    redirectUriEnv: "KAKAO_OAUTH_REDIRECT_URI",
    scope: "profile_nickname profile_image account_email",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    userInfoUrl: "https://kapi.kakao.com/v2/user/me",
  },
} satisfies Record<OAuthProvider, OAuthProviderConfig>;

export const oauthProviders = Object.keys(
  oauthProviderConfigs,
) as OAuthProvider[];

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value in oauthProviderConfigs;
}

export function getOAuthProviderConfig(provider: OAuthProvider) {
  return oauthProviderConfigs[provider];
}

export function getOAuthProviderLabel(provider: OAuthProvider) {
  return oauthProviderConfigs[provider].label;
}
