import type { NotificationGroup } from "./artroom-data";

export const NOTIFICATION_SETTINGS_STORAGE_KEY =
  "artroom:notification-settings";
export const NOTIFICATION_SETTINGS_UPDATED_EVENT =
  "artroom:notification-settings-updated";

let cachedNotificationSettingsString: string | null = null;
let cachedNotificationFallbackGroups: NotificationGroup[] | null = null;
let cachedNotificationGroups: NotificationGroup[] | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readStoredNotificationGroups(
  fallbackGroups: NotificationGroup[],
): NotificationGroup[] {
  if (typeof window === "undefined") {
    return fallbackGroups;
  }

  const storedSettings = window.localStorage.getItem(
    NOTIFICATION_SETTINGS_STORAGE_KEY,
  );

  if (!storedSettings) {
    cachedNotificationSettingsString = null;
    cachedNotificationFallbackGroups = fallbackGroups;
    cachedNotificationGroups = fallbackGroups;
    return fallbackGroups;
  }

  if (
    storedSettings === cachedNotificationSettingsString &&
    fallbackGroups === cachedNotificationFallbackGroups &&
    cachedNotificationGroups
  ) {
    return cachedNotificationGroups;
  }

  try {
    const parsedSettings = JSON.parse(storedSettings);

    if (!Array.isArray(parsedSettings)) {
      cachedNotificationSettingsString = storedSettings;
      cachedNotificationFallbackGroups = fallbackGroups;
      cachedNotificationGroups = fallbackGroups;
      return fallbackGroups;
    }

    const nextGroups = fallbackGroups.map((fallbackGroup) => {
      const storedGroup = parsedSettings.find(
        (group) => isRecord(group) && group.label === fallbackGroup.label,
      );

      if (!isRecord(storedGroup) || !Array.isArray(storedGroup.items)) {
        return fallbackGroup;
      }

      const storedItems = storedGroup.items;

      return {
        ...fallbackGroup,
        items: fallbackGroup.items.map((fallbackItem) => {
          const storedItem = storedItems.find(
            (item) => isRecord(item) && item.title === fallbackItem.title,
          );

          return {
            ...fallbackItem,
            enabled: isRecord(storedItem)
              ? typeof storedItem.enabled === "boolean"
                ? storedItem.enabled
                : fallbackItem.enabled
              : fallbackItem.enabled,
          };
        }),
      };
    });

    cachedNotificationSettingsString = storedSettings;
    cachedNotificationFallbackGroups = fallbackGroups;
    cachedNotificationGroups = nextGroups;

    return nextGroups;
  } catch {
    cachedNotificationSettingsString = storedSettings;
    cachedNotificationFallbackGroups = fallbackGroups;
    cachedNotificationGroups = fallbackGroups;
    return fallbackGroups;
  }
}

export function saveStoredNotificationGroups(groups: NotificationGroup[]) {
  window.localStorage.setItem(
    NOTIFICATION_SETTINGS_STORAGE_KEY,
    JSON.stringify(
      groups.map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          enabled: item.enabled,
          title: item.title,
        })),
      })),
    ),
  );
  window.dispatchEvent(new CustomEvent(NOTIFICATION_SETTINGS_UPDATED_EVENT));
}

export function subscribeNotificationSettingsChange(callback: () => void) {
  const handleSettingsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === NOTIFICATION_SETTINGS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(
    NOTIFICATION_SETTINGS_UPDATED_EVENT,
    handleSettingsUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      NOTIFICATION_SETTINGS_UPDATED_EVENT,
      handleSettingsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}
