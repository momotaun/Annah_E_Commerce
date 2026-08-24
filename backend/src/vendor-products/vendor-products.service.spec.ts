import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorProductsService } from './vendor-products.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VendorProductsService', () => {
  let service: VendorProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vendor: { findUnique: jest.fn() },
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      category: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorProductsService,
        { provide: PrismaService, useValue: prisma },
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
  });
});
