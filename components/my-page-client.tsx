"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ActionButton } from "@/components/action-button";
import { ArtistProfileTabs } from "@/components/artist-profile-tabs";
import { FollowListDialog } from "@/components/follow-list-dialog";
import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { UiCard } from "@/components/ui-card";
import type { ArtworkDetail, SeriesDetail } from "@/lib/catalog-data";
import {
  defaultCreatorArtworks,
  readCreatorArtworks,
  subscribeCreatorArtworksChange,
} from "@/lib/creator-artworks";
import {
  readStoredProfileBio,
  saveStoredProfileBio,
  saveStoredProfileImage,
  subscribeProfileBioChange,
} from "@/lib/my-profile";
import type {
  ArtistProfile,
  ArtistSocialGraph,
  ArtistSummary,
  FeedPost,
} from "@/lib/feed-types";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
  updateAppSettings,
} from "@/lib/app-settings";
import {
  defaultUserActionSnapshot,
  isArtworkDeleted,
  readUserActionSnapshot,
  setUsernameBlocked,
  subscribeUserActionsChange,
} from "@/lib/user-actions";
import {
  clearRouteToast,
  readRouteToast,
  subscribeRouteToastChange,
} from "@/lib/route-toast";
import { getCreatorMembershipMenuItem } from "@/lib/creator-membership";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";
import { useProfileImage } from "@/lib/use-profile-image";

const fallbackProfile = {
  avatarSrc: "/figma/profile.png",
  bio: "감정선이 살아있는 캐릭터 일러스트와 판타지 세계관 작업을 올립니다.",
  coverTitle: "내 창작 활동",
  displayName: "내 프로필",
  followersLabel: "팔로워 0",
  href: "/artist/user_123",
  isFollowing: true,
  membershipLabel: "멤버십 만들기",
  stats: { commissions: 0, posts: 0, works: 0 },
  tags: ["#창작", "#작업일지"],
  username: "user_123",
} satisfies ArtistProfile;

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
  allProfiles: ArtistSummary[];
  artworks: ArtworkDetail[];
  collectionCount: number;
  joinedMembershipCount: number;
  posts: FeedPost[];
  profile: ArtistProfile | null;
  series: SeriesDetail[];
  socialGraph: ArtistSocialGraph;
};

