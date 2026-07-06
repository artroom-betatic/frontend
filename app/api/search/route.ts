import { searchArtroomCatalog } from "@/lib/search-data";
import type { SearchFilterTagId, SearchTagId } from "@/lib/search-types";

const tagIds: SearchTagId[] = [
  "all",
  "fantasy",
  "commission",
  "ebook",
  "character",
  "membership",
];

const filterTagIds = tagIds.filter(
  (tagId): tagId is SearchFilterTagId => tagId !== "all",
);

function parseTags(searchParams: URLSearchParams): SearchFilterTagId[] {
  const rawTags = searchParams
    .getAll("tag")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim());

  return Array.from(
    new Set(
      rawTags.filter((value): value is SearchFilterTagId =>
        filterTagIds.includes(value as SearchFilterTagId),
      ),
    ),
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 12);

  return Response.json(
    searchArtroomCatalog({
      limit: Number.isFinite(limit) ? limit : 12,
      query: searchParams.get("q") ?? "",
      tags: parseTags(searchParams),
    }),
  );
}
