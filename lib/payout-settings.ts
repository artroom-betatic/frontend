export type PayoutSettings = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  settlementCycle: "monthly" | "twice-monthly";
  taxConfirmed: boolean;
};

export const PAYOUT_SETTINGS_STORAGE_KEY = "artroom:payout-settings";
export const PAYOUT_SETTINGS_UPDATED_EVENT = "artroom:payout-settings-updated";

export const defaultPayoutSettings: PayoutSettings = {
  accountHolder: "",
  accountNumber: "",
  bankName: "",
  settlementCycle: "monthly",
  taxConfirmed: false,
};

let cachedPayoutSettingsString: string | null = null;
let cachedPayoutSettings: PayoutSettings = defaultPayoutSettings;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePayoutSettings(value: unknown): PayoutSettings {
  if (!isRecord(value)) {
    return defaultPayoutSettings;
  }

  return {
    accountHolder:
      typeof value.accountHolder === "string" ? value.accountHolder : "",
    accountNumber:
      typeof value.accountNumber === "string"
        ? value.accountNumber.replace(/[^\d-]/g, "")
        : "",
    bankName: typeof value.bankName === "string" ? value.bankName : "",
    settlementCycle:
      value.settlementCycle === "twice-monthly" ? "twice-monthly" : "monthly",
    taxConfirmed:
      typeof value.taxConfirmed === "boolean" ? value.taxConfirmed : false,
  };
}

export function readPayoutSettings(): PayoutSettings {
  if (typeof window === "undefined") {
    return defaultPayoutSettings;
  }

  const storedSettings = window.localStorage.getItem(
    PAYOUT_SETTINGS_STORAGE_KEY,
  );

  if (!storedSettings) {
    cachedPayoutSettingsString = null;
    cachedPayoutSettings = defaultPayoutSettings;
    return defaultPayoutSettings;
  }

  if (storedSettings === cachedPayoutSettingsString) {
    return cachedPayoutSettings;
  }

  try {
    const nextSettings = normalizePayoutSettings(JSON.parse(storedSettings));

    cachedPayoutSettingsString = storedSettings;
    cachedPayoutSettings = nextSettings;

    return nextSettings;
  } catch {
    cachedPayoutSettingsString = storedSettings;
    cachedPayoutSettings = defaultPayoutSettings;
    return defaultPayoutSettings;
  }
}

export function savePayoutSettings(settings: PayoutSettings) {
  const nextSettingsString = JSON.stringify(settings);

  window.localStorage.setItem(
    PAYOUT_SETTINGS_STORAGE_KEY,
    nextSettingsString,
  );
  cachedPayoutSettingsString = nextSettingsString;
  cachedPayoutSettings = settings;
  window.dispatchEvent(new CustomEvent(PAYOUT_SETTINGS_UPDATED_EVENT));
}

export function subscribePayoutSettingsChange(callback: () => void) {
  const handleSettingsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === PAYOUT_SETTINGS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(PAYOUT_SETTINGS_UPDATED_EVENT, handleSettingsUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      PAYOUT_SETTINGS_UPDATED_EVENT,
      handleSettingsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function isPayoutSettingsReady(settings: PayoutSettings) {
  return Boolean(
    settings.accountHolder.trim() &&
      settings.bankName.trim() &&
      settings.accountNumber.trim() &&
      settings.taxConfirmed,
  );
}

export function getPayoutStatusLabel(settings: PayoutSettings) {
  return isPayoutSettingsReady(settings) ? "등록 완료" : "미등록";
}

export function getSettlementCycleLabel(
  settlementCycle: PayoutSettings["settlementCycle"],
) {
  return settlementCycle === "twice-monthly" ? "월 2회" : "월 1회";
}
