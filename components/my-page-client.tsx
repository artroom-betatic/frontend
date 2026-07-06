"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ActionButton } from "@/components/action-button";
import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { UiCard } from "@/components/ui-card";
import {
  clearStoredProfileImage,
  saveStoredProfileImage,
} from "@/lib/my-profile";
import { getCreatorMembershipMenuItem } from "@/lib/creator-membership";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";
import { useProfileImage } from "@/lib/use-profile-image";

const myStats = [
  { label: "팔로잉", value: "24" },
  { label: "소장 작품", value: "18" },
  { label: "커미션", value: "3" },
];

const myMenus = [
  {
    description: "진행 중인 의뢰와 완료된 작업물을 확인합니다.",
    href: "/commissions",
    icon: "commission",
    title: "커미션 의뢰 현황",
  },
  {
    description: "구매한 디지털 작품과 Ebook을 모아봅니다.",
    href: "/search?tag=ebook",
    icon: "library",
    title: "내 소장함",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

const creatorToolItems = [
  {
    description: "의뢰 슬롯, 가격, 신청 조건을 정리합니다.",
    href: "/creator/commissions",
    icon: "commission",
    title: "커미션 열기",
  },
  {
    description: "디지털 작품과 Ebook 판매 페이지를 준비합니다.",
    href: "/creator/artworks/new",
    icon: "artwork",
    title: "작품 등록하기",
  },
  {
    description: "판매 수익을 받을 정산 정보를 관리합니다.",
    href: "/creator/payout",
    icon: "payout",
    title: "정산 설정",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

export function MyPageClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const profileImageSrc = useProfileImage();
  const [statusMessage, setStatusMessage] = useState("");
  const creatorTools = [
    getCreatorMembershipMenuItem(creatorMembershipStatus),
    ...creatorToolItems,
  ];

  const handleImageFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusMessage("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const nextSrc = String(reader.result);
      saveStoredProfileImage(nextSrc);
      setStatusMessage("프로필 이미지가 변경되었습니다.");
    });
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    clearStoredProfileImage();
    setStatusMessage("기본 이미지로 되돌렸습니다.");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="px-6 pb-[96px] pt-5">
      <section className="bg-white">
        <div className="flex items-start gap-4">
          <button
            aria-label="프로필 이미지 변경"
            className="relative h-[82px] w-[82px] overflow-hidden rounded-full bg-[#f0f2f5]"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Image
              alt="내 프로필 이미지"
              className="object-cover"
              fill
              sizes="82px"
              src={profileImageSrc}
              unoptimized
            />
          </button>
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="truncate text-xl font-bold text-black">내 프로필</h1>
            <p className="mt-1 text-xs font-medium text-[#929aa8]">@user_123</p>
          </div>
        </div>

        <input
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageFile(event.currentTarget.files?.[0])}
          ref={fileInputRef}
          type="file"
        />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ActionButton onClick={() => fileInputRef.current?.click()}>
            이미지 변경
          </ActionButton>
          <ActionButton onClick={resetImage} variant="secondary">
            기본 이미지
          </ActionButton>
        </div>

        {statusMessage ? (
          <p className="mt-3 text-xs font-medium text-[#307cff]">{statusMessage}</p>
        ) : null}
      </section>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {myStats.map((stat) => (
          <UiCard className="p-3 text-center" key={stat.label}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="mt-1 text-[10px] text-[#929aa8]">{stat.label}</p>
          </UiCard>
        ))}
      </div>

      <section className="mt-7">
        <h2 className="text-base font-semibold">창작자 도구</h2>
        <div className="mt-4 grid gap-2">
          {creatorTools.map((item) => (
            <SettingsListItem
              description={item.description}
              href={item.href}
              icon={item.icon}
              key={item.href}
              title={item.title}
            />
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="text-base font-semibold">내 활동</h2>
        <div className="mt-4 grid gap-2">
          {myMenus.map((item) => (
            <SettingsListItem
              description={item.description}
              href={item.href}
              icon={item.icon}
              key={item.href}
              title={item.title}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
