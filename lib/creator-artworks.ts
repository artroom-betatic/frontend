export type CreatorArtworkStatus = "draft" | "published";
export type CreatorArtworkSaleType = "digital" | "ebook";
export type CreatorArtworkImagePreset = "red" | "mono" | "dialogue";

export type CreatorArtwork = {
  description: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  price: string;
  saleType: CreatorArtworkSaleType;
  status: CreatorArtworkStatus;
  title: string;
};

export const CREATOR_ARTWORKS_STORAGE_KEY = "artroom:creator-artworks";
export const CREATOR_ARTWORKS_DELETED_STORAGE_KEY =
  "artroom:creator-artworks-deleted";
export const CREATOR_ARTWORKS_UPDATED_EVENT =
  "artroom:creator-artworks-updated";

export const creatorArtworkImageOptions = [
  {
    id: "red",
    imageSrc: "/figma/post-hamster-red.png",
    label: "대표 이미지 A",
  },
  {
    id: "mono",
    imageSrc: "/figma/post-hamster-mono.png",
    label: "대표 이미지 B",
  },
  {
    id: "dialogue",
    imageSrc: "/figma/post-anime-dialogue.png",
    label: "대표 이미지 C",
  },
] satisfies {
  id: CreatorArtworkImagePreset;
  imageSrc: string;
  label: string;
}[];

export const defaultCreatorArtworks: CreatorArtwork[] = [
  {
    description: "캐릭터 시트와 세계관 메모를 묶은 디지털 작품입니다.",
    id: "default-moon-knight-notes",
    imageAlt: "달빛 기사 연대기 설정 노트 대표 이미지",
    imageSrc: "/figma/post-hamster-red.png",
    price: "8900",
    saleType: "digital",
    status: "published",
    title: "달빛 기사 연대기 설정 노트",
  },
  {
    description: "멤버십 선공개 후 판매 전환을 준비 중입니다.",
    id: "default-silver-crest-draft",
    imageAlt: "은색 문장 러프 모음 대표 이미지",
    imageSrc: "/figma/post-hamster-mono.png",
    price: "",
    saleType: "digital",
    status: "draft",
    title: "은색 문장 러프 모음",
  },
];

const emptyCreatorArtworks: CreatorArtwork[] = [];
const emptyDeletedCreatorArtworkIds: string[] = [];

let cachedCreatorArtworksString: string | null = null;
let cachedStoredCreatorArtworks: CreatorArtwork[] = emptyCreatorArtworks;
let cachedCreatorArtworksSnapshot: CreatorArtwork[] = defaultCreatorArtworks;
let cachedDeletedCreatorArtworkIdsString: string | null = null;
let cachedDeletedCreatorArtworkIds: string[] = emptyDeletedCreatorArtworkIds;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeArtwork(value: unknown): CreatorArtwork | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";

  if (!title) {
    return null;
  }

  const imageSrc =
    typeof value.imageSrc === "string"
      ? value.imageSrc
      : creatorArtworkImageOptions[0].imageSrc;

  return {
    description:
      typeof value.description === "string" && value.description.trim()
        ? value.description
        : "작품 설명이 아직 입력되지 않았습니다.",
    id:
      typeof value.id === "string" && value.id
        ? value.id
        : `artwork-${Date.now()}`,
    imageAlt:
      typeof value.imageAlt === "string" && value.imageAlt
        ? value.imageAlt
        : `${title} 대표 이미지`,
    imageSrc,
    price:
      typeof value.price === "string" ? value.price.replace(/\D/g, "") : "",
    saleType: value.saleType === "ebook" ? "ebook" : "digital",
    status: value.status === "published" ? "published" : "draft",
    title,
  };
}

function normalizeDeletedCreatorArtworkIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string")),
  );
}

function readDeletedCreatorArtworkIds() {
  if (typeof window === "undefined") {
    return emptyDeletedCreatorArtworkIds;
  }

  const storedIds = window.localStorage.getItem(
    CREATOR_ARTWORKS_DELETED_STORAGE_KEY,
  );

  if (!storedIds) {
    cachedDeletedCreatorArtworkIdsString = null;
    cachedDeletedCreatorArtworkIds = emptyDeletedCreatorArtworkIds;
    return cachedDeletedCreatorArtworkIds;
  }

  if (storedIds === cachedDeletedCreatorArtworkIdsString) {
    return cachedDeletedCreatorArtworkIds;
  }

  try {
    const nextIds = normalizeDeletedCreatorArtworkIds(JSON.parse(storedIds));

    cachedDeletedCreatorArtworkIdsString = storedIds;
    cachedDeletedCreatorArtworkIds = nextIds;

    return nextIds;
  } catch {
    cachedDeletedCreatorArtworkIdsString = storedIds;
    cachedDeletedCreatorArtworkIds = emptyDeletedCreatorArtworkIds;
    return cachedDeletedCreatorArtworkIds;
  }
}

function getVisibleDefaultArtworks(deletedIds: string[]) {
  if (!deletedIds.length) {
    return defaultCreatorArtworks;
  }

  return defaultCreatorArtworks.filter(
    (artwork) => !deletedIds.includes(artwork.id),
  );
}

function syncCreatorArtworksSnapshot(storedArtworks: CreatorArtwork[]) {
  const visibleDefaultArtworks = getVisibleDefaultArtworks(
    readDeletedCreatorArtworkIds(),
  );

  cachedCreatorArtworksSnapshot = storedArtworks.length
    ? [...visibleDefaultArtworks, ...storedArtworks]
    : visibleDefaultArtworks;
}

