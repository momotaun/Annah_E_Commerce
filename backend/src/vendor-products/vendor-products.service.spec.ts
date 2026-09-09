import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';

describe('VendorProductsService', () => {
  let service: VendorProductsService;
  let prisma: any;
  let objectStorageService: jest.Mocked<ObjectStorageService>;

  beforeEach(async () => {
    prisma = {
      vendor: { findUnique: jest.fn() },
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null), // slug uniqueness check
        create: jest.fn(),
        update: jest.fn(),
      },
      category: { findUnique: jest.fn() },
    };

    objectStorageService = {
      uploadProductImage: jest.fn(),
    } as unknown as jest.Mocked<ObjectStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ObjectStorageService, useValue: objectStorageService },
      ],
    }).compile();

    service = module.get<VendorProductsService>(VendorProductsService);
  });

  describe('requireVendor gate (exercised via findAllForVendor)', () => {
    it('throws NotFoundException if the user has no vendor account at all', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(service.findAllForVendor('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if the vendor account is still PENDING', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'PENDING',
      });

      await expect(service.findAllForVendor('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException if the vendor account is SUSPENDED', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'SUSPENDED',
      });

      await expect(service.findAllForVendor('user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('succeeds and scopes the query to only this vendor’s products when APPROVED', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findMany.mockResolvedValue([]);

      await service.findAllForVendor('user-1');

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { vendorId: 'vendor-1' } }),
      );
    });
  });

  describe('update — cross-vendor isolation', () => {
    it('rejects updating a product owned by a different vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue({
        id: 'product-1',
        vendorId: 'some-other-vendor',
      });

      await expect(
        service.update('user-1', 'product-1', { price: 99 }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('allows updating a product this vendor actually owns', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue({
        id: 'product-1',
        vendorId: 'vendor-1',
      });
      prisma.product.update.mockResolvedValue({
        id: 'product-1',
        vendorId: 'vendor-1',
        price: { toString: () => '99.00' },
      });

      await service.update('user-1', 'product-1', { price: 99 });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { price: 99 },
      });
    });
  });

  describe('create', () => {
    it('rejects a duplicate SKU', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue({
        id: 'existing-product',
        sku: 'DUPLICATE-SKU',
      });

      await expect(
        service.create('user-1', {
          name: 'New Product',
          sku: 'DUPLICATE-SKU',
          price: 100,
          categoryId: 'cat-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects creating a product against a nonexistent category', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue(null); // SKU is free
      prisma.category.findUnique.mockResolvedValue(null); // category doesn't exist

      await expect(
        service.create('user-1', {
          name: 'New Product',
          sku: 'NEW-SKU',
          price: 100,
          categoryId: 'ghost-category',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('derives imageUrl from the first uploaded image when not set explicitly', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      prisma.product.create.mockResolvedValue({
        id: 'product-1',
        price: { toString: () => '100.00' },
      });

      await service.create('user-1', {
        name: 'Gallery Product',
        sku: 'GALLERY-SKU',
        price: 100,
        categoryId: 'cat-1',
        images: ['/images/one.jpg', '/images/two.jpg'],
      });

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            imageUrl: '/images/one.jpg',
            images: ['/images/one.jpg', '/images/two.jpg'],
          }),
        }),
      );
    });

    it('defaults a new product to PUBLISHED when no status is given', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      prisma.product.create.mockResolvedValue({
        id: 'product-1',
        price: { toString: () => '100.00' },
      });

      await service.create('user-1', {
        name: 'No Status Product',
        sku: 'NO-STATUS-SKU',
        price: 100,
        categoryId: 'cat-1',
      });

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });

    it('saves a draft with a price but no images at all', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });
      prisma.product.create.mockResolvedValue({
        id: 'product-1',
        price: { toString: () => '100.00' },
      });

      const result = await service.create('user-1', {
        name: 'Draft Product',
        sku: 'DRAFT-SKU',
        price: 100,
        categoryId: 'cat-1',
        status: 'DRAFT',
      });

      expect(result.price).toBe('100.00');
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'DRAFT',
            imageUrl: undefined,
          }),
        }),
      );
    });
  });

  describe('uploadProductImage', () => {
    it('rejects an unapproved vendor before ever touching object storage', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'PENDING',
      });

      await expect(
        service.uploadProductImage('user-1', {} as Express.Multer.File),
      ).rejects.toThrow(ForbiddenException);
      expect(objectStorageService.uploadProductImage).not.toHaveBeenCalled();
    });

    it('delegates to ObjectStorageService once the vendor is confirmed approved', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      objectStorageService.uploadProductImage.mockResolvedValue(
        '/images/uploaded.jpg',
      );
      const file = { originalname: 'photo.jpg' } as Express.Multer.File;

      const url = await service.uploadProductImage('user-1', file);

      expect(url).toBe('/images/uploaded.jpg');
      expect(objectStorageService.uploadProductImage).toHaveBeenCalledWith(
        file,
      );
    });
  });
});
