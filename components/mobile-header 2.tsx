import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "./icons";

type MobileHeaderProps = {
  action?: ReactNode;
  title: string;
  backHref?: string;
};

export function MobileHeader({ action, title, backHref = "/" }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12.5 items-center justify-center bg-white px-9">
      <Link
        aria-label="뒤로 가기"
        className="absolute left-8 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-black"
        href={backHref}
      >
        <BackIcon className="h-5 w-5" />
      </Link>
      <h1 className="text-center text-base font-semibold leading-none text-black">
        {title}
      </h1>
      {action ? (
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          {action}
        </div>
      ) : null}
    </header>
  );
}
