import type {
  ArtistProfile,
  ArtistSummary,
  FeedPageRequest,
  FeedPageResponse,
  FeedPost,
} from "./feed-types";

const avatarSrc = "/figma/profile.png";
const postImageSrc = "/figma/home-post.png";

const artistHref = (username: string) => `/artist/${encodeURIComponent(username)}`;
const feedHref = (id: string) => `/feed/${encodeURIComponent(id)}`;
const createImageSlides = (imageAlt: string) => [
  { imageAlt, imageSrc: postImageSrc, label: "완성본" },
  {
    imageAlt: `${imageAlt} 작업 과정`,
    imageSrc: postImageSrc,
    label: "작업 과정",
  },
];

const artists: ArtistProfile[] = [
  {
    avatarSrc,
    bio: "감정선이 살아있는 캐릭터 일러스트와 판타지 세계관 작업을 올립니다.",
    coverTitle: "판타지 일러스트 / 멤버십 운영",
    displayName: "작가의 이름",
    followersLabel: "팔로워 12.4K",
    href: artistHref("user_123"),
    isFollowing: true,
    membershipLabel: "프리미엄 멤버십",
    stats: { commissions: 8, posts: 128, works: 24 },
    tags: ["#판타지", "#캐릭터", "#멤버십"],
    username: "user_123",
  },
  {
    avatarSrc,
    bio: "일상툰과 따뜻한 색감의 창작 캐릭터를 연재합니다.",
    coverTitle: "인스타툰 / 창작 캐릭터",
    displayName: "nori_n_sullgi",
    followersLabel: "팔로워 8.7K",
    href: artistHref("nori_n_sullgi"),
    isFollowing: true,
    membershipLabel: "월간 후원",
    stats: { commissions: 3, posts: 94, works: 17 },
    tags: ["#인스타툰", "#일러스트", "#후원"],
    username: "nori_n_sullgi",
  },
  {
    avatarSrc,
    bio: "SNS 프로필, 굿즈, SD 캐릭터 커미션을 중심으로 작업합니다.",
    coverTitle: "커미션 가능 / 굿즈 제작",
    displayName: "inme__diary",
    followersLabel: "팔로워 5.1K",
    href: artistHref("inme__diary"),
    isFollowing: false,
    membershipLabel: "커미션 슬롯 오픈",
    stats: { commissions: 16, posts: 76, works: 12 },
    tags: ["#커미션", "#굿즈", "#캐릭터"],
    username: "inme__diary",
  },
  {
    avatarSrc,
    bio: "단편 만화와 설정집 Ebook을 판매하는 작가입니다.",
    coverTitle: "Ebook / 단편 만화",
    displayName: "lechointheworld",
    followersLabel: "팔로워 10.2K",
    href: artistHref("lechointheworld"),
    isFollowing: false,
    membershipLabel: "디지털 작품 판매",
    stats: { commissions: 2, posts: 142, works: 31 },
    tags: ["#Ebook", "#만화", "#세계관"],
    username: "lechointheworld",
  },
  {
    avatarSrc,
    bio: "러프 스케치와 빠른 아이디어 드로잉을 자주 공유합니다.",
    coverTitle: "러프 스케치 / 드로잉",
    displayName: "naronaro.i",
    followersLabel: "팔로워 3.8K",
    href: artistHref("naronaro.i"),
    isFollowing: true,
    membershipLabel: "스케치 멤버십",
    stats: { commissions: 5, posts: 63, works: 9 },
    tags: ["#드로잉", "#러프", "#스케치"],
    username: "naronaro.i",
  },
  {
    avatarSrc,
    bio: "푸른 색감과 배경 일러스트를 중심으로 작업하는 스튜디오입니다.",
    coverTitle: "배경 일러스트 / 판타지",
    displayName: "blue_studio",
    followersLabel: "팔로워 6.6K",
    href: artistHref("blue_studio"),
    isFollowing: false,
    membershipLabel: "배경 커미션",
    stats: { commissions: 11, posts: 88, works: 19 },
    tags: ["#배경", "#판타지", "#커미션"],
    username: "blue_studio",
  },
];

const artistByUsername = new Map(artists.map((artist) => [artist.username, artist]));

const summary = (username: string): ArtistSummary => {
  const artist = artistByUsername.get(username);

  if (!artist) {
    throw new Error(`Unknown artist: ${username}`);
  }

  return {
    avatarSrc: artist.avatarSrc,
    displayName: artist.displayName,
    href: artist.href,
    isFollowing: artist.isFollowing,
    username: artist.username,
  };
};

