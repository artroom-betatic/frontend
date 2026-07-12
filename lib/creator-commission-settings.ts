export type CreatorCommissionSettings = {
  accepting: boolean;
  basePrice: string;
  guidance: string;
  responseTime: string;
  scope: string;
  slots: string;
};

export const CREATOR_COMMISSION_SETTINGS_STORAGE_KEY =
  "artroom:creator-commission-settings";
export const CREATOR_COMMISSION_SETTINGS_UPDATED_EVENT =
  "artroom:creator-commission-settings-updated";
export const CREATOR_COMMISSION_PUBLIC_USERNAME = "user_123";
export const CREATOR_COMMISSION_PUBLIC_DISPLAY_NAME = "작가의 이름";
export const CREATOR_COMMISSION_PUBLIC_IMAGE_ALT = "내 커미션 공개 카드 이미지";
export const CREATOR_COMMISSION_PUBLIC_IMAGE_SRC = "/figma/post-hamster-red.png";

export const defaultCreatorCommissionSettings: CreatorCommissionSettings = {
  accepting: false,
  basePrice: "",
  guidance: "신청 전 참고 이미지와 원하는 분위기를 함께 보내주세요.",
  responseTime: "3일 이내",
  scope: "캐릭터 일러스트, 프로필 아이콘, 간단한 굿즈 이미지",
  slots: "0",
};

let cachedCommissionSettingsString: string | null = null;
let cachedCommissionSettings: CreatorCommissionSettings =
  defaultCreatorCommissionSettings;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCommissionSettings(
  value: unknown,
): CreatorCommissionSettings {
  if (!isRecord(value)) {
    return defaultCreatorCommissionSettings;
  }

  return {
    accepting:
      typeof value.accepting === "boolean"
        ? value.accepting
        : defaultCreatorCommissionSettings.accepting,
    basePrice:
      typeof value.basePrice === "string"
        ? value.basePrice.replace(/\D/g, "")
        : defaultCreatorCommissionSettings.basePrice,
    guidance:
      typeof value.guidance === "string"
        ? value.guidance
        : defaultCreatorCommissionSettings.guidance,
    responseTime:
      typeof value.responseTime === "string"
        ? value.responseTime
        : defaultCreatorCommissionSettings.responseTime,
    scope:
      typeof value.scope === "string"
        ? value.scope
        : defaultCreatorCommissionSettings.scope,
    slots:
      typeof value.slots === "string"
        ? value.slots.replace(/\D/g, "")
        : defaultCreatorCommissionSettings.slots,
  };
}

export function readCreatorCommissionSettings(): CreatorCommissionSettings {
  if (typeof window === "undefined") {
    return defaultCreatorCommissionSettings;
  }

  const storedSettings = window.localStorage.getItem(
    CREATOR_COMMISSION_SETTINGS_STORAGE_KEY,
  );

  if (!storedSettings) {
    cachedCommissionSettingsString = null;
    cachedCommissionSettings = defaultCreatorCommissionSettings;
    return defaultCreatorCommissionSettings;
  }

  if (storedSettings === cachedCommissionSettingsString) {
    return cachedCommissionSettings;
  }

  try {
    const nextSettings = normalizeCommissionSettings(JSON.parse(storedSettings));

    cachedCommissionSettingsString = storedSettings;
    cachedCommissionSettings = nextSettings;

    return nextSettings;
  } catch {
    cachedCommissionSettingsString = storedSettings;
    cachedCommissionSettings = defaultCreatorCommissionSettings;
    return defaultCreatorCommissionSettings;
  }
}

export function saveCreatorCommissionSettings(
  settings: CreatorCommissionSettings,
) {
  const nextSettingsString = JSON.stringify(settings);

  window.localStorage.setItem(
    CREATOR_COMMISSION_SETTINGS_STORAGE_KEY,
    nextSettingsString,
  );
  cachedCommissionSettingsString = nextSettingsString;
  cachedCommissionSettings = settings;
  window.dispatchEvent(
    new CustomEvent(CREATOR_COMMISSION_SETTINGS_UPDATED_EVENT),
  );
}

export function subscribeCreatorCommissionSettingsChange(
  callback: () => void,
) {
  const handleSettingsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CREATOR_COMMISSION_SETTINGS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(
    CREATOR_COMMISSION_SETTINGS_UPDATED_EVENT,
    handleSettingsUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      CREATOR_COMMISSION_SETTINGS_UPDATED_EVENT,
      handleSettingsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function formatCreatorCommissionPrice(price: string) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "미설정";
  }

  return `₩${numericPrice.toLocaleString("ko-KR")}부터`;
}

export function isCreatorCommissionReady(settings: CreatorCommissionSettings) {
  return Boolean(
    settings.scope.trim() &&
      Number(settings.basePrice) > 0 &&
      settings.guidance.trim() &&
      (!settings.accepting || Number(settings.slots) > 0),
  );
}
