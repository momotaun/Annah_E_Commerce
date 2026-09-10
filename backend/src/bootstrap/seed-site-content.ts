import type { PrismaClient } from '@prisma/client';

// Default site branding content: the SiteSettings singleton and the four
// homepage hero slides. Unlike prisma/seed.ts this is safe to run in
// production — it contains no accounts or credentials, only the copy the
// homepage shipped with before this content became admin-editable.
//
// Runs on every backend boot (see the Dockerfile CMD) and is a strict
// first-run operation: it only does anything when the SiteSettings row
// doesn't exist yet. Once it does, an admin owns this content — later edits
// are never overwritten, and deleting every slide on purpose stays deleted.
// That's deliberately stricter than the upsert/"fill in what's missing"
// pattern the dev seed uses for products and categories.

export const DEFAULT_SITE_SETTINGS = {
  id: 'singleton',
  siteName: 'EliteCommerce',
  logoUrl: null,
  announcementText: 'FREE SHIPPING ON ORDERS OVER R1000!',
} as const;

export const DEFAULT_HERO_SLIDES = [
  {
    eyebrow: 'A Better Way To Shop',
    headlineBefore: 'Quality products for a',
    highlight: 'brighter',
    headlineAfter: 'everyday',
    subheading: 'Top brands. Great prices. A more sustainable tomorrow.',
    imageUrl: '/images/hero-desk.jpg',
    ctaLabel: 'Shop Now',
    ctaHref: '/catalogue',
    badgeValue: '50%',
    badgeCaption: 'Selected items',
    categorySlug: null,
  },
  {
    eyebrow: 'New Season',
    headlineBefore: 'Tailored style,',
    highlight: 'elevated',
    headlineAfter: 'everyday',
    subheading: 'Premium fashion essentials, cut for confidence.',
    imageUrl: '/images/cat-fashion.jpg',
    ctaLabel: 'Shop Fashion',
    ctaHref: '/categories/fashion',
    badgeValue: '25%',
    badgeCaption: 'New arrivals',
    categorySlug: 'fashion',
  },
  {
    eyebrow: 'Tech For Tomorrow',
    headlineBefore: 'Smarter tech,',
    highlight: 'greener',
    headlineAfter: 'choices',
    subheading: 'Innovation that works as hard as you do.',
    imageUrl: '/images/cat-electronics.jpg',
    ctaLabel: 'Shop Electronics',
    ctaHref: '/categories/electronics',
    badgeValue: '30%',
    badgeCaption: 'Selected items',
    categorySlug: 'electronics',
  },
  {
    eyebrow: 'Weekend Ready',
    headlineBefore: 'Gear up for your next',
    highlight: 'adventure',
    headlineAfter: '',
    subheading: 'Durable essentials built to go the distance.',
    imageUrl: '/images/cat-outdoor.jpg',
    ctaLabel: 'Shop Now',
    ctaHref: '/catalogue',
    badgeValue: '20%',
    badgeCaption: 'Selected items',
    categorySlug: null,
  },
] as const;

export type SeedSiteContentResult = 'created' | 'already-present';

export async function seedSiteContent(
  prisma: PrismaClient,
): Promise<SeedSiteContentResult> {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: DEFAULT_SITE_SETTINGS.id },
  });
  if (existing) {
    return 'already-present';
  }

  await prisma.$transaction([
    prisma.siteSettings.create({ data: DEFAULT_SITE_SETTINGS }),
    prisma.heroSlide.createMany({
      data: DEFAULT_HERO_SLIDES.map((slide, order) => ({ ...slide, order })),
    }),
  ]);

  return 'created';
}
