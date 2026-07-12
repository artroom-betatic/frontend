import { getFeedPage } from "@/lib/feed-data";
import { normalizeContentDisplayMode } from "@/lib/app-settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 3);

  return Response.json(
    getFeedPage({
      contentDisplay: normalizeContentDisplayMode(
        searchParams.get("contentDisplay"),
      ),
      cursor: searchParams.get("cursor") ?? "0",
      limit: Number.isFinite(limit) ? limit : 3,
    }),
  );
}