const feedPosts: FeedPost[] = [
  {
    artist: summary("user_123"),
    body: "직접 보트에 타서 주민의 관점으로 시야를 확인하는 것은 아주 정확한 진단 방법입니다.",
    comments: 7,
    createdAtLabel: "방금",
    href: feedHref("feed-001"),
    id: "feed-001",
    imageAlt: "작가의 판타지 일러스트 게시물",
    imageSrc: postImageSrc,
    likedBy: "user_123님 외 546명이 좋아합니다",
    likes: 547,
  },
  {
    artist: summary("nori_n_sullgi"),
    body: "이번 달 멤버십에는 러프 스케치 12장과 컬러 팔레트 메모를 같이 올렸어요.",
    comments: 18,
    createdAtLabel: "12분 전",
    href: feedHref("feed-002"),
    id: "feed-002",
    imageAlt: "따뜻한 색감의 인스타툰 일러스트",
    imageSrc: postImageSrc,
    likedBy: "inme__diary님 외 312명이 좋아합니다",
    likes: 313,
  },
  {
    artist: summary("inme__diary"),
    body: "프로필 아이콘 커미션 슬롯 3개 오픈했습니다. 신청 양식은 프로필에서 확인해주세요.",
    comments: 24,
    createdAtLabel: "38분 전",
    href: feedHref("feed-003"),
    id: "feed-003",
    imageAlt: "캐릭터 프로필 커미션 샘플",
    imageSrc: postImageSrc,
    likedBy: "naronaro.i님 외 221명이 좋아합니다",
    likes: 222,
  },
  {
    artist: summary("lechointheworld"),
    body: "신작 Ebook 미리보기 6페이지를 공개했습니다. 세계관 설정표도 같이 포함되어 있어요.",
    comments: 11,
    createdAtLabel: "1시간 전",
    href: feedHref("feed-004"),
    id: "feed-004",
    imageAlt: "디지털 작품 Ebook 미리보기",
    imageSrc: postImageSrc,
    likedBy: "blue_studio님 외 476명이 좋아합니다",
    likes: 477,
  },
  {
    artist: summary("naronaro.i"),
    body: "오늘의 빠른 러프. 선 정리 전의 느낌이 더 좋아서 기록으로 남겨둡니다.",
    comments: 6,
    createdAtLabel: "2시간 전",
    href: feedHref("feed-005"),
    id: "feed-005",
    imageAlt: "빠른 러프 드로잉 게시물",
    imageSrc: postImageSrc,
    likedBy: "user_123님 외 164명이 좋아합니다",
    likes: 165,
  },
  {
    artist: summary("blue_studio"),
    body: "배경 커미션 진행 과정입니다. 명암을 잡기 전에 큰 덩어리부터 정리하는 편이에요.",
    comments: 15,
    createdAtLabel: "3시간 전",
    href: feedHref("feed-006"),
    id: "feed-006",
    imageAlt: "판타지 배경 일러스트 진행 과정",
    imageSrc: postImageSrc,
    likedBy: "lechointheworld님 외 389명이 좋아합니다",
    likes: 390,
  },
  {
    artist: summary("user_123"),
    body: "멤버십 전용 컬러 튜토리얼을 준비 중입니다. 이번에는 피부 톤 보정부터 다뤄볼게요.",
    comments: 9,
    createdAtLabel: "5시간 전",
    href: feedHref("feed-007"),
    id: "feed-007",
    imageAlt: "컬러 튜토리얼 예고 이미지",
    imageSrc: postImageSrc,
    likedBy: "nori_n_sullgi님 외 295명이 좋아합니다",
    likes: 296,
  },
  {
    artist: summary("inme__diary"),
    body: "굿즈 제작용 파일은 선명한 외곽선이 중요해서 마지막에 한 번 더 점검합니다.",
    comments: 13,
    createdAtLabel: "어제",
    href: feedHref("feed-008"),
    id: "feed-008",
    imageAlt: "굿즈 제작용 캐릭터 일러스트",
    imageSrc: postImageSrc,
    likedBy: "naronaro.i님 외 188명이 좋아합니다",
    likes: 189,
  },
  {
    artist: summary("lechointheworld"),
    body: "다음 단편은 장면 전환을 더 과감하게 써보려고 콘티를 다시 짜는 중입니다.",
    comments: 5,
    createdAtLabel: "어제",
    href: feedHref("feed-009"),
    id: "feed-009",
    imageAlt: "단편 만화 콘티 미리보기",
    imageSrc: postImageSrc,
    likedBy: "blue_studio님 외 254명이 좋아합니다",
    likes: 255,
  },
].map((post) => ({
  ...post,
  imageSlides: createImageSlides(post.imageAlt),
}));

export function getFeedPage({
  cursor = "0",
  limit = 3,
}: FeedPageRequest): FeedPageResponse {
  const start = Math.max(0, Number.parseInt(cursor, 10) || 0);
  const safeLimit = Math.max(1, Math.min(limit, 10));
  const items = feedPosts.slice(start, start + safeLimit);
  const nextIndex = start + items.length;
  const hasMore = nextIndex < feedPosts.length;

  return {
    hasMore,
    items,
    nextCursor: hasMore ? String(nextIndex) : null,
  };
}

export function getArtistProfile(username: string) {
  return artistByUsername.get(username);
}

export function getArtistProfiles() {
  return artists;
}

export function getArtistPosts(username: string, limit?: number) {
  const artistPosts = feedPosts.filter((post) => post.artist.username === username);

  if (typeof limit !== "number") {
    return artistPosts;
  }

  return artistPosts.slice(0, Math.max(0, limit));
}

export function getFeedPost(id: string) {
  return feedPosts.find((post) => post.id === id);
}

export function getFeedPosts() {
  return feedPosts;
}
