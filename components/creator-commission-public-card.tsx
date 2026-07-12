"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { UiCard } from "@/components/ui-card";
import {
  CREATOR_COMMISSION_PUBLIC_USERNAME,
  defaultCreatorCommissionSettings,
  formatCreatorCommissionPrice,
  isCreatorCommissionReady,
  readCreatorCommissionSettings,
  subscribeCreatorCommissionSettingsChange,
} from "@/lib/creator-commission-settings";

type CreatorCommissionPublicCardProps = {
  hasStaticCommissions: boolean;
  username: string;
};

export function CreatorCommissionPublicCard({
  hasStaticCommissions,
  username,
}: CreatorCommissionPublicCardProps) {
  const settings = useSyncExternalStore(
    subscribeCreatorCommissionSettingsChange,
    readCreatorCommissionSettings,
    () => defaultCreatorCommissionSettings,
  );

  if (
    username !== CREATOR_COMMISSION_PUBLIC_USERNAME ||
    !settings.accepting ||
    !isCreatorCommissionReady(settings)
  ) {
    return null;
  }

  return (
    <section
      className="mt-2 bg-white px-6 py-5"
      id={hasStaticCommissions ? undefined : "profile-commissions"}
    >
      <h2 className="text-base font-semibold">커미션 안내</h2>
      <UiCard className="mt-4 bg-white">
        <p className="truncate text-sm font-semibold text-black">
          커미션 슬롯 접수 중
        </p>
        <p className="mt-1 text-xs font-semibold text-primary">
          {formatCreatorCommissionPrice(settings.basePrice)} · 슬롯{" "}
          {Number(settings.slots) || 0}개
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-subtle">
          {settings.scope}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-subtle">
          {settings.guidance}
        </p>
        <Link
          className="mt-3 inline-flex text-xs font-semibold text-primary"
          href="/creator/commissions"
        >
          커미션 설정 관리
        </Link>
      </UiCard>
    </section>
  );
}
