"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { MobileHeader } from "@/components/mobile-header";
import { ScreenSection } from "@/components/screen-section";
import { UiCard } from "@/components/ui-card";
import {
  addCreatorArtwork,
  type CreatorArtworkImagePreset,
  type CreatorArtworkSaleType,
  type CreatorArtworkStatus,
  creatorArtworkImageOptions,
  formatCreatorArtworkPrice,
} from "@/lib/creator-artworks";
import { writeRouteToast } from "@/lib/route-toast";

type ArtworkDraft = {
  description: string;
  imagePreset: CreatorArtworkImagePreset;
  price: string;
  saleType: CreatorArtworkSaleType;
  status: CreatorArtworkStatus;
  title: string;
};

const statusOptions = [
  { id: "draft", label: "초안" },
  { id: "published", label: "공개" },
] satisfies { id: CreatorArtworkStatus; label: string }[];

const saleTypeOptions = [
  { id: "digital", label: "디지털 작품" },
  { id: "ebook", label: "Ebook" },
] satisfies { id: CreatorArtworkSaleType; label: string }[];

function createId() {
  return `artwork-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CreatorArtworkForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<ArtworkDraft>({
    description: "",
    imagePreset: "red",
    price: "",
    saleType: "digital",
    status: "draft",
    title: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const selectedImage =
    creatorArtworkImageOptions.find((option) => option.id === draft.imagePreset) ??
    creatorArtworkImageOptions[0];
  const canPublish = draft.title.trim() && Number(draft.price) > 0;

  const updateDraft = (nextDraft: Partial<ArtworkDraft>) => {
    setDraft((currentDraft) => ({ ...currentDraft, ...nextDraft }));
    setStatusMessage("");
  };

  const submitArtwork = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = draft.title.trim();
    const description = draft.description.trim();

    if (!title) {
      setStatusMessage("작품 제목을 입력해주세요.");
      return;
    }

    if (draft.status === "published" && !canPublish) {
      setStatusMessage("공개하려면 제목과 가격을 입력해주세요.");
      return;
    }

    addCreatorArtwork({
      description: description || "작품 설명이 아직 입력되지 않았습니다.",
      id: createId(),
      imageAlt: `${title} 대표 이미지`,
      imageSrc: selectedImage.imageSrc,
      price: draft.price,
      saleType: draft.saleType,
      status: draft.status,
      title,
    });
    writeRouteToast(
      draft.status === "published"
        ? "작품을 공개 목록에 등록했습니다."
        : "작품 초안을 저장했습니다.",
    );
    router.replace("/creator/artworks");
  };

  return (
    <AppFrame>
      <MobileHeader backBehavior="history" backHref="/creator/artworks" title="작품 등록하기" />
      <main className="px-6 pb-8 pt-5">
        <p className="text-sm font-medium leading-6 text-subtle">
          디지털 작품이나 Ebook을 판매하기 전에 작품 정보와 파일 구성을 정리합니다.
        </p>

        <form onSubmit={submitArtwork}>
          <ScreenSection title="기본 정보">
            <UiCard className="bg-white">
              <label className="block">
                <span className="text-xs font-medium text-subtle">작품 제목</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                  onChange={(event) => updateDraft({ title: event.target.value })}
                  placeholder="작품 제목 입력"
                  value={draft.title}
                />
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-medium text-subtle">작품 소개</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none focus:border-primary"
                  onChange={(event) =>
                    updateDraft({ description: event.target.value })
                  }
                  placeholder="구매자가 확인할 설명을 입력하세요."
                  value={draft.description}
                />
              </label>
            </UiCard>
          </ScreenSection>

          <ScreenSection title="판매 설정">
            <div className="grid gap-3">
              <UiCard className="bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-subtle">판매 유형</span>
                    <select
                      className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                      onChange={(event) =>
                        updateDraft({
                          saleType:
                            event.target.value as CreatorArtworkSaleType,
                        })
                      }
                      value={draft.saleType}
                    >
                      {saleTypeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-subtle">가격</span>
                    <input
                      className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                      inputMode="numeric"
                      onChange={(event) =>
                        updateDraft({
                          price: event.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="0"
                      value={draft.price}
                    />
                  </label>
                </div>
                <p className="mt-3 text-2xs font-semibold text-muted">
                  {formatCreatorArtworkPrice(draft.price)}
                </p>
              </UiCard>

              <UiCard className="bg-white">
                <p className="text-xs font-medium text-subtle">등록 상태</p>
                <div className="mt-3 grid grid-cols-2 gap-1 rounded-md bg-panel p-1">
                  {statusOptions.map((option) => {
                    const selected = draft.status === option.id;

                    return (
                      <button
                        aria-pressed={selected}
                        className={`min-h-9 rounded-md px-2 text-xs font-semibold ${
                          selected
                            ? "bg-primary text-white"
                            : "bg-white text-muted"
                        }`}
                        key={option.id}
                        onClick={() => updateDraft({ status: option.id })}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-2xs font-medium leading-4 text-muted">
                  초안은 내 작품 목록에만 보관되고, 공개는 판매 준비가 된 작품으로
                  표시됩니다.
                </p>
              </UiCard>
            </div>
          </ScreenSection>

          <ScreenSection title="대표 이미지">
            <UiCard className="bg-white">
              <div className="relative aspect-square overflow-hidden rounded-md bg-panel">
                <Image
                  alt={`${selectedImage.label} 미리보기`}
                  className="object-cover"
                  fill
                  sizes="342px"
                  src={selectedImage.imageSrc}
                />
              </div>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-subtle">이미지 선택</span>
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-panel px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
                  onChange={(event) =>
                    updateDraft({
                      imagePreset:
                        event.target.value as CreatorArtworkImagePreset,
                    })
                  }
                  value={draft.imagePreset}
                >
                  {creatorArtworkImageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </UiCard>
          </ScreenSection>

          <button
            className="mt-6 flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white"
            type="submit"
          >
            작품 저장하기
          </button>
          {statusMessage ? (
            <p className="mt-4 text-xs font-semibold text-primary">
              {statusMessage}
            </p>
          ) : null}
        </form>
      </main>
    </AppFrame>
  );
}
