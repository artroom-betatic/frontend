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

export function getArtworkDetail(slug: string) {
  return artworkDetails.find((artwork) => artwork.slug === slug);
}

export function getCommissionOffer(slug: string) {
  return commissionOfferDetails.find((commission) => commission.slug === slug);
}

export function getArtworkSlugs() {
  return artworkDetails.map((artwork) => artwork.slug);
}

export function getCommissionOfferSlugs() {
  return commissionOfferDetails.map((commission) => commission.slug);
}

export function getCatalogSearchResults(): SearchResult[] {
  return [
    ...artworkDetails.map<SearchResult>((artwork) => ({
      badges: artwork.badges,
      description: artwork.description,
      href: artwork.href,
      id: `artwork-${artwork.slug}`,
      subtitle: artwork.subtitle,
      tags: artwork.tags,
      title: artwork.title,
      type: "artwork",
    })),
    ...commissionOfferDetails.map<SearchResult>((commission) => ({
      badges: commission.badges,
      description: commission.description,
      href: commission.href,
      id: `commission-${commission.slug}`,
      subtitle: commission.subtitle,
      tags: commission.tags,
      title: commission.title,
      type: "commission",
    })),
  ];
}
