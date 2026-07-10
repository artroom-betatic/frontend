export type JoinedMembership = {
  artistDisplayName: string;
  artistHref: string;
  artistUsername: string;
  benefits: string[];
  description: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  nextBillingLabel: string;
  priceLabel: string;
  slug: string;
  statusLabel: string;
  tierName: string;
};

export const joinedMemberships: JoinedMembership[] = [
  {
    artistDisplayName: "작가의 이름",
    artistHref: "/artist/user_123",
    artistUsername: "user_123",
    benefits: ["고화질 작업 과정", "월간 컬러 튜토리얼", "커미션 우선 신청"],
    description:
      "판타지 캐릭터 일러스트의 러프, 컬러링 과정, 멤버십 전용 튜토리얼을 볼 수 있습니다.",
    href: "/membership/user-123-premium",
    imageAlt: "판타지 일러스트 멤버십 대표 이미지",
    imageSrc: "/figma/post-hamster-red.png",
    nextBillingLabel: "2026년 7월 15일",
    priceLabel: "월 ₩14,900",
    slug: "user-123-premium",
    statusLabel: "이용 중",
    tierName: "프리미엄 플러스",
  },
  {
    artistDisplayName: "nori_n_sullgi",
    artistHref: "/artist/nori_n_sullgi",
    artistUsername: "nori_n_sullgi",
    benefits: ["멤버십 선공개 회차", "러프 스케치 모음", "컬러 팔레트 메모"],
    description:
      "일상툰 선공개와 작업실 메모, 짧은 러프 스케치를 묶어서 받아볼 수 있습니다.",
    href: "/membership/nori-studio-support",
    imageAlt: "일상툰 멤버십 대표 이미지",
    imageSrc: "/figma/post-anime-dialogue.png",
    nextBillingLabel: "2026년 7월 21일",
    priceLabel: "월 ₩7,900",
    slug: "nori-studio-support",
    statusLabel: "이용 중",
    tierName: "월간 작업실 후원",
  },
];

export function getJoinedMembership(slug: string) {
  return joinedMemberships.find((membership) => membership.slug === slug);
}

export function getJoinedMembershipSlugs() {
  return joinedMemberships.map((membership) => membership.slug);
}
