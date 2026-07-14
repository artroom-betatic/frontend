import type { FeedPost } from "./feed-types";
import type {
  SearchFilterTagId,
  SearchResult,
  SearchResultType,
} from "./search-types";

export type AppThemeMode = "system" | "light" | "dark";
export type ResolvedThemeMode = "light" | "dark";
export type ContentDisplayMode =
  | "balanced"
  | "artwork"
  | "commission"
  | "membership";
export type EngagementCountDisplayMode = "hide" | "show";
export type AccountVisibilityMode = "private" | "public";

export type AppSettings = {
  accountVisibility: AccountVisibilityMode;
  contentDisplay: ContentDisplayMode;
  engagementCountDisplay: EngagementCountDisplayMode;
  themeMode: AppThemeMode;
};

export const APP_SETTINGS_STORAGE_KEY = "artroom:app-settings";
export const APP_SETTINGS_UPDATED_EVENT = "artroom:app-settings-updated";

export const defaultAppSettings: AppSettings = {
  accountVisibility: "public",
  contentDisplay: "balanced",
  engagementCountDisplay: "show",
  themeMode: "system",
};

const themeTokenSets = {
  dark: {
    "--background": "#0d1117",
    "--danger": "#f87171",
    "--foreground": "#f3f4f6",
    "--inactive": "#596273",
    "--line": "#303847",
    "--muted": "#a5adba",
    "--panel": "#171c24",
    "--primary": "#6ea1ff",
    "--subtle": "#c5cad3",
  },
  light: {
    "--background": "#eef0f3",
    "--danger": "#fca5a5",
    "--foreground": "#1f2937",
    "--inactive": "#d0d5dd",
    "--line": "#e5e7eb",
    "--muted": "#929aa8",
    "--panel": "#f9fafb",
    "--primary": "#307cff",
    "--subtle": "#666666",
  },
} satisfies Record<ResolvedThemeMode, Record<string, string>>;

export const themeModeOptions = [
  {
    description: "기기 설정을 따라 밝은 화면과 어두운 화면을 자동으로 바꿉니다.",
    id: "system",
    label: "시스템",
  },
  {
    description: "원래 흰색 중심의 Artroom 기본 화면으로 고정합니다.",
    id: "light",
    label: "밝게",
  },
  {
    description: "어두운 배경과 낮은 눈부심의 화면으로 고정합니다.",
    id: "dark",
    label: "어둡게",
  },
] satisfies {
  description: string;
  id: AppThemeMode;
  label: string;
}[];

export const contentDisplayOptions = [
  {
    description: "기존 추천 순서를 유지합니다.",
    id: "balanced",
    label: "기본",
  },
  {
    description: "작품, 캐릭터, 판타지, Ebook 관련 결과를 먼저 보여줍니다.",
    id: "artwork",
    label: "작품 중심",
  },
  {
    description: "커미션 모집, 슬롯, 신청 가능한 결과를 먼저 보여줍니다.",
    id: "commission",
    label: "커미션 중심",
  },
  {
    description: "멤버십, 후원, 전용 콘텐츠 관련 결과를 먼저 보여줍니다.",
    id: "membership",
    label: "멤버십 중심",
  },
] satisfies {
  description: string;
  id: ContentDisplayMode;
  label: string;
}[];

export const engagementCountDisplayOptions = [
  {
    description: "내가 올린 피드의 좋아요 수, 댓글 수를 보여줍니다.",
    id: "show",
    label: "표시",
  },
  {
    description: "내가 올린 피드에서 좋아요 수와 댓글 수 숫자를 숨깁니다.",
    id: "hide",
    label: "숨김",
  },
] satisfies {
  description: string;
  id: EngagementCountDisplayMode;
  label: string;
}[];

export const accountVisibilityOptions = [
  {
    description: "프로필과 게시물을 다른 사용자가 볼 수 있는 상태입니다.",
    id: "public",
    label: "공개",
  },
  {
    description: "프로필 접근을 제한하는 비공개 상태로 표시합니다.",
    id: "private",
    label: "비공개",
  },
] satisfies {
  description: string;
  id: AccountVisibilityMode;
  label: string;
}[];

const themeModes = new Set<AppThemeMode>(["system", "light", "dark"]);
const contentDisplayModes = new Set<ContentDisplayMode>([
  "balanced",
  "artwork",
  "commission",
  "membership",
]);
const engagementCountDisplayModes = new Set<EngagementCountDisplayMode>([
  "hide",
  "show",
]);
const accountVisibilityModes = new Set<AccountVisibilityMode>([
  "private",
  "public",
]);

const contentDisplayProfiles: Record<
  ContentDisplayMode,
  {
    keywords: string[];
    tags: SearchFilterTagId[];
    types: SearchResultType[];
  }
> = {
  artwork: {
    keywords: [
      "artwork",
      "character",
      "ebook",
      "fantasy",
      "굿즈",
      "드로잉",
      "러프",
      "만화",
      "세계관",
      "작품",
      "캐릭터",
      "판타지",
    ],
    tags: ["character", "ebook", "fantasy"],
    types: ["artwork", "feed"],
  },
  balanced: {
    keywords: [],
    tags: [],
    types: [],
  },
  commission: {
    keywords: [
      "commission",
      "slot",
      "가격",
      "모집",
      "신청",
      "슬롯",
      "커미션",
    ],
    tags: ["commission"],
    types: ["commission"],
  },
  membership: {
    keywords: [
      "membership",
      "premium",
      "tutorial",
      "구독",
      "멤버십",
      "전용",
      "튜토리얼",
      "프리미엄",
      "후원",
    ],
    tags: ["membership"],
    types: ["feed", "user"],
  },
};

