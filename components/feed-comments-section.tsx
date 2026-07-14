"use client";

import { useSyncExternalStore } from "react";
import { AssetIcon } from "@/components/asset-icon";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import type { Comment } from "@/lib/artroom-data";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import {
  defaultUserActionSnapshot,
  getFeedCommentKey,
  getFeedCommentPinnedIndex,
  getFeedCommentSettings,
  getFeedPostCommentCount,
  getStoredFeedComments,
  isFeedCommentPinned,
  readUserActionSnapshot,
  subscribeUserActionsChange,
  togglePinnedFeedComment,
} from "@/lib/user-actions";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";

type FeedCommentsSectionProps = {
  artistUsername: string;
  baseComments: Comment[];
  commentsClosedByDefault?: boolean;
  initialCommentCount: number;
  postId: string;
};

export function FeedCommentsSection({
  artistUsername,
  baseComments,
  commentsClosedByDefault = false,
  initialCommentCount,
  postId,
}: FeedCommentsSectionProps) {
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
  const commentSettings = getFeedCommentSettings(
    actionSnapshot,
    postId,
    commentsClosedByDefault,
  );
  const storedComments = getStoredFeedComments(actionSnapshot, postId);
  const commentCount = getFeedPostCommentCount(
    actionSnapshot,
    postId,
    initialCommentCount,
  );
  const commentRows = [...storedComments, ...baseComments]
    .map((comment, rowIndex) => {
      const commentKey = getFeedCommentKey(comment);
      const pinnedIndex = getFeedCommentPinnedIndex(
        commentSettings,
        commentKey,
      );

      return {
        ...comment,
        commentKey,
        pinned: isFeedCommentPinned(commentSettings, commentKey),
        pinnedIndex,
        rowIndex,
      };
    })
    .sort((left, right) => {
      if (left.pinned && right.pinned) {
        return left.pinnedIndex - right.pinnedIndex;
      }

      if (left.pinned || right.pinned) {
        return left.pinned ? -1 : 1;
      }

      return left.rowIndex - right.rowIndex;
    });
  const isPostOwner = artistUsername === MY_PROFILE_USERNAME;
  const showEngagementCounts =
    !isPostOwner || appSettings.engagementCountDisplay === "show";

  if (commentSettings.commentsClosed && !isPostOwner) {
    return null;
  }

  return (
    <section className="mt-2 bg-white px-4 py-5" id="feed-comments">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-black">댓글</h2>
          {commentSettings.commentsClosed ? (
            <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
              닫힘
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {showEngagementCounts ? (
            <span className="text-xs font-medium text-muted">
              {commentCount}개
            </span>
          ) : null}
          {isPostOwner && commentSettings.commentsClosed ? (
            <span className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary">
              작성 시 댓글 막힘
            </span>
          ) : null}
        </div>
      </div>
      {commentSettings.commentsClosed ? (
        <UiCard className="mt-4 bg-white">
          <p className="text-xs font-medium text-muted">
            이 피드의 댓글창이 닫혀 있습니다.
          </p>
        </UiCard>
      ) : null}
      <div className="mt-4 grid gap-3">
        {commentRows.map((comment) => {
          return (
            <UiCard
              className="bg-white"
              key={`${comment.author}-${comment.commentKey}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <ProfileAvatar size={32} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1 text-xs font-semibold text-black">
                      <span>{comment.author}</span>
                      <span className="ml-1 font-normal text-muted">
                        {comment.time}
                      </span>
                      {comment.pinned ? (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs text-primary">
                          고정됨
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black">
                      {comment.body}
                    </p>
                    {isPostOwner ? (
                      <button
                        className="mt-2 text-2xs font-semibold text-primary"
                        onClick={() =>
                          togglePinnedFeedComment(
                            postId,
                            comment.commentKey,
                            commentsClosedByDefault,
                          )
                        }
                        type="button"
                      >
                        {comment.pinned ? "고정 해제" : "댓글 고정"}
                      </button>
                    ) : null}
                  </div>
                </div>
                <AssetIcon className="h-4 w-4 shrink-0 opacity-30" name="heart-small" />
              </div>
            </UiCard>
          );
        })}
      </div>
    </section>
  );
}
