"use client";

import { useSyncExternalStore } from "react";
import {
  defaultUserActionSnapshot,
  getFeedPostLikeCount,
  getFeedPostCommentCount,
  isFeedPostBookmarked,
  isFeedPostLiked,
  readUserActionSnapshot,
  subscribeUserActionsChange,
  toggleFeedPostBookmark,
  toggleFeedPostLike,
} from "@/lib/user-actions";
import { PostActionIcon } from "./figma-controls";

type PostActionsProps = {
  comments: number;
  commentsAnchorId?: string;
  initialLikes: number;
  postId: string;
};

export function PostActions({
  comments,
  commentsAnchorId,
  initialLikes,
  postId,
}: PostActionsProps) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const bookmarked = isFeedPostBookmarked(actionSnapshot, postId);
  const liked = isFeedPostLiked(actionSnapshot, postId);
  const likeCount = getFeedPostLikeCount(actionSnapshot, postId, initialLikes);
  const commentCount = getFeedPostCommentCount(actionSnapshot, postId, comments);

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
        <span className="text-xs font-bold text-black">{likeCount}</span>
      </div>
      <div className="ml-[25px] flex items-center gap-1">
        <PostActionIcon
          aria-label="댓글로 이동"
          kind="message"
          onClick={showComments}
        />
        <span className="text-xs font-bold text-black">{commentCount}</span>
      </div>
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
