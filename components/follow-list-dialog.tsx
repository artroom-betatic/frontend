"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { SearchIcon } from "@/components/icons";
import type { ArtistSocialGraph, ArtistSummary } from "@/lib/feed-types";
import { MY_PROFILE_USERNAME } from "@/lib/my-profile";
import {
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";
import {
  defaultUserActionSnapshot,
  getArtistFollowing,
  isFollowerRemoved,
  isUsernameBlocked,
  readUserActionSnapshot,
  removeFollower,
  setArtistFollowing,
  setUsernameBlocked,
  subscribeUserActionsChange,
} from "@/lib/user-actions";
import { ActionButton } from "./action-button";

type FollowListMode = "followers" | "following";

type FollowListDialogProps = {
  allProfiles: ArtistSummary[];
  canManageFollowers?: boolean;
  className?: string;
  ownerDisplayName: string;
  ownerUsername: string;
  socialGraph: ArtistSocialGraph;
};

type FollowListMoreMenuProps = {
  accountBlocked: boolean;
  isFollowing: boolean;
  isOwnSocialList: boolean;
  mode: FollowListMode;
  onRemoveFollowerAndUnfollow: () => void;
  onToggleBlock: () => void;
  onUnfollow: () => void;
  profile: ArtistSummary;
};

const modeLabels = {
  followers: "팔로워",
  following: "팔로잉",
} satisfies Record<FollowListMode, string>;

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
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

function getProfileMap(profiles: ArtistSummary[]) {
  return new Map(profiles.map((profile) => [profile.username, profile]));
}

function FollowListMoreMenu({
  accountBlocked,
  isFollowing,
  isOwnSocialList,
  mode,
  onRemoveFollowerAndUnfollow,
  onToggleBlock,
  onUnfollow,
  profile,
}: FollowListMoreMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const isOwnProfile = profile.username === MY_PROFILE_USERNAME;
  const canRemoveFollower = isOwnSocialList && mode === "followers";
  const canUnfollow = isFollowing && !isOwnProfile;
  const canBlock = !isOwnProfile;
  const hasOptions = canRemoveFollower || canUnfollow || canBlock;

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", closeMenu);

    return () => window.removeEventListener("pointerdown", closeMenu);
  }, [open]);

  if (!hasOptions) {
    return null;
  }

  const runMenuAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`@${profile.username} 옵션`}
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        title="옵션"
        type="button"
      >
        <MoreIcon />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-9 z-40 w-56 overflow-hidden rounded-md border border-line bg-white shadow-lg"
          role="menu"
        >
          {canRemoveFollower && canUnfollow ? (
            <button
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-foreground"
              onClick={() => runMenuAction(onRemoveFollowerAndUnfollow)}
              role="menuitem"
              type="button"
            >
              팔로워 삭제 + 내 팔로우 취소
            </button>
          ) : null}
          {canUnfollow ? (
            <button
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-foreground"
              onClick={() => runMenuAction(onUnfollow)}
              role="menuitem"
              type="button"
            >
              팔로우 취소
            </button>
          ) : null}
          {canBlock ? (
            <button
              className="flex w-full items-center justify-between border-t border-line px-3 py-2 text-left text-xs font-semibold text-foreground"
              onClick={() => runMenuAction(onToggleBlock)}
              role="menuitem"
              type="button"
            >
              {accountBlocked ? "차단 해제" : "계정 차단"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function FollowListDialog({
  allProfiles,
  canManageFollowers = false,
  className = "",
  ownerDisplayName,
  ownerUsername,
  socialGraph,
}: FollowListDialogProps) {
  const [activeMode, setActiveMode] = useState<FollowListMode>("followers");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
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
  const isOwnSocialList = ownerUsername === MY_PROFILE_USERNAME;
  const socialListHidden =
    isOwnSocialList &&
    appSettings.followListVisibility === "private" &&
    !canManageFollowers;
  const profilesByUsername = useMemo(
    () =>
      getProfileMap([
        ...allProfiles,
        ...socialGraph.followers,
        ...socialGraph.following,
      ]),
    [allProfiles, socialGraph.followers, socialGraph.following],
  );
  const visibleFollowers = useMemo(
    () =>
      socialGraph.followers.filter((profile) => {
        if (!isOwnSocialList) {
          return true;
        }

        return (
          !isFollowerRemoved(actionSnapshot, profile.username) &&
          !isUsernameBlocked(actionSnapshot, profile.username)
        );
      }),
    [actionSnapshot, isOwnSocialList, socialGraph.followers],
  );
  const visibleFollowing = useMemo(() => {
    if (!isOwnSocialList) {
      return socialGraph.following;
    }

    const followingUsernames = new Set(
      socialGraph.following.map((profile) => profile.username),
    );

    Object.entries(actionSnapshot.followingByUsername).forEach(
      ([username, following]) => {
        if (username === ownerUsername || !profilesByUsername.has(username)) {
          return;
        }

        if (following) {
          followingUsernames.add(username);
        } else {
          followingUsernames.delete(username);
        }
      },
    );

    actionSnapshot.blockedUsernames.forEach((username) => {
      followingUsernames.delete(username);
    });

    return Array.from(followingUsernames)
      .map((username) => profilesByUsername.get(username))
      .filter((profile): profile is ArtistSummary => Boolean(profile));
  }, [
    actionSnapshot.blockedUsernames,
    actionSnapshot.followingByUsername,
    isOwnSocialList,
    ownerUsername,
    profilesByUsername,
    socialGraph.following,
  ]);
  const activeProfiles =
    activeMode === "followers" ? visibleFollowers : visibleFollowing;
  const filteredProfiles = activeProfiles.filter((profile) =>
    getProfileMatch(profile, query),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", closeWithEscape);

    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  const openDialog = (mode: FollowListMode) => {
    setActiveMode(mode);
    setOpen(true);
    setQuery("");
    setStatusMessage("");
  };

  const closeDialog = () => {
    setOpen(false);
    setQuery("");
    setStatusMessage("");
  };

  const setProfileFollowing = (profile: ArtistSummary, following: boolean) => {
    if (isUsernameBlocked(actionSnapshot, profile.username)) {
      setStatusMessage("차단한 계정은 팔로우할 수 없습니다.");
      return;
    }

    setArtistFollowing(profile.username, following);
    setStatusMessage(
      following
        ? `@${profile.username}님을 팔로우했습니다.`
        : `@${profile.username}님 팔로우를 취소했습니다.`,
    );
  };

  const removeProfileFollower = (profile: ArtistSummary, unfollow = false) => {
    removeFollower(profile.username, unfollow);
    setStatusMessage(
      unfollow
        ? `@${profile.username}님을 팔로워에서 삭제하고 내 팔로우도 취소했습니다.`
        : `@${profile.username}님을 팔로워에서 삭제했습니다.`,
    );
  };

  const toggleProfileBlock = (profile: ArtistSummary) => {
    const nextBlocked = !isUsernameBlocked(actionSnapshot, profile.username);

    setUsernameBlocked(profile.username, nextBlocked);
    setStatusMessage(
      nextBlocked
        ? `@${profile.username}님을 차단했습니다.`
        : `@${profile.username}님 차단을 해제했습니다.`,
    );
  };

  return (
    <>
      <div className={`mt-2 flex flex-wrap items-center gap-4 ${className}`}>
        <button
          className="text-xs font-semibold text-primary"
          onClick={() => openDialog("followers")}
          type="button"
        >
          팔로워 {visibleFollowers.length}
        </button>
        <button
          className="text-xs font-semibold text-primary"
          onClick={() => openDialog("following")}
          type="button"
        >
          팔로잉 {visibleFollowing.length}
        </button>
      </div>

      {open ? (
        <>
          <button
            aria-label="팔로워/팔로잉 목록 닫기"
            className="fixed inset-0 z-50 bg-black/30"
            onClick={closeDialog}
            type="button"
          />
          <section
            aria-label={`${ownerDisplayName}의 ${modeLabels[activeMode]} 목록`}
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-dvh max-w-app flex-col overflow-hidden rounded-t-md bg-white shadow-lg"
            role="dialog"
          >
            <header className="border-b border-line px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {ownerDisplayName}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">
                    @{ownerUsername}
                  </p>
                </div>
                <button
                  className="rounded-md bg-panel px-3 py-2 text-xs font-semibold text-foreground"
                  onClick={closeDialog}
                  type="button"
                >
                  닫기
                </button>
              </div>

              <div
                aria-label="목록 종류"
                className="mt-4 grid grid-cols-2 rounded-md bg-panel p-1"
                role="tablist"
              >
                {(["followers", "following"] as const).map((mode) => {
                  const active = activeMode === mode;

                  return (
                    <button
                      aria-selected={active}
                      className={`rounded-md px-3 py-2 text-xs font-semibold ${
                        active
                          ? "bg-white text-primary shadow-sm"
                          : "text-subtle"
                      }`}
                      key={mode}
                      onClick={() => {
                        setActiveMode(mode);
                        setQuery("");
                      }}
                      role="tab"
                      type="button"
                    >
                      {modeLabels[mode]}{" "}
                      {mode === "followers"
                        ? visibleFollowers.length
                        : visibleFollowing.length}
                    </button>
                  );
                })}
              </div>
            </header>

            {socialListHidden ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">
                  이 계정의 팔로워/팔로잉 목록은 비공개입니다.
                </p>
                <p className="mt-2 text-xs leading-5 text-subtle">
                  목록 공개 범위가 숨김으로 설정되어 있습니다.
                </p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-line px-5 py-3">
                  <label className="sr-only" htmlFor="follow-list-search">
                    팔로워/팔로잉 검색
                  </label>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      className="h-10 w-full rounded-md border border-line bg-panel pl-9 pr-3 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:border-primary"
                      id="follow-list-search"
                      onChange={(event) => setQuery(event.currentTarget.value)}
                      placeholder={`${modeLabels[activeMode]} 검색`}
                      type="search"
                      value={query}
                    />
                  </div>
                </div>

                {statusMessage ? (
                  <p
                    className="border-b border-line px-5 py-2 text-xs font-medium text-primary"
                    role="status"
                  >
                    {statusMessage}
                  </p>
                ) : null}

                <div className="min-h-0 flex-1 overflow-y-auto px-5">
                  {filteredProfiles.length ? (
                    <ul className="divide-y divide-line">
                      {filteredProfiles.map((profile) => {
                        const accountBlocked = isUsernameBlocked(
                          actionSnapshot,
                          profile.username,
                        );
                        const isOwnProfile =
                          profile.username === MY_PROFILE_USERNAME;
                        const isFollowing = getArtistFollowing(
                          actionSnapshot,
                          profile.username,
                          profile.isFollowing,
                        );

                        return (
                          <li
                            className="flex items-center gap-3 py-3"
                            key={profile.username}
                          >
                            <Link
                              className="flex min-w-0 flex-1 items-center gap-3"
                              href={profile.href}
                              onClick={closeDialog}
                            >
                              <Image
                                alt=""
                                className="rounded-full object-cover"
                                height={40}
                                src={profile.avatarSrc}
                                width={40}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-foreground">
                                  {profile.displayName}
                                </span>
                                <span className="mt-0.5 block truncate text-xs font-medium text-muted">
                                  @{profile.username}
                                </span>
                              </span>
                            </Link>

                            {!isOwnProfile ? (
                              <div className="flex shrink-0 items-center gap-1">
                                <ActionButton
                                  aria-pressed={isFollowing}
                                  className="min-w-14"
                                  onClick={() =>
                                    setProfileFollowing(profile, !isFollowing)
                                  }
                                  variant={
                                    isFollowing ? "following" : "follow"
                                  }
                                >
                                  {accountBlocked
                                    ? "차단됨"
                                    : isFollowing
                                      ? "팔로잉"
                                      : "팔로우"}
                                </ActionButton>
                                <FollowListMoreMenu
                                  accountBlocked={accountBlocked}
                                  isFollowing={isFollowing}
                                  isOwnSocialList={isOwnSocialList}
                                  mode={activeMode}
                                  onRemoveFollowerAndUnfollow={() =>
                                    removeProfileFollower(profile, true)
                                  }
                                  onToggleBlock={() =>
                                    toggleProfileBlock(profile)
                                  }
                                  onUnfollow={() =>
                                    setProfileFollowing(profile, false)
                                  }
                                  profile={profile}
                                />
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="px-3 py-10 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        표시할 계정이 없습니다.
                      </p>
                      <p className="mt-2 text-xs leading-5 text-subtle">
                        검색어를 바꾸거나 다른 목록을 확인해보세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
