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

export type SearchResultType = "artist" | "artwork" | "commission";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  tags: SearchFilterTagId[];
  badges: string[];
  href: string;
};

export type SearchRequest = {
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
