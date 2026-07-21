export const DEFAULT_AUTH_NEXT_PATH = "/my";

export function getSafeAuthNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_NEXT_PATH;
  }

  return value;
}
