import type { ContentDisplayMode } from "./app-settings";

export type SearchTagId =
  | "all"
  | "fantasy"
  | "commission"
  | "ebook"
  | "character"
  | "membership";

export type SearchFilterTagId = Exclude<SearchTagId, "all">;

export type SearchTag = {
  id: SearchTagId;
  label: string;
};

export type SearchResultType = "artwork" | "commission" | "feed" | "user";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  tags: SearchFilterTagId[];
  badges: string[];
  href: string;
  imageAlt?: string;
  imageSrc?: string;
};

export type SearchRequest = {
  contentDisplay?: ContentDisplayMode;
  limit?: number;
  query?: string;
  tag?: SearchTagId;
  tags?: SearchFilterTagId[];
};

export type SearchResponse = {
  query: string;
  results: SearchResult[];
  tags: SearchTag[];
  total: number;
};
