"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import type { ArtistProfile } from "@/lib/feed-types";
import {
  clearRouteToast,
  readRouteToast,
  subscribeRouteToastChange,
} from "@/lib/route-toast";
import { getCreatorMembershipMenuItem } from "@/lib/creator-membership";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";
import { useProfileImage } from "@/lib/use-profile-image";

const myStats = [
  { label: "가입 멤버십", value: "2" },
  { label: "소장 작품", value: "18" },
  { label: "내 작품", value: "4" },
];

const fallbackProfile = {
  followersLabel: "팔로워 0",
  username: "user_123",
} satisfies Pick<ArtistProfile, "followersLabel" | "username">;

const myCollectionItems = [
  {
    description: "후원 중인 멤버십과 받을 수 있는 혜택을 확인합니다.",
    href: "/membership",
    icon: "membership",
    title: "가입한 멤버십",
  },
  {
    description: "구매한 디지털 작품과 Ebook을 모아봅니다.",
    href: "/library",
    icon: "library",
    title: "내 소장함",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

const myCreationItems = [
  {
    description: "등록한 작품과 판매 준비 중인 초안을 확인합니다.",
    href: "/creator/artworks",
    icon: "artwork",
    title: "내 작품",
  },
] satisfies {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
}[];

type MyPageClientProps = {
  profile: Pick<ArtistProfile, "followersLabel" | "username"> | null;
};

export function MyPageClient({ profile }: MyPageClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const myProfile = profile ?? fallbackProfile;
  const profileImageSrc = useProfileImage();
  const toastMessage = useSyncExternalStore(
    subscribeRouteToastChange,
    readRouteToast,
    () => "",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const creatorMembershipItem = getCreatorMembershipMenuItem(
    creatorMembershipStatus,
  );
  const myCreations = [
    myCreationItems[0],
    {
      ...creatorMembershipItem,
      description: creatorMembershipItem.description,
      title:
        creatorMembershipStatus === "active"
          ? "만든 멤버십"
          : "멤버십 만들기",
    },
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

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(clearRouteToast, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

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
            <p className="mt-1 text-xs font-medium text-[#929aa8]">
              @{myProfile.username}
            </p>
            <p className="mt-2 text-xs font-medium text-[#307cff]">
              {myProfile.followersLabel}
            </p>
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
        <h2 className="text-base font-semibold">내 보관함</h2>
        <div className="mt-4 grid gap-2">
          {myCollectionItems.map((item) => (
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
        <h2 className="text-base font-semibold">내 창작물</h2>
        <div className="mt-4 grid gap-2">
          {myCreations.map((item) => (
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

      {toastMessage ? (
        <div
          aria-live="polite"
          className="fixed left-1/2 top-1/2 z-40 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-6"
          role="status"
        >
          <div className="rounded-md bg-foreground/65 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </main>
  );
}
