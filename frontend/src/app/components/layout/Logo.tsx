"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";

export interface LogoProps {
  // "light" for a light/white background (colored badge, dark wordmark);
  // "dark" for a colored/dark background like the footer (white badge,
  // white wordmark).
  theme?: "light" | "dark";
  size?: "sm" | "md";
  showBadge?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

const badgeSizes = {
  sm: "h-8 w-8 text-lg",
  md: "h-9 w-9 text-lg",
};

const badgePixelSizes = {
  sm: 32,
  md: 36,
};

const wordmarkSizes = {
  sm: "text-lg",
  md: "text-xl",
};

const badgeTheme = {
  light: "bg-primary-600 text-white",
  dark: "bg-white text-primary-600",
};

const wordmarkTheme = {
  light: "text-gray-900",
  dark: "text-white",
};

// The one place that renders the brand mark. Every header (customer,
// vendor, admin, footer, error page) already renders through this
// component, so nothing else needs to change when the admin sets a real
// logo image — it just swaps in for the generated initial badge below.
function Logo({
  theme = "light",
  size = "md",
  showBadge = true,
  showWordmark = true,
  wordmarkClassName,
  className,
}: LogoProps) {
  const { siteName, logoUrl } = useSiteSettings();

  return (
    <span className={cn("flex items-center gap-2", className)}>
      {showBadge &&
        (logoUrl ? (
          <Image
            src={logoUrl}
            alt={siteName}
            width={badgePixelSizes[size]}
            height={badgePixelSizes[size]}
            className={cn("shrink-0 rounded-lg object-contain", badgeSizes[size])}
          />
        ) : (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg font-bold",
              badgeSizes[size],
              badgeTheme[theme]
            )}
          >
            {siteName.charAt(0).toUpperCase()}
          </span>
        ))}
      {showWordmark && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            wordmarkSizes[size],
            wordmarkTheme[theme],
            wordmarkClassName
          )}
        >
          {siteName}
        </span>
      )}
    </span>
  );
}

export default Logo;
