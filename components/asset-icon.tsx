import Image from "next/image";
import type { AriaAttributes } from "react";

type AssetIconProps = AriaAttributes & {
  alt?: string;
  className?: string;
  name:
    | "bookmark"
    | "bookmark-on"
    | "check"
    | "chevron-down"
    | "heart"
    | "heart-on"
    | "heart-small"
    | "heart-small-on"
    | "message"
    | "nav-home"
    | "nav-home-on"
    | "nav-profile"
    | "nav-search"
    | "nav-search-on"
    | "radio-on"
    | "search-input"
    | "toggle"
    | "toggle-on";
};

const assetPath: Record<AssetIconProps["name"], string> = {
  bookmark: "/figma/assets/bookmark.svg",
  "bookmark-on": "/figma/assets/bookmark-on.svg",
  check: "/figma/assets/check.svg",
  "chevron-down": "/figma/assets/chevron-down.svg",
  heart: "/figma/assets/heart.svg",
  "heart-on": "/figma/assets/heart-on.svg",
  "heart-small": "/figma/assets/heart-small.svg",
  "heart-small-on": "/figma/assets/heart-small-on.svg",
  message: "/figma/assets/message.svg",
  "nav-home": "/figma/assets/nav-home.svg",
  "nav-home-on": "/figma/assets/nav-home-on.svg",
  "nav-profile": "/figma/assets/nav-profile.png",
  "nav-search": "/figma/assets/nav-search.svg",
  "nav-search-on": "/figma/assets/nav-search-on.svg",
  "radio-on": "/figma/assets/radio-on.svg",
  "search-input": "/figma/assets/search-input.svg",
  toggle: "/figma/assets/toggle.svg",
  "toggle-on": "/figma/assets/toggle-on.svg",
};

export function AssetIcon({
  alt = "",
  className = "h-6 w-6",
  name,
  ...props
}: AssetIconProps) {
  return (
    <Image
      alt={alt}
      className={className}
      height={24}
      src={assetPath[name]}
      unoptimized
      width={24}
      {...props}
    />
  );
}
