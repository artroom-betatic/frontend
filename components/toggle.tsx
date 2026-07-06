import type { ButtonHTMLAttributes } from "react";
import { AssetIcon } from "./asset-icon";

type ToggleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  label: string;
};

export function Toggle({ checked, className = "", label, ...props }: ToggleProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`flex h-7 w-11 items-center justify-center ${className}`}
      role="switch"
      type="button"
      {...props}
    >
      <AssetIcon
        aria-hidden="true"
        className="h-5 w-9"
        name={checked ? "toggle-on" : "toggle"}
      />
    </button>
  );
}
