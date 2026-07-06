import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "follow" | "following";
};

export function ActionButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: ActionButtonProps) {
  const styles = {
    primary: "bg-[#307cff] text-white",
    secondary: "bg-[rgba(208,213,221,0.2)] text-black",
    danger: "bg-[rgba(208,213,221,0.2)] text-black",
    follow: "bg-[#f0f2f5] text-black",
    following: "bg-[#f0f2f5] text-black",
  }[variant];

  return (
    <button
      className={`min-h-6 min-w-[45px] rounded-[5px] px-3 py-[5px] text-xs font-medium leading-none ${styles} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