let cachedAppSettingsString: string | null = null;
let cachedAppSettingsSnapshot: AppSettings = defaultAppSettings;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeAppSettings(value: unknown): AppSettings {
  if (!isRecord(value)) {
    return defaultAppSettings;
  }

  const themeMode = themeModes.has(value.themeMode as AppThemeMode)
    ? (value.themeMode as AppThemeMode)
    : defaultAppSettings.themeMode;
  const contentDisplay = contentDisplayModes.has(
    value.contentDisplay as ContentDisplayMode,
  )
    ? (value.contentDisplay as ContentDisplayMode)
    : defaultAppSettings.contentDisplay;
  const engagementCountDisplay = engagementCountDisplayModes.has(
    value.engagementCountDisplay as EngagementCountDisplayMode,
  )
    ? (value.engagementCountDisplay as EngagementCountDisplayMode)
    : defaultAppSettings.engagementCountDisplay;
  const accountVisibility = accountVisibilityModes.has(
    value.accountVisibility as AccountVisibilityMode,
  )
    ? (value.accountVisibility as AccountVisibilityMode)
    : defaultAppSettings.accountVisibility;

  return {
    accountVisibility,
    contentDisplay,
    engagementCountDisplay,
    themeMode,
  };
}

export function normalizeContentDisplayMode(
  value: string | null | undefined,
): ContentDisplayMode {
  return contentDisplayModes.has(value as ContentDisplayMode)
    ? (value as ContentDisplayMode)
    : defaultAppSettings.contentDisplay;
}

export function readAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return defaultAppSettings;
  }

  const storedSettings = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);

  if (!storedSettings) {
    cachedAppSettingsString = null;
    cachedAppSettingsSnapshot = defaultAppSettings;
    return defaultAppSettings;
  }

  if (storedSettings === cachedAppSettingsString) {
    return cachedAppSettingsSnapshot;
  }

  try {
    const nextSnapshot = normalizeAppSettings(JSON.parse(storedSettings));

    cachedAppSettingsString = storedSettings;
    cachedAppSettingsSnapshot = nextSnapshot;

    return nextSnapshot;
  } catch {
    cachedAppSettingsString = storedSettings;
    cachedAppSettingsSnapshot = defaultAppSettings;

    return defaultAppSettings;
  }
}

export function resolveThemeMode(themeMode: AppThemeMode): ResolvedThemeMode {
  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemeMode(themeMode: AppThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedThemeMode = resolveThemeMode(themeMode);
  const themeTokens = themeTokenSets[resolvedThemeMode];

  document.documentElement.dataset.theme = resolvedThemeMode;
  document.documentElement.dataset.themeMode = themeMode;
  document.documentElement.style.colorScheme = resolvedThemeMode;
  Object.entries(themeTokens).forEach(([tokenName, tokenValue]) => {
    document.documentElement.style.setProperty(tokenName, tokenValue);
  });
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  const nextSnapshot = normalizeAppSettings(settings);
  const nextSettingsString = JSON.stringify(nextSnapshot);

  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, nextSettingsString);
  cachedAppSettingsString = nextSettingsString;
  cachedAppSettingsSnapshot = nextSnapshot;
  applyThemeMode(nextSnapshot.themeMode);
  window.dispatchEvent(new CustomEvent(APP_SETTINGS_UPDATED_EVENT));
}

export function updateAppSettings(settings: Partial<AppSettings>) {
  saveAppSettings({
    ...readAppSettings(),
    ...settings,
  });
}

export function subscribeAppSettingsChange(callback: () => void) {
  const handleAppSettingsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === APP_SETTINGS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(APP_SETTINGS_UPDATED_EVENT, handleAppSettingsUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      APP_SETTINGS_UPDATED_EVENT,
      handleAppSettingsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

function getKeywordScore(keywords: string[], text: string) {
  const normalizedText = text.toLowerCase();

  return keywords.reduce(
    (score, keyword) => score + (normalizedText.includes(keyword) ? 1 : 0),
    0,
  );
}

function getSearchResultContentDisplayScore(
  result: SearchResult,
  mode: ContentDisplayMode,
) {
  const profile = contentDisplayProfiles[mode];

  if (mode === "balanced") {
    return 0;
  }

  const tagScore =
    result.tags.filter((tag) => profile.tags.includes(tag)).length * 5;
  const typeScore = profile.types.includes(result.type) ? 10 : 0;
  const keywordScore = getKeywordScore(
    profile.keywords,
    [
      result.title,
      result.subtitle,
      result.description,
      result.badges.join(" "),
      result.tags.join(" "),
    ].join(" "),
  );

  return typeScore + tagScore + keywordScore;
}

function getFeedPostContentDisplayScore(
  post: FeedPost,
  mode: ContentDisplayMode,
) {
  const profile = contentDisplayProfiles[mode];

  if (mode === "balanced") {
    return 0;
  }

  return getKeywordScore(
    profile.keywords,
    [
      post.artist.displayName,
      post.artist.username,
      post.body,
      post.imageAlt,
      post.tags.join(" "),
      post.imageSlides?.map((slide) => slide.imageAlt).join(" ") ?? "",
    ].join(" "),
  );
}

export function sortSearchResultsByContentDisplay(
  results: SearchResult[],
  mode: ContentDisplayMode,
) {
  if (mode === "balanced") {
    return results;
  }

  return results
    .map((result, index) => ({
      index,
      result,
      score: getSearchResultContentDisplayScore(result, mode),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ result }) => result);
}

export function sortFeedPostsByContentDisplay(
  posts: FeedPost[],
  mode: ContentDisplayMode,
) {
  if (mode === "balanced") {
    return posts;
  }

  return posts
    .map((post, index) => ({
      index,
      post,
      score: getFeedPostContentDisplayScore(post, mode),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ post }) => post);
}
