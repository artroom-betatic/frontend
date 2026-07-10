import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { UiCard } from "@/components/ui-card";

type ContentListCardProps = {
  ariaLabel?: string;
  badge?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  href?: string;
  imageAlt: string;
  imagePriority?: boolean;
  imageSrc: string;
  meta?: ReactNode;
  subtitle?: ReactNode;
  subtitleTone?: "muted" | "primary";
  title: ReactNode;
};

export function ContentListCard({
  ariaLabel,
  badge,
  className = "",
  description,
  eyebrow,
  href,
  imageAlt,
  imagePriority = false,
  imageSrc,
  meta,
  subtitle,
  subtitleTone = "muted",
  title,
}: ContentListCardProps) {
  const subtitleClassName =
    subtitleTone === "primary"
      ? "font-semibold text-primary"
      : "font-medium text-muted";
  const card = (
    <UiCard className={`bg-white ${className}`}>
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-panel">
          <Image
            alt={imageAlt}
            className="object-cover"
            fill
            priority={imagePriority}
            sizes="80px"
            src={imageSrc}
          />
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs font-semibold text-primary">{eyebrow}</p>
          ) : null}
          <div
            className={`flex items-start justify-between gap-3 ${
              eyebrow ? "mt-1" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {title}
              </p>
              {subtitle ? (
                <p className={`mt-1 text-xs ${subtitleClassName}`}>
                  {subtitle}
                </p>
              ) : null}
            </div>
            {badge ? (
              <span className="shrink-0 rounded-md bg-panel px-2 py-1 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-subtle">
              {description}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-2 text-[10px] font-semibold text-muted">{meta}</p>
          ) : null}
        </div>
      </div>
    </UiCard>
  );

  if (!href) {
    return card;
  }

  return (
    <Link aria-label={ariaLabel} className="block" href={href}>
      {card}
    </Link>
  );
}
