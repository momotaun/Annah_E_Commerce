"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SITE_NAME } from "@/src/lib/siteConfig";
import { SiteSettings } from "@/src/lib/api/site-settings";

interface SiteSettingsContextValue {
  siteName: string;
  logoUrl: string | null;
  announcementText: string | null;
  refresh: (settings: SiteSettings) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: SiteSettings | null;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);

  const value: SiteSettingsContextValue = {
    siteName: settings?.siteName ?? SITE_NAME,
    logoUrl: settings?.logoUrl ?? null,
    announcementText: settings?.announcementText ?? null,
    refresh: setSettings,
  };

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  return ctx;
}