export function MyPageClient({
  allProfiles,
  artworks,
  collectionCount,
  joinedMembershipCount,
  posts,
  profile,
  series,
  socialGraph,
}: MyPageClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const myProfile = profile ?? fallbackProfile;
  const profileImageSrc = useProfileImage();
  const appSettings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );
  const actionSnapshot = useSyncExternalStore(
    subscribeUserActionsChange,
    readUserActionSnapshot,
    () => defaultUserActionSnapshot,
  );
  const creatorArtworks = useSyncExternalStore(
    subscribeCreatorArtworksChange,
    readCreatorArtworks,
    () => defaultCreatorArtworks,
  );
  const toastMessage = useSyncExternalStore(
    subscribeRouteToastChange,
    readRouteToast,
    () => "",
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [savedBio, setSavedBio] = useState(() =>
    readStoredProfileBio(myProfile.bio),
  );
  const [bioDraft, setBioDraft] = useState(() =>
    readStoredProfileBio(myProfile.bio),
  );
  const [editingBio, setEditingBio] = useState(false);
  const creatorMembershipItem = getCreatorMembershipMenuItem(
    creatorMembershipStatus,
  );
  const visibleArtworkCount =
    artworks.filter((artwork) => !isArtworkDeleted(actionSnapshot, artwork.slug))
      .length + creatorArtworks.length;
  const myStats = [
    { label: "가입 멤버십", value: String(joinedMembershipCount) },
    { label: "소장 작품", value: String(collectionCount) },
    { label: "내 작품", value: String(visibleArtworkCount) },
  ];
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

  const saveBio = () => {
    saveStoredProfileBio(bioDraft);
    const nextBio = readStoredProfileBio(myProfile.bio);

    setSavedBio(nextBio);
    setBioDraft(nextBio);
    setEditingBio(false);
    setStatusMessage("자기소개가 저장되었습니다.");
  };

  const startBioEdit = () => {
    setBioDraft(savedBio);
    setEditingBio(true);
    setStatusMessage("");
  };

  const toggleAccountVisibility = () => {
    const nextVisibility =
      appSettings.accountVisibility === "public" ? "private" : "public";

    updateAppSettings({ accountVisibility: nextVisibility });
    setStatusMessage(
      nextVisibility === "public"
        ? "계정을 공개로 변경했습니다."
        : "계정을 비공개로 변경했습니다.",
    );
  };
  const toggleFollowListVisibility = () => {
    const nextVisibility =
      appSettings.followListVisibility === "public" ? "private" : "public";

    updateAppSettings({ followListVisibility: nextVisibility });
    setStatusMessage(
      nextVisibility === "public"
        ? "팔로워/팔로잉 목록을 공개했습니다."
        : "팔로워/팔로잉 목록을 숨겼습니다.",
    );
  };
  const unblockUsername = (username: string) => {
    setUsernameBlocked(username, false);
    setStatusMessage(`@${username} 차단을 해제했습니다.`);
  };

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(clearRouteToast, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    const syncBio = () => {
      const nextBio = readStoredProfileBio(myProfile.bio);

      setSavedBio(nextBio);
      setBioDraft(nextBio);
    };

    syncBio();
    return subscribeProfileBioChange(syncBio);
  }, [myProfile.bio]);

  return (
    <main className="px-6 pb-24 pt-5">
      <section className="bg-white">
        <div className="flex items-start gap-4">
          <button
            aria-label="프로필 이미지 변경"
            className="relative size-20.5 overflow-hidden rounded-full bg-panel"
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
            <p className="mt-1 text-xs font-medium text-muted">
              @{myProfile.username}
            </p>
            <FollowListDialog
              allProfiles={allProfiles}
              canManageFollowers
              ownerDisplayName={myProfile.displayName}
              ownerUsername={myProfile.username}
              socialGraph={socialGraph}
            />
          </div>
        </div>

        <input
          accept="image/*"
          className="hidden"
          onChange={(event) => handleImageFile(event.currentTarget.files?.[0])}
          ref={fileInputRef}
          type="file"
        />

        <div className="mt-5">
          <ActionButton
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            이미지 변경
          </ActionButton>
        </div>

        <div className="mt-6 rounded-md px-1 py-3 transition-colors hover:bg-panel">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold leading-5 text-foreground">
                자기소개
              </p>
              {!editingBio ? (
                <p className="mt-1 whitespace-pre-wrap text-xs font-medium leading-5 text-subtle">
                  {savedBio}
                </p>
              ) : null}
            </div>
            <div className="shrink-0">
              {editingBio ? (
                <span className="text-2xs font-medium text-muted">
                  {bioDraft.length}/120
                </span>
              ) : (
                <ActionButton onClick={startBioEdit} variant="secondary">
                  수정
                </ActionButton>
              )}
            </div>
          </div>

          {editingBio ? (
            <>
              <label className="sr-only" htmlFor="my-profile-bio">
                자기소개 입력
              </label>
              <textarea
                className="mt-3 min-h-24 w-full resize-none rounded-md border border-line bg-panel px-3 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted focus:border-primary"
                id="my-profile-bio"
                maxLength={120}
                onChange={(event) => setBioDraft(event.currentTarget.value)}
                placeholder="프로필에 보여줄 자기소개를 작성하세요."
                value={bioDraft}
              />
              <ActionButton className="mt-3 w-full" onClick={saveBio}>
                저장
              </ActionButton>
            </>
          ) : null}
        </div>

        <div className="mt-1 flex items-center justify-between gap-4 rounded-md px-1 py-3 transition-colors hover:bg-panel">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-5 text-foreground">
              계정 공개 범위
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-subtle">
              현재 {appSettings.accountVisibility === "public" ? "공개" : "비공개"} 상태입니다.
            </p>
          </div>
          <ActionButton onClick={toggleAccountVisibility} variant="secondary">
            {appSettings.accountVisibility === "public" ? "비공개" : "공개"}
          </ActionButton>
        </div>

        <div className="mt-1 flex items-center justify-between gap-4 rounded-md px-1 py-3 transition-colors hover:bg-panel">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-5 text-foreground">
              팔로워/팔로잉 목록
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-subtle">
              현재{" "}
              {appSettings.followListVisibility === "public" ? "공개" : "숨김"}{" "}
              상태입니다.
            </p>
          </div>
          <ActionButton
            onClick={toggleFollowListVisibility}
            variant="secondary"
          >
            {appSettings.followListVisibility === "public" ? "숨김" : "공개"}
          </ActionButton>
        </div>

        <div className="mt-1 rounded-md px-1 py-3 transition-colors hover:bg-panel">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-semibold leading-5 text-foreground">
                차단한 유저
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-subtle">
                {actionSnapshot.blockedUsernames.length
                  ? `${actionSnapshot.blockedUsernames.length}명을 차단 중입니다.`
                  : "차단한 유저가 없습니다."}
              </p>
            </div>
          </div>

          {actionSnapshot.blockedUsernames.length ? (
            <div className="mt-3 grid gap-1">
              {actionSnapshot.blockedUsernames.map((username) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-background"
                  key={username}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                    @{username}
                  </span>
                  <ActionButton
                    onClick={() => unblockUsername(username)}
                    variant="secondary"
                  >
                    차단 해제
                  </ActionButton>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {statusMessage ? (
          <p className="mt-3 text-xs font-medium text-primary">{statusMessage}</p>
        ) : null}
      </section>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {myStats.map((stat) => (
          <UiCard className="p-3 text-center" key={stat.label}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="mt-1 text-2xs text-muted">{stat.label}</p>
          </UiCard>
        ))}
      </div>

      <ArtistProfileTabs
        artworks={artworks}
        posts={posts}
        profile={myProfile}
        series={series}
      />

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
