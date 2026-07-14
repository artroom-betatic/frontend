import { getCatalogSearchResults } from "./catalog-data";
import { sortSearchResultsByContentDisplay } from "./app-settings";
import { getArtistProfiles, getFeedPosts } from "./feed-data";
import { searchTags } from "./search-tags";
import type {
  SearchFilterTagId,
  SearchRequest,
  SearchResponse,
  SearchResult,
} from "./search-types";

function feedTags(text: string): SearchFilterTagId[] {
  const tags: SearchFilterTagId[] = [];

  if (/커미션|슬롯|신청/.test(text)) {
    tags.push("commission");
  }
  if (/Ebook|단편|만화|작품/.test(text)) {
    tags.push("ebook");
  }
  if (/멤버십|후원/.test(text)) {
    tags.push("membership");
  }
  if (/캐릭터|굿즈|프로필/.test(text)) {
    tags.push("character");
  }
  if (/판타지|배경|세계관/.test(text)) {
    tags.push("fantasy");
  }

  return Array.from(new Set(tags));
}

const searchResults: SearchResult[] = [
  ...getArtistProfiles().map<SearchResult>((profile) => ({
    badges: [profile.membershipLabel, ...profile.tags],
    description: profile.bio,
    href: profile.href,
    id: `user-${profile.username}`,
    subtitle: profile.coverTitle,
    tags: Array.from(
      new Set(
        profile.tags
          .map((tag) => tag.replace("#", "").toLowerCase())
          .flatMap((tag): SearchFilterTagId[] => {
            if (tag === "커미션") {
              return ["commission"];
            }
            if (tag === "ebook") {
              return ["ebook"];
            }
            if (tag === "캐릭터") {
              return ["character"];
            }
            if (tag === "멤버십" || tag === "후원") {
              return ["membership"];
            }
            if (tag === "판타지" || tag === "배경") {
              return ["fantasy"];
            }
            return [];
          }),
      ),
    ),
    title: profile.displayName,
    type: "user",
  })),
  ...getCatalogSearchResults(),
  ...getFeedPosts().map<SearchResult>((post) => ({
    badges: [post.createdAtLabel, ...post.tags],
    description: post.body,
    href: post.href,
    id: `feed-${post.id}`,
    imageAlt: post.imageAlt,
    imageSrc: post.imageSrc,
    subtitle: `@${post.artist.username}`,
    tags: feedTags(`${post.body} ${post.imageAlt} ${post.tags.join(" ")}`),
    title: post.artist.displayName,
    type: "feed",
  })),
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
  contentDisplay = "balanced",
  limit = 12,
  query = "",
  tag = "all",
  tags = [],
}: SearchRequest): SearchResponse {
  const normalizedQuery = normalize(query);
  const safeLimit = Math.max(1, Math.min(limit, 30));
  const selectedTags = normalizeFilterTags({ tag, tags });

  const filteredResults = searchResults
    .filter(
      (item) =>
        selectedTags.length === 0 ||
        selectedTags.some((selectedTag) => item.tags.includes(selectedTag)),
    )
    .filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        item.title,
        item.subtitle,
        item.description,
        ...item.tags,
        ...item.badges,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  const results = sortSearchResultsByContentDisplay(
    filteredResults,
    contentDisplay,
  ).slice(0, safeLimit);

  return {
    query,
    results,
    tags: searchTags,
    total: results.length,
  };
}
