import type { PrismaClient } from '@prisma/client';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_SITE_SETTINGS,
  seedSiteContent,
} from './seed-site-content';

describe('seedSiteContent', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = {
      siteSettings: { findUnique: jest.fn(), create: jest.fn() },
      heroSlide: { createMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('creates the settings singleton and all default slides on a fresh database', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(null);

    const result = await seedSiteContent(prisma as PrismaClient);

    expect(result).toBe('created');
    expect(prisma.siteSettings.create).toHaveBeenCalledWith({
      data: DEFAULT_SITE_SETTINGS,
    });
    expect(prisma.heroSlide.createMany).toHaveBeenCalledWith({
      data: DEFAULT_HERO_SLIDES.map((slide, order) => ({ ...slide, order })),
    });
    // Both writes go through one transaction so a half-seeded state (settings
    // but no slides) can't be left behind.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('numbers the default slides densely from 0 in the order they are listed', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue(null);

    await seedSiteContent(prisma as PrismaClient);

    const [call] = prisma.heroSlide.createMany.mock.calls[0] as [
      { data: Array<{ order: number }> },
    ];
    expect(call.data.map((s) => s.order)).toEqual([0, 1, 2, 3]);
  });

  it('is a no-op once the settings row exists — never overwrites admin content on later boots', async () => {
    prisma.siteSettings.findUnique.mockResolvedValue({
      id: 'singleton',
      siteName: 'Renamed By Admin',
    });

    const result = await seedSiteContent(prisma as PrismaClient);

    expect(result).toBe('already-present');
    expect(prisma.siteSettings.create).not.toHaveBeenCalled();
    expect(prisma.heroSlide.createMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
