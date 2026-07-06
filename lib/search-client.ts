import type { SearchRequest, SearchResponse } from "./search-types";

const searchEndpoint =
  process.env.NEXT_PUBLIC_ARTROOM_SEARCH_ENDPOINT ?? "/api/search";

export async function fetchSearchResults(
  request: SearchRequest,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  const query = request.query?.trim();

  if (query) {
    params.set("q", query);
  }
  if (request.tag && request.tag !== "all") {
    params.set("tag", request.tag);
  }
  if (request.tags?.length) {
    params.delete("tag");
    request.tags.forEach((tag) => params.append("tag", tag));
  }
  if (request.limit) {
    params.set("limit", String(request.limit));
  }

  const response = await fetch(`${searchEndpoint}?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("검색 결과를 불러오지 못했습니다.");
  }

  return response.json() as Promise<SearchResponse>;
}
