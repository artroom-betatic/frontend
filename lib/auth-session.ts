import type { OAuthProvider } from "./oauth-providers";
import { getOAuthProviderLabel } from "./oauth-providers";

export type AuthProvider = "email" | OAuthProvider;

export type AuthUser = {
  avatarSrc?: string;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  provider: AuthProvider;
};

type AuthAccount = AuthUser & {
  passwordHash?: string;
};

type AuthResult =
  | { message: string; ok: false }
  | { ok: true; user: AuthUser };

type EmailAuthInput = {
  email: string;
  password: string;
};

type SignupInput = EmailAuthInput & {
  name: string;
};

type OAuthSessionInput = {
  avatarSrc?: string;
  email?: string;
  name?: string;
  provider: OAuthProvider;
};

export const AUTH_ACCOUNTS_STORAGE_KEY = "artroom:auth-accounts";
export const AUTH_SESSION_STORAGE_KEY = "artroom:auth-session";
export const AUTH_SESSION_UPDATED_EVENT = "artroom:auth-session-updated";

const defaultAvatarSrc = "/figma/assets/nav-profile.png";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeName(name: string, fallback: string) {
  const trimmedName = name.trim();

  return trimmedName || fallback;
}

function createAuthId(provider: AuthProvider, email: string) {
  return `${provider}:${normalizeEmail(email)}`;
}

function hashPassword(password: string) {
  let hash = 2166136261;

  for (let index = 0; index < password.length; index += 1) {
    hash ^= password.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(36)}`;
}

function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const email = typeof value.email === "string" ? normalizeEmail(value.email) : "";
  const provider =
    value.provider === "email" ||
    value.provider === "google" ||
    value.provider === "kakao"
      ? value.provider
      : null;

  if (!email || !provider) {
    return null;
  }

  return {
    avatarSrc:
      typeof value.avatarSrc === "string" && value.avatarSrc
        ? value.avatarSrc
        : defaultAvatarSrc,
    createdAt:
      typeof value.createdAt === "string" && value.createdAt
        ? value.createdAt
        : new Date().toISOString(),
    email,
    id:
      typeof value.id === "string" && value.id
        ? value.id
        : createAuthId(provider, email),
    name: normalizeName(
      typeof value.name === "string" ? value.name : "",
      email.split("@")[0],
    ),
    provider,
  };
}

function normalizeAuthAccount(value: unknown): AuthAccount | null {
  const user = normalizeAuthUser(value);

  if (!user || !isRecord(value)) {
    return null;
  }

  return {
    ...user,
    passwordHash:
      typeof value.passwordHash === "string" ? value.passwordHash : undefined,
  };
}

function readAuthAccounts() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedAccounts = window.localStorage.getItem(AUTH_ACCOUNTS_STORAGE_KEY);

  if (!storedAccounts) {
    return [];
  }

  try {
    const parsedAccounts = JSON.parse(storedAccounts);

    if (!Array.isArray(parsedAccounts)) {
      return [];
    }

    return parsedAccounts
      .map(normalizeAuthAccount)
      .filter((account): account is AuthAccount => account !== null);
  } catch {
    return [];
  }
}

function saveAuthAccounts(accounts: AuthAccount[]) {
  window.localStorage.setItem(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function saveAuthSession(user: AuthUser) {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_UPDATED_EVENT));
}

export function readAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(storedSession));
  } catch {
    return null;
  }
}

export function subscribeAuthSessionChange(callback: () => void) {
  const handleSessionUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === AUTH_ACCOUNTS_STORAGE_KEY ||
      event.key === AUTH_SESSION_STORAGE_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);
    window.removeEventListener("storage", handleStorage);
  };
}

export function createEmailAccount({
  email,
  name,
  password,
}: SignupInput): AuthResult {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.includes("@")) {
    return { message: "이메일 형식을 확인해주세요.", ok: false };
  }

  if (password.length < 8) {
    return { message: "비밀번호는 8자 이상이어야 합니다.", ok: false };
  }

  const accounts = readAuthAccounts();
  const existingAccount = accounts.find(
    (account) => account.email === normalizedEmail && account.provider === "email",
  );

  if (existingAccount) {
    return { message: "이미 가입된 이메일입니다.", ok: false };
  }

  const user: AuthUser = {
    avatarSrc: defaultAvatarSrc,
    createdAt: new Date().toISOString(),
    email: normalizedEmail,
    id: createAuthId("email", normalizedEmail),
    name: normalizeName(name, normalizedEmail.split("@")[0]),
    provider: "email",
  };
  const account = {
    ...user,
    passwordHash: hashPassword(password),
  };

  saveAuthAccounts([account, ...accounts]);
  saveAuthSession(user);

  return { ok: true, user };
}

export function signInWithEmail({ email, password }: EmailAuthInput): AuthResult {
  const normalizedEmail = normalizeEmail(email);
  const account = readAuthAccounts().find(
    (currentAccount) =>
      currentAccount.email === normalizedEmail &&
      currentAccount.provider === "email",
  );

  if (!account || account.passwordHash !== hashPassword(password)) {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다.", ok: false };
  }

  saveAuthSession(account);

  return { ok: true, user: account };
}

export function signInWithOAuth({
  avatarSrc,
  email,
  name,
  provider,
}: OAuthSessionInput): AuthResult {
  const providerLabel = getOAuthProviderLabel(provider);
  const normalizedEmail = normalizeEmail(
    email || `${provider}-${Date.now()}@artroom.local`,
  );
  const accounts = readAuthAccounts();
  const existingAccount = accounts.find(
    (account) =>
      account.email === normalizedEmail && account.provider === provider,
  );
  const user: AuthUser = {
    avatarSrc: avatarSrc || defaultAvatarSrc,
    createdAt: existingAccount?.createdAt ?? new Date().toISOString(),
    email: normalizedEmail,
    id: existingAccount?.id ?? createAuthId(provider, normalizedEmail),
    name: normalizeName(name || "", `${providerLabel} 사용자`),
    provider,
  };
  const nextAccounts = existingAccount
    ? accounts.map((account) =>
        account.id === existingAccount.id ? { ...account, ...user } : account,
      )
    : [user, ...accounts];

  saveAuthAccounts(nextAccounts);
  saveAuthSession(user);

  return { ok: true, user };
}

export function signOutAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_UPDATED_EVENT));
}
