"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfileImage } from "@/lib/use-profile-image";
import { AssetIcon } from "./asset-icon";

const navItems = [
  { href: "/", label: "홈", type: "home" },
  { href: "/search", label: "검색", type: "search" },
  { href: "/menu", label: "전체메뉴", type: "menu" },
  { href: "/my", label: "마이페이지", type: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const profileImageSrc = useProfileImage();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex h-bottom-nav w-full max-w-app -translate-x-1/2 items-center justify-center gap-15 bg-white px-7.5 py-3.25">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const labelClassName = active ? "text-primary" : "text-muted";
        const menuSegmentClassName = active ? "bg-primary" : "bg-inactive";

        return (
          <Link
            aria-label={item.label}
            className="relative flex h-9 shrink-0 flex-col items-center justify-start text-3xs font-semibold"
            href={item.href}
            key={item.href}
          >
            {item.type === "home" ? (
              <>
                <AssetIcon
                  className="h-5 w-5"
                  name={active ? "nav-home-on" : "nav-home"}
                />
                <span className={`mt-1.25 leading-none ${labelClassName}`}>
                  홈
                </span>
              </>
            ) : null}
            {item.type === "search" ? (
              <>
                <AssetIcon
                  className="h-5 w-5"
                  name={active ? "nav-search-on" : "nav-search"}
                />
                <span className={`mt-1.25 leading-none ${labelClassName}`}>
                  검색
                </span>
              </>
            ) : null}
            {item.type === "menu" ? (
              <>
                <span className="relative block h-5 w-5" aria-hidden="true">
                  <span
                    className={`absolute left-[10.57px] top-0 h-5 w-[9.09px] rounded-[1.515px] ${menuSegmentClassName}`}
                  />
                  <span
                    className={`absolute left-0 top-0 h-[6.25px] w-[9.09px] rounded-[1.515px] ${menuSegmentClassName}`}
                  />
                  <span
                    className={`absolute left-0 top-[8.13px] h-[11.85px] w-[9.09px] rounded-[1.515px] ${menuSegmentClassName}`}
                  />
                </span>
                <span className={`mt-1.25 leading-none ${labelClassName}`}>
                  전체메뉴
                </span>
              </>
            ) : null}
            {item.type === "profile" ? (
              <>
                <span
                  className={`mt-px flex size-6 items-center justify-center overflow-hidden rounded-full ${
                    active ? "ring-2 ring-primary ring-offset-1" : ""
                  }`}
                >
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    height={24}
                    src={profileImageSrc}
                    unoptimized
                    width={24}
                  />
                </span>
                <span className="sr-only">마이페이지</span>
              </>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
