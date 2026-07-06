import type { FeedPageRequest, FeedPageResponse } from "./feed-types";

const feedEndpoint = process.env.NEXT_PUBLIC_ARTROOM_FEED_ENDPOINT ?? "/api/feed";

export async function fetchFeedPage(
  request: FeedPageRequest,
  signal?: AbortSignal,
): Promise<FeedPageResponse> {
  const params = new URLSearchParams();

  if (request.cursor) {
    params.set("cursor", request.cursor);
  }
  if (request.limit) {
    params.set("limit", String(request.limit));
  }

  const query = params.toString();
  const separator = feedEndpoint.includes("?") ? "&" : "?";
  const url = query ? `${feedEndpoint}${separator}${query}` : feedEndpoint;
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("피드를 불러오지 못했습니다.");
  }

  return response.json() as Promise<FeedPageResponse>;
}
