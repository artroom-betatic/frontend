"use client";

import { useSyncExternalStore } from "react";
import { AssetIcon } from "@/components/asset-icon";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import type { Comment } from "@/lib/artroom-data";
import {
  defaultUserActionSnapshot,
  getFeedPostCommentCount,
  getStoredFeedComments,
  readUserActionSnapshot,
  subscribeUserActionsChange,
} from "@/lib/user-actions";

type FeedCommentsSectionProps = {
  baseComments: Comment[];
  initialCommentCount: number;
  postId: string;
};

export function FeedCommentsSection({
  baseComments,
  initialCommentCount,
  postId,
}: FeedCommentsSectionProps) {
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const storedComments = getStoredFeedComments(actionSnapshot, postId);
  const commentCount = getFeedPostCommentCount(
    actionSnapshot,
    postId,
    initialCommentCount,
  );
  const commentRows = [...storedComments, ...baseComments];

  return (
    <section className="mt-2 bg-white px-4 py-5" id="feed-comments">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-black">댓글</h2>
        <span className="text-xs font-medium text-[#929aa8]">
          {commentCount}개
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {commentRows.map((comment) => {
          const commentKey = "id" in comment ? comment.id : comment.body;

          return (
            <UiCard className="bg-white" key={`${comment.author}-${commentKey}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <ProfileAvatar size={32} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-black">
                      {comment.author}
                      <span className="ml-1 font-normal text-[#929aa8]">
                        {comment.time}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-black">
                      {comment.body}
                    </p>
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
