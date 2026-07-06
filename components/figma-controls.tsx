import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { AssetIcon } from "./asset-icon";

type FigmaInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  kind?: "text" | "password" | "search";
};

export function FigmaInput({
  className = "",
  kind = "text",
  label,
  placeholder = "Placeholder",
  ...props
}: FigmaInputProps) {
  if (kind === "search") {
    return (
      <label
        className={`flex h-[38px] min-w-[140px] items-center gap-2 rounded-[4px] border border-[#d1d5db] bg-white px-3 py-2 ${className}`}
      >
        <span className="sr-only">{label ?? "검색"}</span>
        <AssetIcon className="h-4 w-4 shrink-0" name="search-input" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-normal text-[#1f2937] outline-none placeholder:text-[#9ca3af]"
          placeholder={placeholder}
          type="search"
          {...props}
        />
      </label>
    );
  }

  return (
    <label className={`flex flex-col gap-[6px] ${className}`}>
      {label ? (
        <span className="text-sm font-normal leading-none text-[#1f2937]">
          {label}
        </span>
      ) : null}
      <input
        className="h-[38px] min-w-[140px] rounded-[4px] border border-[#d1d5db] bg-white px-3 text-sm outline-none placeholder:text-[#9ca3af]"
        placeholder={placeholder}
        type={kind}
        {...props}
      />
    </label>
  );
}

type FigmaSelectProps = {
  children?: ReactNode;
  className?: string;
  label?: string;
};

export function FigmaSelect({
  children = "Select...",
  className = "",
  label,
}: FigmaSelectProps) {
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {label ? (
        <span className="text-sm font-normal leading-none text-[#1f2937]">
          {label}
        </span>
      ) : null}
      <button
        className="flex h-[38px] min-w-[140px] items-center justify-between rounded-[4px] border border-[#d1d5db] bg-white px-3 py-2 text-sm font-normal text-[#9ca3af]"
        type="button"
      >
        <span>{children}</span>
        <AssetIcon className="h-3 w-3" name="chevron-down" />
      </button>
    </div>
  );
}

type FigmaTagProps = HTMLAttributes<HTMLElement> & {
  active?: boolean;
  as?: "button" | "span";
  children: ReactNode;
};

export function FigmaTag({
  active = false,
  as = "span",
  children,
  className = "",
  ...props
}: FigmaTagProps) {
  const tagClassName = `flex h-[30px] items-center justify-center rounded-[5px] px-[9px] pb-[6px] pt-[7px] text-sm font-semibold leading-none ${
    active ? "bg-[#307cff] text-white" : "bg-[#f6f6f6] text-[#666]"
  } ${className}`;

  if (as === "button") {
    return (
      <button
        className={tagClassName}
        type="button"
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={tagClassName} {...props}>
      {children}
    </span>
  );
}

type PostActionIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  kind: "bookmark" | "heart" | "message";
};

export function PostActionIcon({
  active = false,
  className = "",
  kind,
  ...props
}: PostActionIconProps) {
  const iconName = {
    bookmark: active ? "bookmark-on" : "bookmark",
    heart: active ? "heart-small-on" : "heart-small",
    message: "message",
  } as const;

  return (
    <button
      className={`flex h-6 w-6 items-center justify-center ${className}`}
      type="button"
      {...props}
    >
      <AssetIcon className="h-6 w-6" name={iconName[kind]} />
    </button>
  );
}
