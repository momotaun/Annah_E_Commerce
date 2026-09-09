import { cn } from "@/src/lib/utils";
import { SITE_NAME } from "@/src/lib/siteConfig";

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

// The one place that renders the brand mark — a colored square badge with
// the site's initial, plus the wordmark. Swap in an <Image> here instead
// of the badge span if a real logo file is ever introduced; every header
// (customer, vendor, admin, footer, error page) already renders through
// this component, so nothing else needs to change.
function Logo({
  theme = "light",
  size = "md",
  showBadge = true,
  showWordmark = true,
  wordmarkClassName,
  className,
}: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {showBadge && (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg font-bold",
            badgeSizes[size],
            badgeTheme[theme]
          )}
        >
          {SITE_NAME.charAt(0).toUpperCase()}
        </span>
      )}
      {showWordmark && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            wordmarkSizes[size],
            wordmarkTheme[theme],
            wordmarkClassName
          )}
        >
          {SITE_NAME}
        </span>
      )}
    </span>
  );
}

export default Logo;
