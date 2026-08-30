import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VendorsService', () => {
  let service: VendorsService;
  let prisma: any;
  let tx: any;

  beforeEach(async () => {
    tx = {
      vendor: { update: jest.fn() },
      user: { update: jest.fn() },
    };

    prisma = {
      vendor: { findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn((callback) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  describe('register', () => {
    it('rejects a second vendor registration for the same user', async () => {
      prisma.vendor.findUnique.mockResolvedValue({ id: 'existing-vendor' });

      await expect(
        service.register('user-1', {
          businessName: 'Test Co',
          contactEmail: 'test@co.com',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.vendor.create).not.toHaveBeenCalled();
    });

    it('creates a vendor in PENDING status by default (does not grant VENDOR role directly)', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);
      prisma.vendor.create.mockResolvedValue({
        id: 'vendor-1',
        businessName: 'Test Co',
        contactEmail: 'test@co.com',
        status: 'PENDING',
        approvedAt: null,
      });

      await service.register('user-1', {
        businessName: 'Test Co',
        contactEmail: 'test@co.com',
      });

      // Registering alone must never touch User.role — only approve() does.
      expect(prisma.vendor.create).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('throws NotFoundException for a nonexistent vendor', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(
        service.approve('ghost-vendor', { status: 'APPROVED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('sets Vendor.status to APPROVED and promotes the underlying User to VENDOR role, in one transaction', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'PENDING',
      });
      tx.vendor.update.mockResolvedValue({
        id: 'vendor-1',
        status: 'APPROVED',
        approvedAt: new Date(),
      });

      await service.approve('vendor-1', { status: 'APPROVED' });

      expect(tx.vendor.update).toHaveBeenCalledWith({
        where: { id: 'vendor-1' },
        data: { status: 'APPROVED', approvedAt: expect.any(Date) },
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'VENDOR' },
      });
    });

    it('sets Vendor.status to SUSPENDED and demotes the User back to CUSTOMER role', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      tx.vendor.update.mockResolvedValue({
        id: 'vendor-1',
        status: 'SUSPENDED',
        approvedAt: null,
      });

      await service.approve('vendor-1', { status: 'SUSPENDED' });

      expect(tx.vendor.update).toHaveBeenCalledWith({
        where: { id: 'vendor-1' },
        data: { status: 'SUSPENDED', approvedAt: null },
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'CUSTOMER' },
      });
    });
  });
});