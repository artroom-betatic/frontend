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
    primary: "bg-primary text-white",
    secondary: "bg-line/20 text-black",
    danger: "bg-line/20 text-black",
    follow: "bg-panel text-black",
    following: "bg-panel text-black",
  }[variant];

  return (
    <button
      className={`min-h-6 min-w-11 rounded-md px-3 py-1.25 text-xs font-medium leading-none ${styles} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
