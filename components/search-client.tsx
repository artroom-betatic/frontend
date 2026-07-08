"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FigmaInput, FigmaTag } from "@/components/figma-controls";
import { ProfileAvatar } from "@/components/profile-avatar";
import { UiCard } from "@/components/ui-card";
import { fetchSearchResults } from "@/lib/search-client";
import { searchTags } from "@/lib/search-tags";
import type {
  SearchFilterTagId,
  SearchResponse,
  SearchResult,
  SearchResultType,
  SearchTagId,
} from "@/lib/search-types";

type SearchStatus = "error" | "loading" | "ready";
type SearchResultTabId = "all" | SearchResultType;

const resultTabs = [
  { id: "all", label: "전체" },
  { id: "user", label: "유저" },
  { id: "artwork", label: "작품" },
  { id: "feed", label: "피드" },
] satisfies { id: SearchResultTabId; label: string }[];

function normalizeTag(value: string | null): SearchTagId {
  const tag = searchTags.find((item) => item.id === value);
  return tag?.id ?? "all";
}

function normalizeSelectedTags(values: string[]): SearchFilterTagId[] {
  const filterTags = values
    .map((value) => normalizeTag(value))
    .filter((tag): tag is SearchFilterTagId => tag !== "all");

  return Array.from(new Set(filterTags));
}

