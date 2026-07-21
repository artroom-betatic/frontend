export type LibraryItemType = "artwork" | "feed";

export type LibraryGroup = {
  id: string;
  itemKeys: string[];
  name: string;
};

export const LIBRARY_GROUPS_STORAGE_KEY = "artroom:library-groups";
export const LIBRARY_GROUPS_UPDATED_EVENT = "artroom:library-groups-updated";

const emptyLibraryGroups: LibraryGroup[] = [];
let cachedLibraryGroupsString: string | null = null;
let cachedLibraryGroupsSnapshot: LibraryGroup[] = emptyLibraryGroups;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeItemKeys(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function normalizeLibraryGroups(value: unknown): LibraryGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((group): LibraryGroup | null => {
      if (!isRecord(group) || typeof group.name !== "string") {
        return null;
      }

      const name = group.name.trim();

      if (!name) {
        return null;
      }

      return {
        id:
          typeof group.id === "string" && group.id
            ? group.id
            : `library-group-${Date.now()}`,
        itemKeys: normalizeItemKeys(group.itemKeys),
        name,
      };
    })
    .filter((group): group is LibraryGroup => group !== null);
}

function saveLibraryGroups(groups: LibraryGroup[]) {
  const nextGroupsString = JSON.stringify(groups);

  window.localStorage.setItem(LIBRARY_GROUPS_STORAGE_KEY, nextGroupsString);
  cachedLibraryGroupsString = nextGroupsString;
  cachedLibraryGroupsSnapshot = groups;
  window.dispatchEvent(new CustomEvent(LIBRARY_GROUPS_UPDATED_EVENT));
}

export function getLibraryItemKey(type: LibraryItemType, id: string) {
  return `${type}:${id}`;
}

export function readLibraryGroups() {
  if (typeof window === "undefined") {
    return emptyLibraryGroups;
  }

  const storedGroups = window.localStorage.getItem(LIBRARY_GROUPS_STORAGE_KEY);

  if (!storedGroups) {
    cachedLibraryGroupsString = null;
    cachedLibraryGroupsSnapshot = emptyLibraryGroups;
    return emptyLibraryGroups;
  }

  if (storedGroups === cachedLibraryGroupsString) {
    return cachedLibraryGroupsSnapshot;
  }

  try {
    const nextGroups = normalizeLibraryGroups(JSON.parse(storedGroups));

    cachedLibraryGroupsString = storedGroups;
    cachedLibraryGroupsSnapshot = nextGroups;

    return nextGroups;
  } catch {
    cachedLibraryGroupsString = storedGroups;
    cachedLibraryGroupsSnapshot = emptyLibraryGroups;
    return emptyLibraryGroups;
  }
}

export function getLibraryGroupsServerSnapshot() {
  return emptyLibraryGroups;
}

export function addLibraryGroup(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return;
  }

  saveLibraryGroups([
    {
      id: `library-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      itemKeys: [],
      name: trimmedName,
    },
    ...readLibraryGroups(),
  ]);
}

export function removeLibraryGroup(groupId: string) {
  saveLibraryGroups(
    readLibraryGroups().filter((group) => group.id !== groupId),
  );
}

export function toggleLibraryGroupItem(groupId: string, itemKey: string) {
  saveLibraryGroups(
    readLibraryGroups().map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      return {
        ...group,
        itemKeys: group.itemKeys.includes(itemKey)
          ? group.itemKeys.filter((currentItemKey) => currentItemKey !== itemKey)
          : [...group.itemKeys, itemKey],
      };
    }),
  );
}

export function subscribeLibraryGroupsChange(callback: () => void) {
  const handleLibraryGroupsUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LIBRARY_GROUPS_STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener(
    LIBRARY_GROUPS_UPDATED_EVENT,
    handleLibraryGroupsUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      LIBRARY_GROUPS_UPDATED_EVENT,
      handleLibraryGroupsUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}
