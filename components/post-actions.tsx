"use client";

import { useState } from "react";
import { PostActionIcon } from "./figma-controls";

type PostActionsProps = {
  comments: number;
  commentsAnchorId?: string;
  initialLikes: number;
};

export function PostActions({
  comments,
  commentsAnchorId,
  initialLikes,
}: PostActionsProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [reaction, setReaction] = useState({
    liked: false,
    likes: initialLikes,
  });

  const toggleLike = () => {
    setReaction((current) => ({
      liked: !current.liked,
      likes: Math.max(0, current.likes + (current.liked ? -1 : 1)),
    }));
  };

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
          active={reaction.liked}
          aria-label={reaction.liked ? "좋아요 취소" : "좋아요"}
          aria-pressed={reaction.liked}
          kind="heart"
          onClick={toggleLike}
        />
        <span className="text-xs font-bold text-black">{reaction.likes}</span>
      </div>
      <div className="ml-[25px] flex items-center gap-1">
        <PostActionIcon
          aria-label="댓글로 이동"
          kind="message"
          onClick={showComments}
        />
        <span className="text-xs font-bold text-black">{comments}</span>
      </div>
      <PostActionIcon
        active={bookmarked}
        aria-label={bookmarked ? "소장함에서 제거" : "소장함에 저장"}
        aria-pressed={bookmarked}
        className="ml-auto"
        kind="bookmark"
        onClick={() => setBookmarked((current) => !current)}
      />
    </div>
  );
}
