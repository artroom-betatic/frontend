import type { ReactNode } from "react";

type AppFrameProps = {
  children: ReactNode;
  className?: string;
};

export function AppFrame({ children, className = "" }: AppFrameProps) {
  return (
    <div className={`mx-auto min-h-screen w-full max-w-app bg-white ${className}`}>
      {children}
    </div>
  );
}
