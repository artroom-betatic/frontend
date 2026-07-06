type IconProps = {
  className?: string;
};

export function BackIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function HeartIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.4 6.7c-1.5-2.1-4.7-2-6.3-.1L12 9l-2.1-2.4c-1.7-1.9-4.8-2-6.3.1-1.7 2.3-.9 5.4 1.1 7.3l6.4 5.9a1.3 1.3 0 0 0 1.8 0l6.4-5.9c2-1.9 2.8-5 1.1-7.3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function MessageIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.3 18.3c-1.5-1.5-2.3-3.4-2.3-5.5C3 7.9 7 4 12 4s9 3.9 9 8.8-4 8.8-9 8.8c-1.1 0-2.2-.2-3.2-.6L4 21l1.3-2.7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function BookmarkIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

export function GridIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9 0h5v5h-5v-5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 11 8-7 8 7v8.5a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1V11Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" fill="currentColor" />
    </svg>
  );
}
