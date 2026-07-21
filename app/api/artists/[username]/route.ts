import {
  getArtistPosts,
  getArtistProfile,
  getArtistSocialGraph,
} from "@/lib/feed-data";

type ArtistRouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: Request, { params }: ArtistRouteContext) {
  const { username } = await params;
  const profile = getArtistProfile(decodeURIComponent(username));

  if (!profile) {
    return Response.json({ message: "작가를 찾을 수 없습니다." }, { status: 404 });
  }

  return Response.json({
    posts: getArtistPosts(profile.username),
    profile,
    socialGraph: getArtistSocialGraph(profile.username),
  });
}
