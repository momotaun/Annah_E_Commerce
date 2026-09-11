import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';

describe('VendorsService', () => {
  let service: VendorsService;
  let prisma: any;
  let tx: any;
  let objectStorageService: jest.Mocked<ObjectStorageService>;

  beforeEach(async () => {
    tx = {
      vendor: { update: jest.fn(), count: jest.fn().mockResolvedValue(0) },
      user: { update: jest.fn() },
    };

    prisma = {
      vendor: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: { update: jest.fn() },
      $transaction: jest.fn((callback) => callback(tx)),
    };

    objectStorageService = {
      uploadVendorLogo: jest.fn(),
    } as unknown as jest.Mocked<ObjectStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ObjectStorageService, useValue: objectStorageService },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  describe('register', () => {
    it('allows a second (or further) vendor registration for the same user — no cap on concurrent stores/applications', async () => {
      prisma.vendor.create.mockResolvedValue({
        id: 'vendor-2',
        businessName: 'Second Co',
        contactEmail: 'second@co.com',
        status: 'PENDING',
        approvedAt: null,
      });

      await service.register('user-1', {
        businessName: 'Second Co',
        contactEmail: 'second@co.com',
      });

      expect(prisma.vendor.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          businessName: 'Second Co',
          contactEmail: 'second@co.com',
        },
      });
      // Registering never itself checks for an existing vendor row.
      expect(prisma.vendor.findUnique).not.toHaveBeenCalled();
    });

    it('creates a vendor in PENDING status by default (does not grant VENDOR role directly)', async () => {
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
      expect(prisma.user.update).not.toHaveBeenCalled();
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
      tx.vendor.count.mockResolvedValue(1); // this store, now APPROVED

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

    it('sets Vendor.status to SUSPENDED and demotes the User to CUSTOMER when that was their only approved store', async () => {
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
      tx.vendor.count.mockResolvedValue(0); // no approved stores left

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

    it('keeps the User at VENDOR role when suspending one of two stores while the other stays APPROVED', async () => {
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
      // A second, still-APPROVED store for the same user.
      tx.vendor.count.mockResolvedValue(1);

      await service.approve('vendor-1', { status: 'SUSPENDED' });

      expect(tx.vendor.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: 'APPROVED' },
      });
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'VENDOR' },
      });
    });
  });

  describe('findAllMine', () => {
    it('lists every vendor row for the user, any status', async () => {
      prisma.vendor.findMany.mockResolvedValue([
        { id: 'vendor-1', status: 'APPROVED' },
        { id: 'vendor-2', status: 'PENDING' },
      ]);

      const result = await service.findAllMine('user-1');

      expect(result).toHaveLength(2);
      expect(prisma.vendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('findMine', () => {
    it('throws NotFoundException when the store does not exist', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(service.findMine('user-1', 'vendor-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the store exists but belongs to someone else', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'someone-else',
      });

      await expect(service.findMine('user-1', 'vendor-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns the store regardless of status — a PENDING store still needs it to finish onboarding', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'PENDING',
      });

      const result = await service.findMine('user-1', 'vendor-1');

      expect(result.id).toBe('vendor-1');
      expect(prisma.vendor.findUnique).toHaveBeenCalledWith({
        where: { id: 'vendor-1' },
      });
    });
  });

  describe('updateMine', () => {
    const existing = {
      id: 'vendor-1',
      userId: 'user-1',
      businessName: 'Test Co',
      contactEmail: 'test@co.com',
      bio: null,
      logoUrl: null,
      status: 'PENDING',
    };

    it('throws NotFoundException when the store does not exist', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMine('user-1', 'vendor-1', {
          logoUrl: '/images/logo.png',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.vendor.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the store belongs to another user', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        ...existing,
        userId: 'someone-else',
      });

      await expect(
        service.updateMine('user-1', 'vendor-1', { businessName: 'Nope' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.vendor.update).not.toHaveBeenCalled();
    });

    it('only writes the fields that were actually sent', async () => {
      prisma.vendor.findUnique.mockResolvedValue(existing);
      prisma.vendor.update.mockResolvedValue({
        ...existing,
        logoUrl: '/images/logo.png',
      });

      await service.updateMine('user-1', 'vendor-1', {
        logoUrl: '/images/logo.png',
      });

      expect(prisma.vendor.update).toHaveBeenCalledWith({
        where: { id: 'vendor-1' },
        data: { logoUrl: '/images/logo.png' },
      });
    });

    it('passes an explicit null through to clear the logo or bio', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        ...existing,
        logoUrl: '/images/logo.png',
        bio: 'Old bio',
      });
      prisma.vendor.update.mockResolvedValue({ ...existing });

      await service.updateMine('user-1', 'vendor-1', {
        logoUrl: null,
        bio: null,
      });

      expect(prisma.vendor.update).toHaveBeenCalledWith({
        where: { id: 'vendor-1' },
        data: { logoUrl: null, bio: null },
      });
    });

    it('rejects a contactEmail already used by another vendor with a 409', async () => {
      prisma.vendor.findUnique
        .mockResolvedValueOnce(existing) // the caller's own record
        .mockResolvedValueOnce({ id: 'other-vendor' }); // the email lookup

      await expect(
        service.updateMine('user-1', 'vendor-1', {
          contactEmail: 'taken@co.com',
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.vendor.update).not.toHaveBeenCalled();
    });

    it('does not run the uniqueness check when contactEmail is unchanged', async () => {
      prisma.vendor.findUnique.mockResolvedValue(existing);
      prisma.vendor.update.mockResolvedValue(existing);

      await service.updateMine('user-1', 'vendor-1', {
        contactEmail: 'test@co.com',
      });

      // One lookup for the caller's record, none for the email.
      expect(prisma.vendor.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.vendor.update).toHaveBeenCalled();
    });
  });

  describe('uploadLogo', () => {
    it('rejects a user with no matching store before touching object storage', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadLogo('user-1', 'vendor-1', {} as Express.Multer.File),
      ).rejects.toThrow(NotFoundException);
      expect(objectStorageService.uploadVendorLogo).not.toHaveBeenCalled();
    });

    it('rejects a store that belongs to a different user', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'someone-else',
      });

      await expect(
        service.uploadLogo('user-1', 'vendor-1', {} as Express.Multer.File),
      ).rejects.toThrow(ForbiddenException);
      expect(objectStorageService.uploadVendorLogo).not.toHaveBeenCalled();
    });

    it('delegates to ObjectStorageService once ownership is confirmed', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'PENDING',
      });
      objectStorageService.uploadVendorLogo.mockResolvedValue(
        '/images/logo.png',
      );
      const file = { originalname: 'logo.png' } as Express.Multer.File;

      const url = await service.uploadLogo('user-1', 'vendor-1', file);

      expect(url).toBe('/images/logo.png');
      expect(objectStorageService.uploadVendorLogo).toHaveBeenCalledWith(file);
    });
  });
});
