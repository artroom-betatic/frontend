import type { SearchResult } from "./search-types";

type CatalogTag = SearchResult["tags"][number];

type CatalogCreator = {
  displayName: string;
  href: string;
  username: string;
};

export type ArtworkDetail = {
  badges: string[];
  creator: CatalogCreator;
  description: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  includes: string[];
  priceLabel: string;
  slug: string;
  subtitle: string;
  tags: CatalogTag[];
  title: string;
};

export type CommissionOfferDetail = {
  badges: string[];
  creator: CatalogCreator;
  deliverables: string[];
  description: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  priceLabel: string;
  process: string[];
  slug: string;
  subtitle: string;
  tags: CatalogTag[];
  title: string;
};

export type SeriesEpisode = {
  publishedAtLabel: string;
  statusLabel: string;
  title: string;
};

export type SeriesDetail = {
  creator: CatalogCreator;
  description: string;
  episodeCountLabel: string;
  episodes: SeriesEpisode[];
  href: string;
  imageAlt: string;
  imageSrc: string;
  lastUpdatedLabel: string;
  slug: string;
  statusLabel: string;
  subtitle: string;
  tags: CatalogTag[];
  title: string;
};

const imageSrc = "/figma/home-post.png";

export const artworkDetails: ArtworkDetail[] = [
  {
    badges: ["₩8,900"],
    creator: {
      displayName: "lechointheworld",
      href: "/artist/lechointheworld",
      username: "lechointheworld",
    },
    description:
      "세계관 설정, 캐릭터 시트, 배경 러프가 포함된 판타지 Ebook 작품입니다. 구매 후 내 소장함에서 다시 볼 수 있도록 구성했습니다.",
    href: "/artworks/blue-forest",
    imageAlt: "푸른 숲의 기사 설정집 미리보기",
    imageSrc,
    includes: ["PDF 48페이지", "캐릭터 시트 PNG 6장", "배경 러프 12장"],
    priceLabel: "₩8,900",
    slug: "blue-forest",
    subtitle: "디지털 작품",
    tags: ["ebook", "fantasy", "character"],
    title: "푸른 숲의 기사 설정집",
  },
];

export const commissionOfferDetails: CommissionOfferDetail[] = [
  {
    badges: ["₩35,000부터"],
    creator: {
      displayName: "inme__diary",
      href: "/artist/inme__diary",
      username: "inme__diary",
    },
    deliverables: ["정사각형 프로필 이미지", "투명 배경 PNG", "간단한 색상 보정 1회"],
    description:
      "SNS와 멤버십 프로필에 사용할 수 있는 캐릭터 아이콘 작업입니다. 신청 후 작가가 확인하면 커미션 현황에서 진행 상태를 볼 수 있습니다.",
    href: "/commissions/profile-icon",
    imageAlt: "프로필 아이콘 커미션 샘플",
    imageSrc,
    priceLabel: "₩35,000부터",
    process: ["신청서 접수", "러프 확인", "채색 및 보정", "최종 파일 전달"],
    slug: "profile-icon",
    subtitle: "3일 이내 응답",
    tags: ["commission", "character"],
    title: "프로필 아이콘 커미션",
  },
  {
    badges: ["예약 가능"],
    creator: {
      displayName: "blue_studio",
      href: "/artist/blue_studio",
      username: "blue_studio",
    },
    deliverables: ["웹용 JPG", "고해상도 PNG", "간단한 구도 수정 1회"],
    description:
      "웹소설, TRPG, 개인 프로젝트용 판타지 배경 일러스트 의뢰입니다. 현재 슬롯이 2개 남아 있습니다.",
    href: "/commissions/fantasy-background",
    imageAlt: "판타지 배경 커미션 샘플",
    imageSrc,
    priceLabel: "₩120,000부터",
    process: ["레퍼런스 확인", "구도 러프", "명암 작업", "최종 파일 전달"],
    slug: "fantasy-background",
    subtitle: "슬롯 2개 남음",
    tags: ["commission", "fantasy"],
    title: "판타지 배경 커미션",
  },
];

