import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    vendor: { findMany: jest.Mock };
    order: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    returnRequest: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vendor: { findMany: jest.fn() },
      order: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      returnRequest: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getMarketplaceAnalytics', () => {
    it('only includes APPROVED vendors in the breakdown', async () => {
      prisma.vendor.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.getMarketplaceAnalytics();

      expect(prisma.vendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'APPROVED' } }),
      );
    });

    it('totalOrders reflects ALL platform orders, independent of vendor breakdown totals', async () => {
      prisma.vendor.findMany.mockResolvedValue([
        {
          id: 'vendor-1',
          businessName: 'Vendor A',
          vendorOrderItems: [
            {
              orderId: 'order-1',
              lineTotal: { toNumber: () => 100 },
              commission: { amount: { toNumber: () => 10 } },
            },
          ],
        },
      ]);
      prisma.order.count.mockResolvedValue(50); // includes many non-vendor Phase 2 orders too

      const result = await service.getMarketplaceAnalytics();

      expect(result.totalOrders).toBe(50); // marketplace-wide, from order.count()
      expect(result.vendorBreakdown[0].totalOrders).toBe(1); // per-vendor, from their own items only
    });
  });

  describe('listOrders', () => {
    it('maps the latest payment status and a null return request when none exists', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PAID',
          totalAmount: { toString: () => '500.00' },
          user: { email: 'jane@example.co.za' },
          payments: [{ status: 'FAILED' }, { status: 'SUCCEEDED' }],
          returnRequest: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.listOrders();

      expect(result[0].paymentStatus).toBe('SUCCEEDED'); // latest, not first
      expect(result[0].returnRequest).toBeNull();
      expect(result[0].customerEmail).toBe('jane@example.co.za');
    });

    it('reports a null payment status for an order with no payments at all', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PLACED',
          totalAmount: { toString: () => '500.00' },
          user: { email: 'jane@example.co.za' },
          payments: [],
          returnRequest: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.listOrders();

      expect(result[0].paymentStatus).toBeNull();
    });
  });

  describe('resolveReturnRequest', () => {
    it('throws NotFoundException for a nonexistent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.resolveReturnRequest('order-1', 'APPROVED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if no return request was filed', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        returnRequest: null,
      });

      await expect(
        service.resolveReturnRequest('order-1', 'APPROVED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects resolving a return request that was already resolved', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        returnRequest: { status: 'APPROVED' },
      });

      await expect(
        service.resolveReturnRequest('order-1', 'REJECTED'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.returnRequest.update).not.toHaveBeenCalled();
    });

    it('approves a pending return request and stamps resolvedAt', async () => {
      const createdAt = new Date();
      const resolvedAt = new Date();
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'PAID',
        totalAmount: { toString: () => '500.00' },
        user: { email: 'jane@example.co.za' },
        payments: [{ status: 'SUCCEEDED' }],
        returnRequest: {
          status: 'PENDING',
          reason: 'Wrong size',
          createdAt,
          resolvedAt: null,
        },
        createdAt,
      });
      prisma.returnRequest.update.mockResolvedValue({
        status: 'APPROVED',
        reason: 'Wrong size',
        createdAt,
        resolvedAt,
      });

      const result = await service.resolveReturnRequest('order-1', 'APPROVED');

      const [updateCall] = prisma.returnRequest.update.mock.calls[0] as [
        {
          where: { orderId: string };
          data: { status: string; resolvedAt: Date };
        },
      ];
      expect(updateCall.where).toEqual({ orderId: 'order-1' });
      expect(updateCall.data.status).toBe('APPROVED');
      expect(updateCall.data.resolvedAt).toBeInstanceOf(Date);
      expect(result.returnRequest?.status).toBe('APPROVED');
      expect(result.returnRequest?.resolvedAt).toEqual(resolvedAt);
    });
  });
});
