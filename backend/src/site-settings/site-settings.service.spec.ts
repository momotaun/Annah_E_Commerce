import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';

describe('SiteSettingsService', () => {
  let service: SiteSettingsService;
  let prisma: any;
  let objectStorageService: jest.Mocked<ObjectStorageService>;

  beforeEach(async () => {
    prisma = {
      siteSettings: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    objectStorageService = {
      uploadSiteAsset: jest.fn(),
    } as unknown as jest.Mocked<ObjectStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteSettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ObjectStorageService, useValue: objectStorageService },
      ],
    }).compile();

    service = module.get<SiteSettingsService>(SiteSettingsService);
  });

  describe('get', () => {
    it('throws NotFoundException when the singleton row has not been seeded', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue(null);

      await expect(service.get()).rejects.toThrow(NotFoundException);
    });

    it('returns the seeded settings', async () => {
      const updatedAt = new Date();
      prisma.siteSettings.findUnique.mockResolvedValue({
        id: 'singleton',
        siteName: 'EliteCommerce',
        logoUrl: null,
        announcementText: 'FREE SHIPPING ON ORDERS OVER R1000!',
        updatedAt,
      });

      const result = await service.get();

      expect(result).toEqual({
        siteName: 'EliteCommerce',
        logoUrl: null,
        announcementText: 'FREE SHIPPING ON ORDERS OVER R1000!',
        updatedAt,
      });
    });
  });

  describe('update', () => {
    it('throws NotFoundException when the singleton row has not been seeded', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue(null);

      await expect(service.update({ siteName: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.siteSettings.update).not.toHaveBeenCalled();
    });

    it('updates the singleton row with the given fields', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({
        id: 'singleton',
        siteName: 'Old Name',
        logoUrl: null,
        announcementText: null,
        updatedAt: new Date(),
      });
      const updatedAt = new Date();
      prisma.siteSettings.update.mockResolvedValue({
        id: 'singleton',
        siteName: 'New Name',
        logoUrl: '/site-assets/logo.png',
        announcementText: 'Sale now on!',
        updatedAt,
      });

      const result = await service.update({
        siteName: 'New Name',
        logoUrl: '/site-assets/logo.png',
        announcementText: 'Sale now on!',
      });

      expect(prisma.siteSettings.update).toHaveBeenCalledWith({
        where: { id: 'singleton' },
        data: {
          siteName: 'New Name',
          logoUrl: '/site-assets/logo.png',
          announcementText: 'Sale now on!',
        },
      });
      expect(result.siteName).toBe('New Name');
    });

    it('passes through an explicit null to clear a nullable field', async () => {
      prisma.siteSettings.findUnique.mockResolvedValue({
        id: 'singleton',
        siteName: 'EliteCommerce',
        logoUrl: '/site-assets/logo.png',
        announcementText: 'Sale now on!',
        updatedAt: new Date(),
      });
      prisma.siteSettings.update.mockResolvedValue({
        id: 'singleton',
        siteName: 'EliteCommerce',
        logoUrl: null,
        announcementText: null,
        updatedAt: new Date(),
      });

      await service.update({
        siteName: 'EliteCommerce',
        logoUrl: null,
        announcementText: null,
      });

      expect(prisma.siteSettings.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            logoUrl: null,
            announcementText: null,
          }),
        }),
      );
    });
  });

  describe('uploadLogo', () => {
    it('delegates to ObjectStorageService.uploadSiteAsset', async () => {
      objectStorageService.uploadSiteAsset.mockResolvedValue(
        '/site-assets/logo.png',
      );
      const file = { originalname: 'logo.png' } as Express.Multer.File;

      const url = await service.uploadLogo(file);

      expect(url).toBe('/site-assets/logo.png');
      expect(objectStorageService.uploadSiteAsset).toHaveBeenCalledWith(file);
    });
  });
});
