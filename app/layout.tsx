import type { Metadata } from "next";
import { AppSettingsBridge } from "@/components/app-settings-bridge";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artroom",
  description: "그림 작가와 팬을 연결하는 창작자 플랫폼.",
};

const appSettingsInitScript = `
(function () {
  try {
    var themeTokenSets = {
      dark: {
        "--background": "#0d1117",
        "--danger": "#f87171",
        "--foreground": "#f3f4f6",
        "--inactive": "#596273",
        "--line": "#303847",
        "--muted": "#a5adba",
        "--panel": "#171c24",
        "--primary": "#6ea1ff",
        "--subtle": "#c5cad3"
      },
      light: {
        "--background": "#eef0f3",
        "--danger": "#fca5a5",
        "--foreground": "#1f2937",
        "--inactive": "#d0d5dd",
        "--line": "#e5e7eb",
        "--muted": "#929aa8",
        "--panel": "#f9fafb",
        "--primary": "#307cff",
        "--subtle": "#666666"
      }
    };
    var rawSettings = window.localStorage.getItem("artroom:app-settings");
    var settings = rawSettings ? JSON.parse(rawSettings) : {};
    var themeMode = settings && typeof settings.themeMode === "string"
      ? settings.themeMode
      : "system";

    if (themeMode !== "system" && themeMode !== "light" && themeMode !== "dark") {
      themeMode = "system";
    }

    var resolvedThemeMode = themeMode === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : themeMode === "dark"
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = resolvedThemeMode;
    document.documentElement.dataset.themeMode = themeMode;
    document.documentElement.style.colorScheme = resolvedThemeMode;
    Object.keys(themeTokenSets[resolvedThemeMode]).forEach(function (tokenName) {
      document.documentElement.style.setProperty(
        tokenName,
        themeTokenSets[resolvedThemeMode][tokenName]
      );
    });
  } catch (error) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themeMode = "system";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: appSettingsInitScript }} />
        <AppSettingsBridge />
        {children}
      </body>
    </html>
  );
}
