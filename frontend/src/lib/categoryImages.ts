// Photos for the real, seeded categories (both top-level and their
// children), shared by the homepage category row and the category page
// banner. Anything without an entry falls back to the category's soft theme
// colour (carousel) or a plain gradient (banner) rather than breaking.
export const CATEGORY_IMAGES: Record<string, string> = {
  electronics: "/images/cat-electronics.jpg",
  computing: "/images/apex-mini-desktop-tower.jpg",
  audio: "/images/apex-elite-wireless-headphones.jpg",
  "home-living": "/images/cat-home.jpg",
  fashion: "/images/cat-fashion.jpg",
  "sports-outdoor": "/images/cat-outdoor.jpg",
  "camping-hiking": "/images/cat-outdoor.jpg",
  "fitness-equipment": "/images/cat-outdoor.jpg",
  "beauty-health": "/images/solace-diffuser-essential-oil-set.jpg",
};

export function getCategoryImage(slug: string): string | undefined {
  return CATEGORY_IMAGES[slug];
}
