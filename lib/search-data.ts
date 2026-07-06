import { getCatalogSearchResults } from "./catalog-data";
import { searchTags } from "./search-tags";
import type {
  SearchFilterTagId,
  SearchRequest,
  SearchResponse,
  SearchResult,
} from "./search-types";

const searchResults: SearchResult[] = [
  {
    id: "artist-nori",
    type: "artist",
    title: "nori_n_sullgi",
    subtitle: "일러스트 / 인스타툰",
    description: "판타지 세계관 일러스트와 월간 멤버십 비하인드를 운영합니다.",
    tags: ["fantasy", "membership"],
    badges: ["멤버십 운영"],
    href: "/artist/nori_n_sullgi",
  },
  {
    id: "artist-inme",
    type: "artist",
    title: "inme__diary",
    subtitle: "캐릭터 / 굿즈",
    description: "캐릭터 프로필, 굿즈용 일러스트, SD 커미션을 받습니다.",
    tags: ["character", "commission"],
    badges: ["커미션 가능"],
    href: "/artist/inme__diary",
  },
  {
    id: "artist-lecho",
    type: "artist",
    title: "lechointheworld",
    subtitle: "만화 / Ebook",
    description: "단편 만화와 설정집 Ebook을 판매하는 창작자입니다.",
    tags: ["ebook", "fantasy"],
    badges: ["디지털 작품 판매"],
    href: "/artist/lechointheworld",
  },
  ...getCatalogSearchResults(),
];

const normalize = (value: string) => value.trim().toLowerCase();

function normalizeFilterTags({ tag, tags = [] }: SearchRequest) {
  const selectedTags: SearchFilterTagId[] =
    tags.length > 0
      ? tags
      : tag && tag !== "all"
        ? [tag as SearchFilterTagId]
        : [];

  return Array.from(new Set(selectedTags));
}

export function searchArtroomCatalog({
  limit = 12,
  query = "",
  tag = "all",
  tags = [],
}: SearchRequest): SearchResponse {
  const normalizedQuery = normalize(query);
  const safeLimit = Math.max(1, Math.min(limit, 30));
  const selectedTags = normalizeFilterTags({ tag, tags });

  const results = searchResults
    .filter(
      (item) =>
        selectedTags.length === 0 ||
        selectedTags.some((selectedTag) => item.tags.includes(selectedTag)),
    )
    .filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return [item.title, item.subtitle, item.description, ...item.tags, ...item.badges]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, safeLimit);

  return {
    query,
    results,
    tags: searchTags,
    total: results.length,
  };
}
