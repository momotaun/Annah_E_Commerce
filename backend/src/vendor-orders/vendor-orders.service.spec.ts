import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VendorOrdersService } from './vendor-orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MAILER } from '../mailer/mailer.module';
import { Mailer } from '../mailer/mailer.interface';

describe('VendorOrdersService', () => {
  let service: VendorOrdersService;
  let prisma: {
    vendor: { findUnique: jest.Mock };
    vendorOrderItem: { findMany: jest.Mock; updateMany: jest.Mock };
    order: { findUnique: jest.Mock; update: jest.Mock };
  };
  let mailer: jest.Mocked<Mailer>;

  beforeEach(async () => {
    prisma = {
      vendor: { findUnique: jest.fn() },
      vendorOrderItem: { findMany: jest.fn(), updateMany: jest.fn() },
      order: { findUnique: jest.fn(), update: jest.fn() },
    };

    mailer = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendInvoiceEmail: jest.fn().mockResolvedValue(undefined),
      sendOrderStatusEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorOrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MAILER, useValue: mailer },
      ],
    }).compile();

    service = module.get<VendorOrdersService>(VendorOrdersService);
  });

  describe('ownership gate (exercised via getDashboard)', () => {
    it('throws NotFoundException when the store does not exist', async () => {
      prisma.vendor.findUnique.mockResolvedValue(null);

      await expect(service.getDashboard('user-1', 'vendor-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when the store belongs to a different user — a user with two stores can't reach store B's data through store A's vendorId", async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-B',
        userId: 'someone-else',
        status: 'APPROVED',
      });

      await expect(service.getDashboard('user-1', 'vendor-B')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.vendorOrderItem.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('counts distinct orders, not line items, even when one order has multiple items', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      const today = new Date();
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        {
          orderId: 'order-1',
          productId: 'product-1',
          product: { name: 'Widget' },
          quantity: 2,
          lineTotal: { toNumber: () => 200 },
          commission: { amount: { toNumber: () => 20 } },
          order: { createdAt: today, status: 'PLACED' },
        },
        {
          orderId: 'order-1', // same order, second line item
          productId: 'product-2',
          product: { name: 'Gadget' },
          quantity: 1,
          lineTotal: { toNumber: () => 100 },
          commission: { amount: { toNumber: () => 10 } },
          order: { createdAt: today, status: 'PLACED' },
        },
        {
          orderId: 'order-2',
          productId: 'product-1',
          product: { name: 'Widget' },
          quantity: 1,
          lineTotal: { toNumber: () => 50 },
          commission: { amount: { toNumber: () => 5 } },
          order: { createdAt: today, status: 'DELIVERED' },
        },
      ]);

      const result = await service.getDashboard('user-1', 'vendor-1');

      expect(result.totalOrders).toBe(2); // two distinct orders, not three line items
      expect(result.totalItemsSold).toBe(4); // 2 + 1 + 1
      expect(result.totalRevenue).toBe('350.00');
      expect(result.totalCommission).toBe('35.00');
      expect(result.netEarnings).toBe('315.00');

      // 30 zero-filled daily buckets, today's bucket carrying all of
      // today's revenue and both distinct orders.
      expect(result.revenueOverTime).toHaveLength(30);
      const todayBucket =
        result.revenueOverTime[result.revenueOverTime.length - 1];
      expect(todayBucket.revenue).toBe(350);
      expect(todayBucket.orders).toBe(2);
      expect(result.revenueOverTime[0].revenue).toBe(0);

      // Distinct orders per status, not line items.
      expect(result.ordersByStatus).toEqual(
        expect.arrayContaining([
          { status: 'PLACED', count: 1 },
          { status: 'DELIVERED', count: 1 },
        ]),
      );

      // Widget appears on both orders (200 + 50 = 250 revenue, 3 units);
      // sorted by revenue descending.
      expect(result.topProducts[0]).toEqual({
        productId: 'product-1',
        productName: 'Widget',
        quantitySold: 3,
        revenue: 250,
      });
      expect(result.topProducts[1]).toEqual({
        productId: 'product-2',
        productName: 'Gadget',
        quantitySold: 1,
        revenue: 100,
      });
    });

    it('handles a vendor with zero sales without dividing by zero or crashing', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      prisma.vendorOrderItem.findMany.mockResolvedValue([]);

      const result = await service.getDashboard('user-1', 'vendor-1');

      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe('0.00');
      expect(result.netEarnings).toBe('0.00');
      expect(result.revenueOverTime).toHaveLength(30);
      expect(result.revenueOverTime.every((point) => point.revenue === 0)).toBe(
        true,
      );
      expect(result.ordersByStatus).toEqual([]);
      expect(result.topProducts).toEqual([]);
    });

    it('ignores order-item activity older than the 30-day revenue window', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
      const wayInThePast = new Date();
      wayInThePast.setDate(wayInThePast.getDate() - 90);
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        {
          orderId: 'order-old',
          productId: 'product-1',
          product: { name: 'Widget' },
          quantity: 1,
          lineTotal: { toNumber: () => 500 },
          commission: { amount: { toNumber: () => 50 } },
          order: { createdAt: wayInThePast, status: 'DELIVERED' },
        },
      ]);

      const result = await service.getDashboard('user-1', 'vendor-1');

      // Lifetime totals still include it...
      expect(result.totalRevenue).toBe('500.00');
      // ...but the 30-day chart has nothing to show for it.
      expect(result.revenueOverTime.every((point) => point.revenue === 0)).toBe(
        true,
      );
    });
  });

  describe('markShipped', () => {
    const baseItem = {
      id: 'item-1',
      orderId: 'order-1',
      productId: 'product-1',
      product: { name: 'Widget' },
      quantity: 1,
      lineTotal: { toString: () => '100.00' },
      commission: null,
      shippedAt: null,
      deliveredAt: null,
    };

    beforeEach(() => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
    });

    it('throws NotFoundException if the vendor has no items on that order', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([]);

      await expect(
        service.markShipped('user-1', 'vendor-1', 'order-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects marking a cancelled order shipped', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'CANCELLED' } },
      ]);

      await expect(
        service.markShipped('user-1', 'vendor-1', 'order-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('rejects shipping an order that has not been paid for yet', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PLACED' } },
      ]);

      await expect(
        service.markShipped('user-1', 'vendor-1', 'order-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('rejects marking already-shipped items shipped again', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PAID' }, shippedAt: new Date() },
      ]);

      await expect(
        service.markShipped('user-1', 'vendor-1', 'order-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it("marks this vendor's items shipped and flips Order.status to SHIPPED when they are the only vendor on the order", async () => {
      prisma.vendorOrderItem.findMany
        .mockResolvedValueOnce([{ ...baseItem, order: { status: 'PAID' } }]) // ownership lookup
        .mockResolvedValueOnce([{ ...baseItem, shippedAt: new Date() }]) // recompute: all items on order
        .mockResolvedValueOnce([
          { ...baseItem, order: { status: 'SHIPPED' }, shippedAt: new Date() },
        ]); // refetch for response
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'PAID',
        user: { email: 'jane@example.co.za', firstName: 'Jane' },
      });

      const result = await service.markShipped('user-1', 'vendor-1', 'order-1');

      const [updateManyCall] = prisma.vendorOrderItem.updateMany.mock
        .calls[0] as [
        {
          where: { vendorId: string; orderId: string };
          data: { shippedAt: Date };
        },
      ];
      expect(updateManyCall.where).toEqual({
        vendorId: 'vendor-1',
        orderId: 'order-1',
      });
      expect(updateManyCall.data.shippedAt).toBeInstanceOf(Date);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'SHIPPED' },
      });
      expect(result[0].shippedAt).not.toBeNull();

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, no `this` binding involved
      expect(mailer.sendOrderStatusEmail).toHaveBeenCalledWith({
        to: 'jane@example.co.za',
        firstName: 'Jane',
        orderId: 'order-1',
        status: 'SHIPPED',
      });
    });

    it('does not flip Order.status when a different vendor on the same order has not shipped yet', async () => {
      prisma.vendorOrderItem.findMany
        .mockResolvedValueOnce([{ ...baseItem, order: { status: 'PAID' } }]) // ownership lookup
        .mockResolvedValueOnce([
          {
            ...baseItem,
            id: 'item-1',
            vendorId: 'vendor-1',
            shippedAt: new Date(),
          },
          { ...baseItem, id: 'item-2', vendorId: 'vendor-2', shippedAt: null }, // other vendor, unshipped
        ]) // recompute: all items on order, spans two vendors
        .mockResolvedValueOnce([
          { ...baseItem, order: { status: 'PAID' }, shippedAt: new Date() },
        ]); // refetch for response
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'PAID',
      });

      await service.markShipped('user-1', 'vendor-1', 'order-1');

      expect(prisma.order.update).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, no `this` binding involved
      expect(mailer.sendOrderStatusEmail).not.toHaveBeenCalled();
    });
  });

  describe('markDelivered', () => {
    const baseItem = {
      id: 'item-1',
      orderId: 'order-1',
      productId: 'product-1',
      product: { name: 'Widget' },
      quantity: 1,
      lineTotal: { toString: () => '100.00' },
      commission: null,
      deliveredAt: null,
    };

    beforeEach(() => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        userId: 'user-1',
        status: 'APPROVED',
      });
    });

    it('rejects marking delivered before shipped', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PAID' }, shippedAt: null },
      ]);

      await expect(
        service.markDelivered('user-1', 'vendor-1', 'order-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('marks shipped items delivered and flips Order.status to DELIVERED', async () => {
      const shippedAt = new Date();
      prisma.vendorOrderItem.findMany
        .mockResolvedValueOnce([
          { ...baseItem, order: { status: 'SHIPPED' }, shippedAt },
        ])
        .mockResolvedValueOnce([
          { ...baseItem, shippedAt, deliveredAt: new Date() },
        ])
        .mockResolvedValueOnce([
          {
            ...baseItem,
            order: { status: 'DELIVERED' },
            shippedAt,
            deliveredAt: new Date(),
          },
        ]);
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        status: 'SHIPPED',
        user: { email: 'jane@example.co.za', firstName: 'Jane' },
      });

      const result = await service.markDelivered(
        'user-1',
        'vendor-1',
        'order-1',
      );

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'DELIVERED' },
      });
      expect(result[0].deliveredAt).not.toBeNull();

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, no `this` binding involved
      expect(mailer.sendOrderStatusEmail).toHaveBeenCalledWith({
        to: 'jane@example.co.za',
        firstName: 'Jane',
        orderId: 'order-1',
        status: 'DELIVERED',
      });
    });
  });
});
