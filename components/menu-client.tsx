"use client";

import {
  SettingsListItem,
  type SettingsListItemIconName,
} from "@/components/settings-list-item";
import { getCreatorMembershipMenuItem } from "@/lib/creator-membership";
import { menuItems } from "@/lib/artroom-data";
import { useCreatorMembershipStatus } from "@/lib/use-creator-membership";

const menuIcons: Record<string, SettingsListItemIconName> = {
  "/commissions": "commission",
  "/creator/membership": "membership",
  "/notifications": "bell",
  "/policies": "policy",
};

export function MenuClient() {
  const creatorMembershipStatus = useCreatorMembershipStatus();
  const items = [
    getCreatorMembershipMenuItem(creatorMembershipStatus),
    ...menuItems,
  ];

  return (
    <div className="mt-6 grid gap-2">
      {items.map((item) => (
        <SettingsListItem
          description={item.description}
          href={item.href}
          icon={menuIcons[item.href] ?? "membership"}
          key={item.href}
          title={item.title}
        />
      ))}
    </div>
  );
}
