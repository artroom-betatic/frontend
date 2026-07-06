import {
  getArtworkDetail,
  getCommissionOffer,
  type ArtworkDetail,
  type CommissionOfferDetail,
} from "./catalog-data";
import { getArtistPosts, getArtistProfile, getFeedPost } from "./feed-data";
import type { ArtistProfile, FeedPost } from "./feed-types";

type ArtistResource = {
  posts: FeedPost[];
  profile: ArtistProfile;
};

const apiBaseUrl = process.env.ARTROOM_API_BASE_URL?.replace(/\/$/, "");

async function fetchApiResource<T>(path: string): Promise<T | null> {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getFeedPostResource(id: string) {
  const remote = await fetchApiResource<{ post: FeedPost }>(
    `/api/feed/${encodeURIComponent(id)}`,
  );

  return remote?.post ?? getFeedPost(id) ?? null;
}

export async function getArtistResource(username: string): Promise<ArtistResource | null> {
  const remote = await fetchApiResource<ArtistResource>(
    `/api/artists/${encodeURIComponent(username)}`,
  );

  if (remote) {
    return remote;
  }

  const profile = getArtistProfile(username);

  if (!profile) {
    return null;
  }

  return {
    posts: getArtistPosts(profile.username),
    profile,
  };
}

export async function getArtworkResource(
  slug: string,
): Promise<ArtworkDetail | null> {
  const remote = await fetchApiResource<{ artwork: ArtworkDetail }>(
    `/api/artworks/${encodeURIComponent(slug)}`,
  );

  return remote?.artwork ?? getArtworkDetail(slug) ?? null;
}

export async function getCommissionOfferResource(
  slug: string,
): Promise<CommissionOfferDetail | null> {
  const remote = await fetchApiResource<{ commission: CommissionOfferDetail }>(
    `/api/commissions/${encodeURIComponent(slug)}`,
  );

  return remote?.commission ?? getCommissionOffer(slug) ?? null;
}
