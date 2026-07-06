import { getFeedPost } from "@/lib/feed-data";

type FeedRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: FeedRouteContext) {
  const { id } = await params;
  const post = getFeedPost(decodeURIComponent(id));

  if (!post) {
    return Response.json({ message: "피드를 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json({ post });
}
