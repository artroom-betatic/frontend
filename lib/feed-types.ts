import type { ContentDisplayMode } from "./app-settings";

export type ArtistSummary = {
  avatarSrc: string;
  displayName: string;
  href: string;
  isFollowing: boolean;
  username: string;
};

export type ArtistProfile = ArtistSummary & {
  bio: string;
  coverTitle: string;
  followersLabel: string;
  membershipLabel: string;
  stats: {
    commissions: number;
    posts: number;
    works: number;
  };
  tags: string[];
};

export type FeedPost = {
  artist: ArtistSummary;
  body: string;
  comments: number;
  commentsClosed?: boolean;
  createdAtLabel: string;
  href: string;
  id: string;
  imageAlt: string;
  imageSlides?: FeedImageSlide[];
  imageSrc: string;
  likedBy: string;
  likes: number;
  tags: string[];
};

export type FeedImageSlide = {
  imageAlt: string;
  imageSrc: string;
  label: string;
};

export type FeedPageRequest = {
  contentDisplay?: ContentDisplayMode;
  cursor?: string;
  limit?: number;
};

export type FeedPageResponse = {
  hasMore: boolean;
  items: FeedPost[];
  nextCursor: string | null;
};
