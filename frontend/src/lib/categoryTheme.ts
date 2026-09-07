// Single source of truth for per-category colour, shared by the homepage
// (icon row, hero carousel, promo banner), the categories listing page, and
// the category detail page banner — so "Electronics is blue" only has to be
// decided once. Categories without an explicit entry (any future category
// added on the backend before a colour is picked for it) fall back to the
// brand's own green rather than breaking.
//
// Every value here has to be a complete, literal Tailwind class string —
// Tailwind's build-time scanner can't see classes assembled from a
// dynamic `${hue}-900` template, so there's no shortcut around spelling
// each one out per category.
export interface CategoryTheme {
  /** Light tint background, for icon badges / small cards. */
  bgSoft: string;
  /** Icon/text colour on top of bgSoft, and on white hero/promo buttons. */
  text: string;
  /** Dark two-stop gradient, for the categories-listing card tiles. */
  gradientFrom: string;
  gradientTo: string;
  /** Solid button classes (background + hover), for category-themed CTAs. */
  button: string;
  /** Flat dark overlay tint for the hero banner / category detail header. */
  heroOverlay: string;
  /** Directional gradient start/middle for the hero banner fade. */
  heroGradientFrom: string;
  heroGradientVia: string;
  /** Colour for the highlighted headline word on a themed hero slide. */
  highlightText: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  electronics: {
    bgSoft: "bg-blue-50",
    text: "text-blue-600",
    gradientFrom: "from-blue-900",
    gradientTo: "to-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
    heroOverlay: "bg-blue-900/80",
    heroGradientFrom: "from-blue-900",
    heroGradientVia: "via-blue-900/90",
    highlightText: "text-blue-300",
  },
  fashion: {
    bgSoft: "bg-rose-50",
    text: "text-rose-600",
    gradientFrom: "from-rose-900",
    gradientTo: "to-rose-700",
    button: "bg-rose-600 hover:bg-rose-700",
    heroOverlay: "bg-rose-900/80",
    heroGradientFrom: "from-rose-900",
    heroGradientVia: "via-rose-900/90",
    highlightText: "text-rose-300",
  },
  "home-living": {
    bgSoft: "bg-amber-50",
    text: "text-amber-600",
    gradientFrom: "from-amber-900",
    gradientTo: "to-amber-700",
    button: "bg-amber-600 hover:bg-amber-700",
    heroOverlay: "bg-amber-900/80",
    heroGradientFrom: "from-amber-900",
    heroGradientVia: "via-amber-900/90",
    highlightText: "text-amber-300",
  },
};

const DEFAULT_CATEGORY_THEME: CategoryTheme = {
  bgSoft: "bg-primary-100",
  text: "text-primary-600",
  gradientFrom: "from-primary-700",
  gradientTo: "to-primary-500",
  button: "bg-primary-600 hover:bg-primary-700",
  heroOverlay: "bg-primary-600/80",
  heroGradientFrom: "from-primary-600",
  heroGradientVia: "via-primary-600/90",
  highlightText: "text-primary-500",
};

export function getCategoryTheme(slug?: string): CategoryTheme {
  return (slug && CATEGORY_THEMES[slug]) || DEFAULT_CATEGORY_THEME;
}
