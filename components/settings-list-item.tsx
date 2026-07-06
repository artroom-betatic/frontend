import Link from "next/link";

export type SettingsListItemIconName =
  | "artwork"
  | "bell"
  | "commission"
  | "coupon"
  | "library"
  | "membership"
  | "payout"
  | "policy";

type SettingsListItemProps = {
  description: string;
  href: string;
  icon: SettingsListItemIconName;
  title: string;
};

function SettingsListIcon({ name }: { name: SettingsListItemIconName }) {
  const iconClassName = "h-7 w-7 text-primary";

  if (name === "bell") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path
          d="M11 26h14c-1.6-1.8-2.2-4.1-2.2-7.2 0-4.1-1.8-7.1-4.8-7.1s-4.8 3-4.8 7.1c0 3.1-.6 5.4-2.2 7.2Z"
          fill="currentColor"
          opacity="0.55"
        />
        <path d="M15 28.5c.6 1.4 1.6 2.1 3 2.1s2.4-.7 3-2.1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "artwork") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path
          d="M9 8h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M10 25l5.5-6 4 4.2 2.7-3.1L27 25H10Z"
          fill="currentColor"
        />
        <circle cx="22.5" cy="14" fill="currentColor" r="2.5" />
      </svg>
    );
  }

  if (name === "commission") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path
          d="M8 29c0-4.4 3.2-7.2 8-7.2s8 2.8 8 7.2v1H8v-1Z"
          fill="currentColor"
        />
        <circle cx="16" cy="15" fill="currentColor" r="5" />
        <path
          d="M26 8h5v5M31 8l-7.5 7.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if (name === "coupon" || name === "policy") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path
          d="M6 9h24v5a4 4 0 0 0 0 8v5H6v-5a4 4 0 0 0 0-8V9Z"
          fill="currentColor"
        />
        <path
          d="M15 14.5h.1M22 21.5h.1M23 13 14 23"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (name === "library") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path d="M9 7h18v22l-9-4.5L9 29V7Z" fill="currentColor" />
        <path d="M13 12h10M13 17h8" stroke="white" strokeLinecap="round" strokeWidth="2.5" />
      </svg>
    );
  }

  if (name === "payout") {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        viewBox="0 0 36 36"
      >
        <path
          d="M7 12.5A3.5 3.5 0 0 1 10.5 9h15A3.5 3.5 0 0 1 29 12.5v11A3.5 3.5 0 0 1 25.5 27h-15A3.5 3.5 0 0 1 7 23.5v-11Z"
          fill="currentColor"
          opacity="0.25"
        />
        <path
          d="M10 15h16v3H10v-3ZM12 22h8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="none"
      viewBox="0 0 36 36"
    >
      <circle cx="18" cy="12" r="7" stroke="currentColor" strokeWidth="4" />
      <path d="M13 18v13l5-4 5 4V18" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function SettingsListItem({
  description,
  href,
  icon,
  title,
}: SettingsListItemProps) {
  return (
    <Link
      className="flex items-center gap-3 rounded-md px-1 py-3 transition-colors hover:bg-panel"
      href={href}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center">
        <SettingsListIcon name={icon} />
      </span>
      <span className="flex min-h-11 min-w-0 flex-1 flex-col justify-center">
        <span className="block text-base font-semibold leading-5 text-black">
          {title}
        </span>
        <span className="mt-1 block text-xs font-medium leading-5 text-subtle">
          {description}
        </span>
      </span>
    </Link>
  );
}
