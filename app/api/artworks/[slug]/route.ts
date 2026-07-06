import { getArtworkDetail } from "@/lib/catalog-data";

type ArtworkRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: ArtworkRouteContext) {
  const { slug } = await params;
  const artwork = getArtworkDetail(decodeURIComponent(slug));

  if (!artwork) {
    return Response.json({ message: "작품을 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json({ artwork });
}