function saveDeletedCreatorArtworkIds(ids: string[]) {
  const nextIds = normalizeDeletedCreatorArtworkIds(ids);
  const nextIdsString = JSON.stringify(nextIds);

  window.localStorage.setItem(
    CREATOR_ARTWORKS_DELETED_STORAGE_KEY,
    nextIdsString,
  );
  cachedDeletedCreatorArtworkIdsString = nextIdsString;
  cachedDeletedCreatorArtworkIds = nextIds;
  syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
  window.dispatchEvent(new CustomEvent(CREATOR_ARTWORKS_UPDATED_EVENT));
}

function readStoredCreatorArtworks(): CreatorArtwork[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedArtworks = window.localStorage.getItem(
    CREATOR_ARTWORKS_STORAGE_KEY,
  );

  if (!storedArtworks) {
    cachedCreatorArtworksString = null;
    cachedStoredCreatorArtworks = emptyCreatorArtworks;
    syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
    return cachedStoredCreatorArtworks;
  }

  if (storedArtworks === cachedCreatorArtworksString) {
    return cachedStoredCreatorArtworks;
  }

  try {
    const parsedArtworks = JSON.parse(storedArtworks);

    if (!Array.isArray(parsedArtworks)) {
      cachedCreatorArtworksString = storedArtworks;
      cachedStoredCreatorArtworks = emptyCreatorArtworks;
      syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
      return cachedStoredCreatorArtworks;
    }

    const nextArtworks = parsedArtworks
      .map(normalizeArtwork)
      .filter((artwork): artwork is CreatorArtwork => artwork !== null);

    cachedCreatorArtworksString = storedArtworks;
    cachedStoredCreatorArtworks = nextArtworks;
    syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);

    return nextArtworks;
  } catch {
    cachedCreatorArtworksString = storedArtworks;
    cachedStoredCreatorArtworks = emptyCreatorArtworks;
    syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
    return cachedStoredCreatorArtworks;
  }
}

function saveStoredCreatorArtworks(artworks: CreatorArtwork[]) {
  const nextArtworksString = JSON.stringify(artworks);

  window.localStorage.setItem(CREATOR_ARTWORKS_STORAGE_KEY, nextArtworksString);
  cachedCreatorArtworksString = nextArtworksString;
  cachedStoredCreatorArtworks = artworks;
  syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
  window.dispatchEvent(new CustomEvent(CREATOR_ARTWORKS_UPDATED_EVENT));
}

export function readCreatorArtworks() {
  if (typeof window === "undefined") {
    return defaultCreatorArtworks;
  }

  const storedArtworks = window.localStorage.getItem(
    CREATOR_ARTWORKS_STORAGE_KEY,
  );
  const storedDeletedIds = window.localStorage.getItem(
    CREATOR_ARTWORKS_DELETED_STORAGE_KEY,
  );

  if (!storedArtworks) {
    if (
      cachedCreatorArtworksString === null &&
      cachedStoredCreatorArtworks === emptyCreatorArtworks &&
      storedDeletedIds === cachedDeletedCreatorArtworkIdsString
    ) {
      return cachedCreatorArtworksSnapshot;
    }

    cachedCreatorArtworksString = null;
    cachedStoredCreatorArtworks = emptyCreatorArtworks;
    syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
    return cachedCreatorArtworksSnapshot;
  }

  if (
    storedArtworks === cachedCreatorArtworksString &&
    storedDeletedIds === cachedDeletedCreatorArtworkIdsString
  ) {
    return cachedCreatorArtworksSnapshot;
  }

  readStoredCreatorArtworks();

  if (storedDeletedIds !== cachedDeletedCreatorArtworkIdsString) {
    syncCreatorArtworksSnapshot(cachedStoredCreatorArtworks);
  }

  return cachedCreatorArtworksSnapshot;
}

export function addCreatorArtwork(artwork: CreatorArtwork) {
  saveStoredCreatorArtworks([artwork, ...readStoredCreatorArtworks()]);
}

export function removeCreatorArtwork(artworkId: string) {
  const storedArtworks = readStoredCreatorArtworks();
  const storedArtwork = storedArtworks.find((artwork) => artwork.id === artworkId);

  if (storedArtwork) {
    saveStoredCreatorArtworks(
      storedArtworks.filter((artwork) => artwork.id !== artworkId),
    );
    return;
  }

  saveDeletedCreatorArtworkIds([
    ...readDeletedCreatorArtworkIds(),
    artworkId,
  ]);
}

export function subscribeCreatorArtworksChange(callback: () => void) {
  const handleCreatorArtworksUpdated = () => {
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === CREATOR_ARTWORKS_STORAGE_KEY ||
      event.key === CREATOR_ARTWORKS_DELETED_STORAGE_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(
    CREATOR_ARTWORKS_UPDATED_EVENT,
    handleCreatorArtworksUpdated,
  );
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      CREATOR_ARTWORKS_UPDATED_EVENT,
      handleCreatorArtworksUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export function getCreatorArtworkStatusLabel(status: CreatorArtworkStatus) {
  return status === "published" ? "공개" : "초안";
}

export function getCreatorArtworkSaleTypeLabel(
  saleType: CreatorArtworkSaleType,
) {
  return saleType === "ebook" ? "Ebook" : "디지털 작품";
}

export function formatCreatorArtworkPrice(price: string) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "가격 미설정";
  }

  return `₩${numericPrice.toLocaleString("ko-KR")}`;
}
