"use client";

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
  SearchTagId,
} from "@/lib/search-types";

type SearchStatus = "error" | "loading" | "ready";

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

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function resultTypeLabel(type: SearchResult["type"]) {
  return {
    artist: "작가",
    artwork: "작품",
    commission: "커미션",
  }[type];
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <Link href={result.href}>
      <UiCard>
        <div className="flex items-start gap-3">
          <ProfileAvatar size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{result.title}</p>
              <span className="shrink-0 rounded-[4px] bg-white px-2 py-1 text-[10px] font-medium text-[#929aa8]">
                {resultTypeLabel(result.type)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#929aa8]">{result.subtitle}</p>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#1f2937]">
              {result.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-[6px]">
              {result.badges.map((badge) => (
                <span
                  className="rounded-[5px] bg-white px-2 py-1 text-[10px] font-medium"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
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
  const [query, setQuery] = useState(() => routeQuery);
  const [selectedTags, setSelectedTags] =
    useState<SearchFilterTagId[]>(() => routeTags);
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

    return params.toString();
  }, [query, selectedTags]);

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
        limit: 12,
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

  const hasSearchCondition = query.trim() || selectedTags.length > 0;
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

  return (
    <main className="px-6 pb-[96px] pt-5">
      <FigmaInput
        autoComplete="off"
        className="w-full"
        kind="search"
        onChange={(event) => handleQueryChange(event.currentTarget.value)}
        placeholder="작가, 작품, 커미션 검색"
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

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {response ? (
          <span className="text-xs font-medium text-[#929aa8]">{response.total}개</span>
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

        {status === "ready" && response?.results.length === 0 ? (
          <UiCard>
            <p className="text-sm font-semibold">검색 결과가 없습니다</p>
            <p className="mt-2 text-xs leading-5 text-[#929aa8]">
              다른 키워드나 태그로 다시 찾아보세요.
            </p>
          </UiCard>
        ) : null}

        {status === "ready" && response?.results.length ? (
          <div className="grid gap-4">
            {response.results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
