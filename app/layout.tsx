import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artroom",
  description: "그림 작가와 팬을 연결하는 창작자 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
