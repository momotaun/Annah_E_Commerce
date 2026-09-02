import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    vendor: { findMany: jest.Mock };
    vendorOrderItem: { groupBy: jest.Mock };
    commission: { groupBy: jest.Mock };
    order: { count: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    returnRequest: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vendor: { findMany: jest.fn() },
      vendorOrderItem: { groupBy: jest.fn() },
      commission: { groupBy: jest.fn() },
      order: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      returnRequest: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getMarketplaceAnalytics', () => {
    beforeEach(() => {
      prisma.vendor.findMany.mockResolvedValue([]);
      prisma.vendorOrderItem.groupBy.mockResolvedValue([]);
      prisma.commission.groupBy.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);
    });

    it('only includes APPROVED vendors, and only their APPROVED-vendor line items, in the breakdown', async () => {
      await service.getMarketplaceAnalytics();

      expect(prisma.vendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'APPROVED' } }),
      );
      // Both the revenue-sum and the distinct-order-pair groupBy calls
      // must filter to APPROVED vendors too — otherwise a suspended
      // vendor's historical items would still count toward the totals.
      for (const call of prisma.vendorOrderItem.groupBy.mock.calls as [
        { where: { vendor: { status: string } } },
      ][]) {
        expect(call[0].where).toEqual({ vendor: { status: 'APPROVED' } });
      }
      const [commissionCall] = prisma.commission.groupBy.mock.calls[0] as [
        { where: { vendor: { status: string } } },
      ];
      expect(commissionCall.where).toEqual({ vendor: { status: 'APPROVED' } });
    });

    it('sums revenue and commission per vendor, and counts distinct orders across multiple groupBy rows', async () => {
      prisma.vendor.findMany.mockResolvedValue([
        { id: 'vendor-1', businessName: 'Vendor A' },
      ]);
      // Revenue groupBy: grouped by vendorId only — one summed row per vendor.
      prisma.vendorOrderItem.groupBy
        .mockResolvedValueOnce([
          {
            vendorId: 'vendor-1',
            _sum: { lineTotal: { toNumber: () => 250 } },
          },
        ])
        // Distinct-order-pair groupBy: real Postgres GROUP BY output — one
        // row per unique (vendorId, orderId) pair, already deduplicated by
        // the database. Two DIFFERENT orders here must count as 2; had a
        // vendor sold two items within the SAME order, GROUP BY would have
        // already collapsed that into a single row before it ever reaches
        // this code, so the JS loop below only needs to count rows.
        .mockResolvedValueOnce([
          { vendorId: 'vendor-1', orderId: 'order-1' },
          { vendorId: 'vendor-1', orderId: 'order-2' },
        ]);
      prisma.commission.groupBy.mockResolvedValue([
        { vendorId: 'vendor-1', _sum: { amount: { toNumber: () => 25 } } },
      ]);
      prisma.order.count.mockResolvedValue(50); // includes many non-vendor Phase 2 orders too

      const result = await service.getMarketplaceAnalytics();

      expect(result.totalOrders).toBe(50); // marketplace-wide, from order.count()
      expect(result.vendorBreakdown).toEqual([
        {
          vendorId: 'vendor-1',
          businessName: 'Vendor A',
          totalRevenue: '250.00',
          totalCommission: '25.00',
          totalOrders: 2,
        },
      ]);
      expect(result.totalRevenue).toBe('250.00');
      expect(result.totalCommissionEarned).toBe('25.00');
    });

    it('reports zero revenue, commission, and orders for an approved vendor with no sales yet', async () => {
      prisma.vendor.findMany.mockResolvedValue([
        { id: 'vendor-2', businessName: 'New Vendor' },
      ]);
      // groupBy calls simply have no row for a vendor with no items —
      // that's the real Postgres/Prisma behavior being modeled here.

      const result = await service.getMarketplaceAnalytics();

      expect(result.vendorBreakdown).toEqual([
        {
          vendorId: 'vendor-2',
          businessName: 'New Vendor',
          totalRevenue: '0.00',
          totalCommission: '0.00',
          totalOrders: 0,
        },
      ]);
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
      prisma.order.count.mockResolvedValue(1);

      const result = await service.listOrders({});

      expect(result.data[0].paymentStatus).toBe('SUCCEEDED'); // latest, not first
      expect(result.data[0].returnRequest).toBeNull();
      expect(result.data[0].customerEmail).toBe('jane@example.co.za');
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
      prisma.order.count.mockResolvedValue(1);

      const result = await service.listOrders({});

      expect(result.data[0].paymentStatus).toBeNull();
    });

    it('paginates using page/limit, defaulting to page 1 of 20', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(45);

      const result = await service.listOrders({});

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });

    it('computes skip from a non-default page and limit', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(45);

      await service.listOrders({ page: 3, limit: 10 });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
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
