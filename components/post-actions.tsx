"use client";

import { useSyncExternalStore } from "react";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import {
  defaultUserActionSnapshot,
  getFeedCommentSettings,
  getFeedPostLikeCount,
  getFeedPostCommentCount,
  isFeedPostBookmarked,
  isFeedPostLiked,
  readUserActionSnapshot,
  subscribeUserActionsChange,
  toggleFeedPostBookmark,
  toggleFeedPostLike,
} from "@/lib/user-actions";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import { PostActionIcon } from "./figma-controls";
import { ShareButton } from "./share-button";

type PostActionsProps = {
  artistUsername: string;
  comments: number;
  commentsClosedByDefault?: boolean;
  commentsAnchorId?: string;
  initialLikes: number;
  postId: string;
  shareText?: string;
  shareTitle?: string;
  shareUrl?: string;
};

export function PostActions({
  artistUsername,
  comments,
  commentsClosedByDefault = false,
  commentsAnchorId,
  initialLikes,
  postId,
  shareText,
  shareTitle,
  shareUrl,
}: PostActionsProps) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const appSettings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const bookmarked = isFeedPostBookmarked(actionSnapshot, postId);
  const liked = isFeedPostLiked(actionSnapshot, postId);
  const likeCount = getFeedPostLikeCount(actionSnapshot, postId, initialLikes);
  const commentCount = getFeedPostCommentCount(actionSnapshot, postId, comments);
  const commentSettings = getFeedCommentSettings(
    actionSnapshot,
    postId,
    commentsClosedByDefault,
  );
  const isPostOwner = artistUsername === MY_PROFILE_USERNAME;
  const showEngagementCounts =
    !isPostOwner || appSettings.engagementCountDisplay === "show";
  const canOpenComments = isPostOwner || !commentSettings.commentsClosed;

  const showComments = () => {
    if (!commentsAnchorId) {
      return;
    }

    document.getElementById(commentsAnchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex h-10 items-center">
      <div className="flex items-center gap-1">
        <PostActionIcon
          active={liked}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          aria-pressed={liked}
          kind="heart"
          onClick={() => toggleFeedPostLike(postId)}
        />
        {showEngagementCounts ? (
          <span className="text-xs font-bold text-black">{likeCount}</span>
        ) : null}
      </div>
      {canOpenComments ? (
        <div className="ml-6 flex items-center gap-1">
          <PostActionIcon
            aria-label="댓글로 이동"
            kind="message"
            onClick={showComments}
          />
          {showEngagementCounts ? (
            <span className="text-xs font-bold text-black">{commentCount}</span>
          ) : null}
        </div>
      ) : null}
      {shareUrl ? (
        <ShareButton
          className="ml-6"
          shareText={shareText}
          shareTitle={shareTitle ?? "Artroom 피드"}
          shareUrl={shareUrl}
        />
      ) : null}
      <PostActionIcon
        active={bookmarked}
        aria-label={bookmarked ? "소장함에서 제거" : "소장함에 저장"}
        aria-pressed={bookmarked}
        className="ml-auto"
        kind="bookmark"
        onClick={() => toggleFeedPostBookmark(postId)}
      />
    </div>
  );
}
