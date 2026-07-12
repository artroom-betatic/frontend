"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  applyThemeMode,
  defaultAppSettings,
  readAppSettings,
  subscribeAppSettingsChange,
} from "@/lib/app-settings";

export function AppSettingsBridge() {
  const settings = useSyncExternalStore(
    subscribeAppSettingsChange,
    readAppSettings,
    () => defaultAppSettings,
  );

  useEffect(() => {
    applyThemeMode(settings.themeMode);
  }, [settings.themeMode]);

  useEffect(() => {
    if (settings.themeMode !== "system" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeMode("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.themeMode]);

  return null;
}