function normalizeResultTab(value: string | null): SearchResultTabId {
  return resultTabs.find((tab) => tab.id === value)?.id ?? "all";
}

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const destinationLabel = {
    artwork: "작품 보기",
    feed: "피드 보기",
    user: "프로필 보기",
  }[result.type];

  return (
    <Link aria-label={`${result.title} ${destinationLabel}`} href={result.href}>
      <UiCard>
        <div className="flex items-start gap-3">
          <ProfileAvatar size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="min-w-0 truncate text-sm font-semibold">
                {result.title}
              </p>
              {result.badges.length ? (
                <div className="flex shrink-0 flex-wrap gap-[6px]">
                  {result.badges.map((badge) => (
                    <span
                      className="rounded-[5px] bg-white px-2 py-1 text-[10px] font-medium text-[#929aa8]"
                      key={badge}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-[#929aa8]">{result.subtitle}</p>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#1f2937]">
              {result.description}
            </p>
            <span className="mt-3 inline-flex text-xs font-semibold text-primary">
              {destinationLabel}
            </span>
          </div>
        </div>
      </UiCard>
    </Link>
  );
}

function SearchFeedResultCard({ result }: { result: SearchResult }) {
  return (
    <Link aria-label={`${result.title} 피드 보기`} href={result.href}>
      <UiCard className="overflow-hidden bg-white p-0">
        <div className="flex items-center gap-3 px-3 py-3">
          <ProfileAvatar size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">
              {result.title}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-[#929aa8]">
              {result.subtitle} · {result.badges[0]}
            </p>
          </div>
        </div>

        {result.imageSrc ? (
          <div className="relative h-40 w-full bg-panel">
            <Image
              alt={result.imageAlt ?? `${result.title} 피드 이미지`}
              className="object-cover"
              fill
              sizes="342px"
              src={result.imageSrc}
            />
          </div>
        ) : null}

        <div className="px-3 py-3">
          <p className="line-clamp-3 text-xs font-medium leading-5 text-black">
            <span className="font-bold">
              {result.subtitle.replace("@", "")}
            </span>{" "}
            {result.description}
          </p>
          <span className="mt-3 inline-flex text-xs font-semibold text-primary">
            피드 보기
          </span>
        </div>
      </UiCard>
    </Link>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <UiCard key={item}>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#e5e7eb]" />
            <div className="flex-1">
              <div className="h-3 w-28 rounded-full bg-[#e5e7eb]" />
              <div className="mt-3 h-3 w-40 rounded-full bg-[#eef0f3]" />
            </div>
          </div>
        </UiCard>
      ))}
    </div>
  );
}

export function SearchClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = searchParams.get("q") ?? "";
  const routeTags = normalizeSelectedTags(searchParams.getAll("tag"));
  const routeResultTab = normalizeResultTab(searchParams.get("type"));
  const [query, setQuery] = useState(() => routeQuery);
  const [selectedTags, setSelectedTags] =
    useState<SearchFilterTagId[]>(() => routeTags);
  const [selectedResultTab, setSelectedResultTab] =
    useState<SearchResultTabId>(() => routeResultTab);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [status, setStatus] = useState<SearchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 250);

  const urlSearch = useMemo(() => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }
    selectedTags.forEach((tag) => params.append("tag", tag));
    if (selectedResultTab !== "all") {
      params.set("type", selectedResultTab);
    }

    return params.toString();
  }, [query, selectedResultTab, selectedTags]);

  useEffect(() => {
    const currentSearch = searchParams.toString();

    if (urlSearch !== currentSearch) {
      router.replace(urlSearch ? `${pathname}?${urlSearch}` : pathname, {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams, urlSearch]);

  useEffect(() => {
    const controller = new AbortController();

    fetchSearchResults(
      {
        limit: 30,
        query: debouncedQuery,
        tags: selectedTags,
      },
      controller.signal,
    )
      .then((nextResponse) => {
        setResponse(nextResponse);
        setErrorMessage("");
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "검색 결과를 불러오지 못했습니다.",
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [debouncedQuery, refreshKey, selectedTags]);

  const visibleResults =
    selectedResultTab === "all"
      ? response?.results
      : response?.results.filter((result) => result.type === selectedResultTab);
  const resultCounts = resultTabs.reduce<Record<SearchResultTabId, number>>(
    (counts, tab) => {
      counts[tab.id] =
        tab.id === "all"
          ? (response?.results.length ?? 0)
          : (response?.results.filter((result) => result.type === tab.id).length ?? 0);
      return counts;
    },
    { all: 0, artwork: 0, feed: 0, user: 0 },
  );
  const hasSearchCondition =
    query.trim() || selectedTags.length > 0 || selectedResultTab !== "all";
  const title = hasSearchCondition ? "검색 결과" : "추천 결과";
  const visibleTags = response?.tags.length ? response.tags : searchTags;
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setStatus("loading");
  };
  const handleTagChange = (tag: SearchTagId) => {
    setSelectedTags((currentTags) => {
      if (tag === "all") {
        return [];
      }

      return currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag];
    });
    setStatus("loading");
  };
  const handleRetry = () => {
    setStatus("loading");
    setRefreshKey((current) => current + 1);
  };
  const handleResultTabChange = (tab: SearchResultTabId) => {
    setSelectedResultTab(tab);
  };

  return (
    <main className="px-6 pb-[96px] pt-5">
      <FigmaInput
        autoComplete="off"
        className="w-full"
        kind="search"
        onChange={(event) => handleQueryChange(event.currentTarget.value)}
        placeholder="유저, 작품, 피드 검색"
        value={query}
      />
      <div className="mt-4 flex flex-wrap gap-[6px]">
        {visibleTags.map((tag) => (
          <FigmaTag
            active={
              tag.id === "all"
                ? selectedTags.length === 0
                : selectedTags.includes(tag.id)
            }
            aria-pressed={
              tag.id === "all"
                ? selectedTags.length === 0
                : selectedTags.includes(tag.id)
            }
            as="button"
            key={tag.id}
            onClick={() => handleTagChange(tag.id)}
          >
            {tag.label}
          </FigmaTag>
        ))}
      </div>

      <div className="mt-4 flex rounded-md bg-panel p-1">
        {resultTabs.map((tab) => {
          const active = selectedResultTab === tab.id;

          return (
            <button
              aria-pressed={active}
              className={`flex min-h-8 flex-1 items-center justify-center rounded-md px-2 text-xs font-semibold ${
                active ? "bg-white text-primary shadow-sm" : "text-subtle"
              }`}
              key={tab.id}
              onClick={() => handleResultTabChange(tab.id)}
              type="button"
            >
              {tab.label}
              <span className="ml-1 text-[10px] font-medium">
                {resultCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {response ? (
          <span className="text-xs font-medium text-[#929aa8]">
            {visibleResults?.length ?? 0}개
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {status === "loading" ? <SearchSkeleton /> : null}

        {status === "error" ? (
          <UiCard>
            <p className="text-sm font-semibold">검색을 불러오지 못했습니다</p>
            <p className="mt-2 text-xs leading-5 text-[#929aa8]">{errorMessage}</p>
            <button
              className="mt-4 rounded-[5px] bg-[#307cff] px-3 py-[7px] text-xs font-medium text-white"
              onClick={handleRetry}
              type="button"
            >
              다시 시도
            </button>
          </UiCard>
        ) : null}

        {status === "ready" && visibleResults?.length === 0 ? (
          <UiCard>
            <p className="text-sm font-semibold">검색 결과가 없습니다</p>
            <p className="mt-2 text-xs leading-5 text-[#929aa8]">
              다른 키워드나 태그로 다시 찾아보세요.
            </p>
          </UiCard>
        ) : null}

        {status === "ready" && visibleResults?.length ? (
          <div className="grid gap-4">
            {visibleResults.map((result) =>
              result.type === "feed" ? (
                <SearchFeedResultCard key={result.id} result={result} />
              ) : (
                <SearchResultCard key={result.id} result={result} />
              ),
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
