"use client";

import Image from "next/image";
import type { FormEvent, PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/action-button";
import { UiCard } from "@/components/ui-card";
import type { ArtistSocialGraph, ArtistSummary, FeedVisibility } from "@/lib/feed-types";
import {
  addLocalFeedPost,
  localFeedImageOptions,
  normalizeLocalFeedTags,
} from "@/lib/local-feed-posts";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import { setFeedCommentsClosed } from "@/lib/user-actions";

type FeedCreateClientProps = {
  allProfiles: ArtistSummary[];
  socialGraph: ArtistSocialGraph;
};

const visibilityOptions = [
  {
    description: "홈과 프로필에 공개됩니다.",
    id: "public",
    label: "공개",
  },
  {
    description: "내 화면에서만 확인하는 피드로 표시합니다.",
    id: "private",
    label: "비공개",
  },
] satisfies {
  description: string;
  id: FeedVisibility;
  label: string;
}[];

function parseTags(value: string) {
  return normalizeLocalFeedTags(
    value
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean),
  );
}

function getProfileMatch(profile: ArtistSummary, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [profile.displayName, profile.username].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function getUniqueProfiles(profiles: ArtistSummary[]) {
  return Array.from(
    new Map(profiles.map((profile) => [profile.username, profile])).values(),
  );
}

export function FeedCreateClient({
  allProfiles,
  socialGraph,
}: FeedCreateClientProps) {
  const router = useRouter();
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [commentsClosed, setCommentsClosed] = useState(false);
  const [visibility, setVisibility] = useState<FeedVisibility>("public");
  const [multiSelecting, setMultiSelecting] = useState(false);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState([0]);
  const [collaboratorQuery, setCollaboratorQuery] = useState("");
  const [collaboratorUsernames, setCollaboratorUsernames] = useState<string[]>(
    [],
  );
  const [statusMessage, setStatusMessage] = useState("");
  const tags = parseTags(tagInput);
  const collaboratorCandidates = useMemo(
    () =>
      getUniqueProfiles([
        ...socialGraph.following,
        ...socialGraph.followers,
        ...allProfiles,
      ]).filter((profile) => profile.username !== MY_PROFILE_USERNAME),
    [allProfiles, socialGraph.followers, socialGraph.following],
  );
  const selectedCollaborators = collaboratorUsernames
    .map((username) =>
      collaboratorCandidates.find((profile) => profile.username === username),
    )
    .filter((profile): profile is ArtistSummary => Boolean(profile));
  const filteredCollaborators = collaboratorCandidates
    .filter((profile) => getProfileMatch(profile, collaboratorQuery))
    .slice(0, 5);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleImageIndex = (index: number) => {
    setSelectedImageIndexes((currentIndexes) => {
      if (currentIndexes.includes(index)) {
        return currentIndexes.length > 1
          ? currentIndexes.filter((currentIndex) => currentIndex !== index)
          : currentIndexes;
      }

      return [...currentIndexes, index].sort((left, right) => left - right);
    });
  };

  const selectImageIndex = (index: number) => {
    if (multiSelecting) {
      toggleImageIndex(index);
      return;
    }

    setSelectedImageIndexes([index]);
  };

  const startImagePress = (
    event: PointerEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      setMultiSelecting(true);
      setSelectedImageIndexes((currentIndexes) =>
        currentIndexes.includes(index)
          ? currentIndexes
          : [...currentIndexes, index].sort((left, right) => left - right),
      );
      setStatusMessage("복수 선택 모드가 켜졌습니다.");
    }, 520);
  };

  const finishImagePress = () => {
    clearLongPressTimer();
  };

  const clickImage = (index: number) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    selectImageIndex(index);
  };

  const toggleCollaborator = (username: string) => {
    setCollaboratorUsernames((currentUsernames) =>
      currentUsernames.includes(username)
        ? currentUsernames.filter((currentUsername) => currentUsername !== username)
        : [...currentUsernames, username].slice(0, 6),
    );
    setStatusMessage("");
  };

  const submitFeed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setStatusMessage("피드 내용을 입력해주세요.");
      return;
    }

    const imageSlides = selectedImageIndexes.map((imageIndex, index) => {
      const option = localFeedImageOptions[imageIndex] ?? localFeedImageOptions[0];

      return {
        imageAlt: option.imageAlt,
        imageSrc: option.imageSrc,
        label:
          selectedImageIndexes.length > 1
            ? `${index + 1}번째 이미지`
            : option.label,
      };
    });
    const post = addLocalFeedPost({
      body: trimmedBody,
      collaboratorUsernames,
      commentsClosed,
      imageSlides,
      tags,
      visibility,
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
            className="mt-3 min-h-36 w-full resize-none rounded-md bg-white px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:bg-panel"
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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">이미지</p>
              <p className="mt-1 text-xs leading-5 text-subtle">
                이미지를 길게 누르면 복수 선택 모드가 켜집니다.
              </p>
            </div>
            {multiSelecting ? (
              <button
                className="shrink-0 rounded-md bg-white px-2 py-1 text-2xs font-semibold text-primary hover:bg-panel"
                onClick={() => {
                  setMultiSelecting(false);
                  setSelectedImageIndexes((currentIndexes) => [
                    currentIndexes[0] ?? 0,
                  ]);
                }}
                type="button"
              >
                단일 선택
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {localFeedImageOptions.map((option, index) => {
              const selected = selectedImageIndexes.includes(index);

              return (
                <button
                  aria-pressed={selected}
                  className={`relative aspect-square overflow-hidden rounded-md ${
                    selected ? "ring-2 ring-primary" : ""
                  }`}
                  key={option.imageSrc}
                  onClick={() => clickImage(index)}
                  onPointerCancel={finishImagePress}
                  onPointerDown={(event) => startImagePress(event, index)}
                  onPointerLeave={finishImagePress}
                  onPointerUp={finishImagePress}
                  type="button"
                >
                  <Image
                    alt={option.imageAlt}
                    className="object-cover"
                    fill
                    sizes="78px"
                    src={option.imageSrc}
                  />
                  {selected ? (
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-2xs font-bold text-white">
                      {selectedImageIndexes.indexOf(index) + 1}
                    </span>
                  ) : null}
                </button>
              );
            })}
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
            className="mt-3 h-11 w-full rounded-md bg-white px-3 text-sm text-foreground outline-none placeholder:text-muted focus:bg-panel"
            id="feed-tags"
            onChange={(event) => setTagInput(event.currentTarget.value)}
            placeholder="#드로잉 #작업일지"
            value={tagInput}
          />
          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  className="rounded-md bg-white px-2 py-1 text-2xs font-semibold text-primary hover:bg-panel"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </UiCard>

        <UiCard className="bg-white">
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="feed-collaborators"
          >
            공동작업자
          </label>
          <input
            className="mt-3 h-11 w-full rounded-md bg-white px-3 text-sm text-foreground outline-none placeholder:text-muted focus:bg-panel"
            id="feed-collaborators"
            onChange={(event) => setCollaboratorQuery(event.currentTarget.value)}
            placeholder="이름 또는 아이디 검색"
            value={collaboratorQuery}
          />

          {selectedCollaborators.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedCollaborators.map((profile) => (
                <button
                  className="rounded-md bg-white px-2 py-1 text-2xs font-semibold text-primary hover:bg-panel"
                  key={profile.username}
                  onClick={() => toggleCollaborator(profile.username)}
                  type="button"
                >
                  @{profile.username} 삭제
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-3 grid gap-1">
            {filteredCollaborators.map((profile) => {
              const selected = collaboratorUsernames.includes(profile.username);

              return (
                <button
                  aria-pressed={selected}
                  className="flex items-center justify-between gap-3 rounded-md px-1 py-2 text-left hover:bg-panel"
                  key={profile.username}
                  onClick={() => toggleCollaborator(profile.username)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {profile.displayName}
                    </span>
                    <span className="block truncate text-xs font-medium text-muted">
                      @{profile.username}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {selected ? "선택됨" : "추가"}
                  </span>
                </button>
              );
            })}
          </div>
        </UiCard>

        <UiCard className="bg-white">
          <p className="text-sm font-semibold text-foreground">공개 범위</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {visibilityOptions.map((option) => {
              const selected = visibility === option.id;

              return (
                <button
                  aria-pressed={selected}
                  className={`rounded-md px-3 py-3 text-left hover:bg-panel ${
                    selected ? "text-primary" : "text-foreground"
                  }`}
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  type="button"
                >
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-subtle">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
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
