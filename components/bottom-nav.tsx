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
    <nav className="fixed bottom-0 left-1/2 z-30 flex h-[70px] w-full max-w-[390px] -translate-x-1/2 items-center justify-center gap-[60px] bg-white px-[30px] py-[13px]">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const color = active ? "#307cff" : "#929aa8";

        return (
          <Link
            aria-label={item.label}
            className="relative flex h-9 shrink-0 flex-col items-center justify-start text-[9px] font-semibold"
            href={item.href}
            key={item.href}
          >
            {item.type === "home" ? (
              <>
                <AssetIcon
                  className="h-5 w-5"
                  name={active ? "nav-home-on" : "nav-home"}
                />
                <span className="mt-[5px] leading-none" style={{ color }}>
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
                <span className="mt-[5px] leading-none" style={{ color }}>
                  검색
                </span>
              </>
            ) : null}
            {item.type === "menu" ? (
              <>
                <span className="relative block h-5 w-5" aria-hidden="true">
                  <span
                    className="absolute left-[10.57px] top-0 h-5 w-[9.09px] rounded-[1.515px]"
                    style={{ backgroundColor: active ? "#307cff" : "#d0d5dd" }}
                  />
                  <span
                    className="absolute left-0 top-0 h-[6.25px] w-[9.09px] rounded-[1.515px]"
                    style={{ backgroundColor: active ? "#307cff" : "#d0d5dd" }}
                  />
                  <span
                    className="absolute left-0 top-[8.13px] h-[11.85px] w-[9.09px] rounded-[1.515px]"
                    style={{ backgroundColor: active ? "#307cff" : "#d0d5dd" }}
                  />
                </span>
                <span className="mt-[5px] leading-none" style={{ color }}>
                  전체메뉴
                </span>
              </>
            ) : null}
            {item.type === "profile" ? (
              <>
                <span
                  className={`mt-[1px] flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-full ${
                    active ? "ring-2 ring-[#307cff] ring-offset-1" : ""
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