export const seriesDetails: SeriesDetail[] = [
  {
    creator: {
      displayName: "작가의 이름",
      href: "/artist/user_123",
      username: "user_123",
    },
    description:
      "달빛 왕국의 기사단을 따라가는 판타지 장편 시리즈입니다. 세계관 설정과 회차별 일러스트를 함께 감상할 수 있습니다.",
    episodeCountLabel: "12화",
    episodes: [
      { publishedAtLabel: "공개됨", statusLabel: "무료", title: "1화. 달빛 숲의 입구" },
      { publishedAtLabel: "공개됨", statusLabel: "멤버십", title: "2화. 은색 문장" },
      { publishedAtLabel: "예약됨", statusLabel: "준비 중", title: "3화. 기사단의 밤" },
    ],
    href: "/series/moon-knight-chronicles",
    imageAlt: "달빛 기사 연대기 대표 이미지",
    imageSrc,
    lastUpdatedLabel: "5시간 전 업데이트",
    slug: "moon-knight-chronicles",
    statusLabel: "연재 중",
    subtitle: "판타지 장편",
    tags: ["fantasy", "character"],
    title: "달빛 기사 연대기",
  },
  {
    creator: {
      displayName: "nori_n_sullgi",
      href: "/artist/nori_n_sullgi",
      username: "nori_n_sullgi",
    },
    description:
      "작업실에서 벌어지는 짧은 에피소드를 묶은 일상툰 시리즈입니다. 멤버십 선공개와 공개 회차가 함께 운영됩니다.",
    episodeCountLabel: "24화",
    episodes: [
      { publishedAtLabel: "공개됨", statusLabel: "무료", title: "1화. 새 브러시를 산 날" },
      { publishedAtLabel: "공개됨", statusLabel: "무료", title: "2화. 마감 전날의 책상" },
      { publishedAtLabel: "선공개", statusLabel: "멤버십", title: "3화. 컬러칩 소동" },
    ],
    href: "/series/nori-studio-days",
    imageAlt: "작업실 일상툰 시리즈 대표 이미지",
    imageSrc,
    lastUpdatedLabel: "12분 전 업데이트",
    slug: "nori-studio-days",
    statusLabel: "연재 중",
    subtitle: "일상툰",
    tags: ["membership", "character"],
    title: "노리와 슬기의 작업실",
  },
  {
    creator: {
      displayName: "lechointheworld",
      href: "/artist/lechointheworld",
      username: "lechointheworld",
    },
    description:
      "푸른 숲의 기사 세계관을 회차별 설정집으로 확장한 시리즈입니다. 완결 Ebook과 연결해 볼 수 있습니다.",
    episodeCountLabel: "8화",
    episodes: [
      { publishedAtLabel: "공개됨", statusLabel: "무료", title: "1화. 숲의 지도" },
      { publishedAtLabel: "공개됨", statusLabel: "유료", title: "2화. 기사와 서기관" },
      { publishedAtLabel: "공개됨", statusLabel: "유료", title: "3화. 오래된 성벽" },
    ],
    href: "/series/blue-forest-archive",
    imageAlt: "푸른 숲의 기사 아카이브 대표 이미지",
    imageSrc,
    lastUpdatedLabel: "어제 업데이트",
    slug: "blue-forest-archive",
    statusLabel: "완결",
    subtitle: "설정집 시리즈",
    tags: ["ebook", "fantasy"],
    title: "푸른 숲의 기사 아카이브",
  },
];

export function getArtworkDetail(slug: string) {
  return artworkDetails.find((artwork) => artwork.slug === slug);
}

export function getCommissionOffer(slug: string) {
  return commissionOfferDetails.find((commission) => commission.slug === slug);
}

export function getSeriesDetail(slug: string) {
  return seriesDetails.find((series) => series.slug === slug);
}

export function getArtistSeries(username: string) {
  return seriesDetails.filter((series) => series.creator.username === username);
}

export function getArtworkSlugs() {
  return artworkDetails.map((artwork) => artwork.slug);
}

export function getCommissionOfferSlugs() {
  return commissionOfferDetails.map((commission) => commission.slug);
}

export function getSeriesSlugs() {
  return seriesDetails.map((series) => series.slug);
}

export function getCatalogSearchResults(): SearchResult[] {
  return [
    ...artworkDetails.map<SearchResult>((artwork) => ({
      badges: artwork.badges,
      description: artwork.description,
      href: artwork.href,
      id: `artwork-${artwork.slug}`,
      subtitle: `${artwork.subtitle} · @${artwork.creator.username}`,
      tags: artwork.tags,
      title: artwork.title,
      type: "artwork",
    })),
  ];
}
