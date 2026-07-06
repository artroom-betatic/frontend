import { getFeedPage } from "@/lib/feed-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 3);

  return Response.json(
    getFeedPage({
      cursor: searchParams.get("cursor") ?? "0",
      limit: Number.isFinite(limit) ? limit : 3,
    }),
  );
}
