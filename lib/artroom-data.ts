export type FeedPost = {
  artist: string;
  username: string;
  body: string;
  likes: number;
  comments: number;
  likedBy: string;
};

export type Comment = {
  author: string;
  time: string;
  body: string;
};

export type Commission = {
  title: string;
  artist: string;
  status: "검토 중" | "진행 중" | "완료" | "취소";
  due: string;
};

export type NotificationGroup = {
  label: string;
  items: {
    title: string;
    description: string;
    enabled: boolean;
  }[];
};

export const feedPost: FeedPost = {
  artist: "작가의 이름",
  username: "user_123",
  body: "직접 보트에 타서 주민의 관점으로 시야를 확인하는 것은 아주 정확한 진단 방법입니다.",
  likes: 547,
  comments: 7,
  likedBy: "user_123님 외 546명이 좋아합니다",
};

export const comments: Comment[] = [
  { author: "nori_n_sullgi", time: "4시간", body: "와 상견례라니 곧 결혼!!!" },
  { author: "inme__diary", time: "3시간", body: "아 그림체 너무 맘에 듦" },
  { author: "naronaro.i", time: "3시간", body: "sdljfkdsjflaskfjdsaffa" },
  { author: "nori_n_sullgi", time: "4시간", body: "우와ㅏㅏㅏㅏㅏㅏㅏㅏ" },
  { author: "inme__diary", time: "3시간", body: "드디어 하는구나!!!!!!!!!!!" },
];

export const commissions: Commission[] = [
  {
    title: "캐릭터 일러스트 의뢰",
    artist: "nori_n_sullgi",
    status: "진행 중",
    due: "D-5",
  },
  {
    title: "배경 작업 의뢰",
    artist: "inme__diary",
    status: "검토 중",
    due: "D-12",
  },
  {
    title: "프로필 아이콘 의뢰",
    artist: "naronaro.i",
    status: "진행 중",
    due: "D-3",
  },
  {
    title: "굿즈 디자인 의뢰",
    artist: "lechointheworld",
    status: "완료",
    due: "완료",
  },
  {
    title: "이모티콘 세트 의뢰",
    artist: "user_123",
    status: "완료",
    due: "완료",
  },
];

export const notificationGroups: NotificationGroup[] = [
  {
    label: "팔로우 알림",
    items: [
      {
        title: "새 작품 업로드",
        description: "내가 팔로우한 작가가 작품을 올릴 때",
        enabled: true,
      },
      {
        title: "작가 공지",
        description: "팔로우한 작가의 공지 및 소식",
        enabled: true,
      },
    ],
  },
  {
    label: "구매 알림",
    items: [
      {
        title: "구매 완료",
        description: "작품 구매 및 결제 처리 결과",
        enabled: true,
      },
      {
        title: "한정 판매 시작",
        description: "관심 작품의 판매 오픈 알림",
        enabled: false,
      },
    ],
  },
  {
    label: "멤버십 알림",
    items: [
      {
        title: "멤버십 갱신",
        description: "구독 갱신 및 결제 예정 안내",
        enabled: true,
      },
      {
        title: "멤버십 혜택 업데이트",
        description: "가입한 멤버십의 혜택 변경 시",
        enabled: false,
      },
    ],
  },
  {
    label: "커미션 알림",
    items: [
      {
        title: "커미션 상태 변경",
        description: "신청한 커미션의 진행 상태 업데이트",
        enabled: true,
      },
      {
        title: "커미션 완료",
        description: "작업물 납품 및 최종 완료 안내",
        enabled: true,
      },
    ],
  },
];

export const menuItems = [
  {
    href: "/commissions",
    title: "커미션 의뢰 현황",
    description: "요청, 진행 중, 완료된 커미션을 한 번에 확인",
  },
  {
    href: "/policies",
    title: "수수료/정산 정책",
    description: "작품 판매와 커미션 거래 정산 기준",
  },
  {
    href: "/notifications",
    title: "알림 설정",
    description: "팔로우, 구매, 멤버십, 커미션 알림 관리",
  },
];
