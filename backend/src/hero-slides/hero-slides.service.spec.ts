import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HeroSlidesService } from './hero-slides.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';

const baseSlideFields = {
  eyebrow: 'Eyebrow',
  headlineBefore: 'Before',
  highlight: 'Highlight',
  headlineAfter: 'After',
  subheading: 'Subheading',
  imageUrl: '/images/slide.jpg',
  ctaLabel: 'Shop Now',
  ctaHref: '/catalogue',
  badgeValue: '10%',
  badgeCaption: 'Selected items',
  categorySlug: null,
};

describe('HeroSlidesService', () => {
  let service: HeroSlidesService;
  let prisma: any;
  let objectStorageService: jest.Mocked<ObjectStorageService>;

  beforeEach(async () => {
    prisma = {
      heroSlide: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue(undefined),
    };

    objectStorageService = {
      uploadSiteAsset: jest.fn(),
    } as unknown as jest.Mocked<ObjectStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroSlidesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ObjectStorageService, useValue: objectStorageService },
      ],
    }).compile();

    service = module.get<HeroSlidesService>(HeroSlidesService);
  });

  describe('findAll', () => {
    it('returns slides ordered ascending by order', async () => {
      prisma.heroSlide.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.heroSlide.findMany).toHaveBeenCalledWith({
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('computes order from the current slide count, ignoring any client-supplied order', async () => {
      prisma.heroSlide.count.mockResolvedValue(4);
      prisma.heroSlide.create.mockResolvedValue({
        id: 'slide-5',
        order: 4,
        ...baseSlideFields,
      });

      await service.create({ ...baseSlideFields });

      expect(prisma.heroSlide.create).toHaveBeenCalledWith({
        data: { ...baseSlideFields, order: 4 },
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the slide does not exist', async () => {
      prisma.heroSlide.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-slide', { ...baseSlideFields }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.heroSlide.update).not.toHaveBeenCalled();
    });

    it('updates an existing slide', async () => {
      prisma.heroSlide.findUnique.mockResolvedValue({
        id: 'slide-1',
        order: 0,
        ...baseSlideFields,
      });
      prisma.heroSlide.update.mockResolvedValue({
        id: 'slide-1',
        order: 0,
        ...baseSlideFields,
        eyebrow: 'Updated Eyebrow',
      });

      await service.update('slide-1', {
        ...baseSlideFields,
        eyebrow: 'Updated Eyebrow',
      });

      expect(prisma.heroSlide.update).toHaveBeenCalledWith({
        where: { id: 'slide-1' },
        data: { ...baseSlideFields, eyebrow: 'Updated Eyebrow' },
      });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the slide does not exist', async () => {
      prisma.heroSlide.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-slide')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.heroSlide.delete).not.toHaveBeenCalled();
    });

    it('deletes the slide and re-numbers the remaining slides densely', async () => {
      prisma.heroSlide.findUnique.mockResolvedValue({
        id: 'slide-2',
        order: 1,
        ...baseSlideFields,
      });
      prisma.heroSlide.findMany.mockResolvedValue([
        { id: 'slide-1', order: 0 },
        { id: 'slide-3', order: 2 },
      ]);

      await service.remove('slide-2');

      expect(prisma.heroSlide.delete).toHaveBeenCalledWith({
        where: { id: 'slide-2' },
      });
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.heroSlide.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'slide-1' },
        data: { order: 0 },
      });
      expect(prisma.heroSlide.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'slide-3' },
        data: { order: 1 },
      });
    });
  });

  describe('reorder', () => {
    it('rejects a set of ids that does not exactly match the existing slides', async () => {
      prisma.heroSlide.findMany.mockResolvedValue([
        { id: 'slide-1' },
        { id: 'slide-2' },
      ]);

      await expect(service.reorder(['slide-1'])).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an id that does not belong to any existing slide', async () => {
      prisma.heroSlide.findMany.mockResolvedValueOnce([
        { id: 'slide-1' },
        { id: 'slide-2' },
      ]);

      await expect(service.reorder(['slide-1', 'ghost-slide'])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('writes sequential order values for a valid full set of ids', async () => {
      prisma.heroSlide.findMany.mockResolvedValueOnce([
        { id: 'slide-1' },
        { id: 'slide-2' },
      ]);
      prisma.heroSlide.findMany.mockResolvedValueOnce([]); // findAll() at the end

      await service.reorder(['slide-2', 'slide-1']);

      expect(prisma.heroSlide.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'slide-2' },
        data: { order: 0 },
      });
      expect(prisma.heroSlide.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'slide-1' },
        data: { order: 1 },
      });
    });
  });

  describe('uploadImage', () => {
    it('delegates to ObjectStorageService.uploadSiteAsset', async () => {
      objectStorageService.uploadSiteAsset.mockResolvedValue(
        '/site-assets/slide.jpg',
      );
      const file = { originalname: 'slide.jpg' } as Express.Multer.File;

      const url = await service.uploadImage(file);

      expect(url).toBe('/site-assets/slide.jpg');
      expect(objectStorageService.uploadSiteAsset).toHaveBeenCalledWith(file);
    });
  });
});
