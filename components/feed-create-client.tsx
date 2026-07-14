"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { UiCard } from "@/components/ui-card";
import {
  addLocalFeedPost,
  normalizeLocalFeedTags,
} from "@/lib/local-feed-posts";
import { setFeedCommentsClosed } from "@/lib/user-actions";

function parseTags(value: string) {
  return normalizeLocalFeedTags(
    value
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean),
  );
}

export function FeedCreateClient() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [commentsClosed, setCommentsClosed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const tags = parseTags(tagInput);

  const submitFeed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setStatusMessage("피드 내용을 입력해주세요.");
      return;
    }

    const post = addLocalFeedPost({
      body: trimmedBody,
      commentsClosed,
      tags,
    });

    setFeedCommentsClosed(post.id, commentsClosed);
    router.push(`/feed/${encodeURIComponent(post.id)}`);
  };

  return (
    <main className="px-6 pb-24 pt-5">
      <form className="grid gap-4" onSubmit={submitFeed}>
        <UiCard className="bg-white">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="feed-body"
          >
            피드 내용
          </label>
          <textarea
            className="mt-3 min-h-36 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-primary"
            id="feed-body"
            maxLength={500}
            onChange={(event) => setBody(event.currentTarget.value)}
            placeholder="새 피드 내용을 작성하세요."
            value={body}
          />
          <div className="mt-2 flex justify-end">
            <span className="text-2xs font-medium text-muted">
              {body.length}/500
            </span>
          </div>
        </UiCard>

        <UiCard className="bg-white">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="feed-tags"
          >
            태그
          </label>
          <input
            className="mt-3 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
            id="feed-tags"
            onChange={(event) => setTagInput(event.currentTarget.value)}
            placeholder="#드로잉 #작업일지"
            value={tagInput}
          />
          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  className="rounded-md bg-panel px-2 py-1 text-2xs font-semibold text-primary"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </UiCard>

        <UiCard className="bg-white">
          <label className="flex items-center justify-between gap-4">
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                댓글 막기
              </span>
              <span className="mt-1 block text-xs leading-5 text-subtle">
                게시 후 이 피드에는 댓글창이 열리지 않습니다.
              </span>
            </span>
            <input
              checked={commentsClosed}
              className="h-5 w-5 accent-primary"
              onChange={(event) => setCommentsClosed(event.currentTarget.checked)}
              type="checkbox"
            />
          </label>
        </UiCard>

        <ActionButton
          className="min-h-11 w-full text-sm font-semibold"
          disabled={!body.trim()}
          type="submit"
        >
          피드 올리기
        </ActionButton>
      </form>

      {statusMessage ? (
        <p className="mt-3 text-xs font-medium text-primary" role="status">
          {statusMessage}
        </p>
      ) : null}
    </main>
  );
}
