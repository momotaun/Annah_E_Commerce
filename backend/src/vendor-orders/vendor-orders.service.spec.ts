import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VendorOrdersService } from './vendor-orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VendorOrdersService', () => {
  let service: VendorOrdersService;
  let prisma: {
    vendor: { findUnique: jest.Mock };
    vendorOrderItem: { findMany: jest.Mock; updateMany: jest.Mock };
    order: { findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vendor: { findUnique: jest.fn() },
      vendorOrderItem: { findMany: jest.fn(), updateMany: jest.fn() },
      order: { findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorOrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<VendorOrdersService>(VendorOrdersService);
  });

  describe('getSalesReport', () => {
    it('counts distinct orders, not line items, even when one order has multiple items', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        status: 'APPROVED',
      });
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        {
          orderId: 'order-1',
          quantity: 2,
          lineTotal: { toNumber: () => 200 },
          commission: { amount: { toNumber: () => 20 } },
        },
        {
          orderId: 'order-1', // same order, second line item
          quantity: 1,
          lineTotal: { toNumber: () => 100 },
          commission: { amount: { toNumber: () => 10 } },
        },
        {
          orderId: 'order-2',
          quantity: 1,
          lineTotal: { toNumber: () => 50 },
          commission: { amount: { toNumber: () => 5 } },
        },
      ]);

      const result = await service.getSalesReport('user-1');

      expect(result.totalOrders).toBe(2); // two distinct orders, not three line items
      expect(result.totalItemsSold).toBe(4); // 2 + 1 + 1
      expect(result.totalRevenue).toBe('350.00');
      expect(result.totalCommission).toBe('35.00');
      expect(result.netEarnings).toBe('315.00');
    });

    it('handles a vendor with zero sales without dividing by zero or crashing', async () => {
      prisma.vendor.findUnique.mockResolvedValue({
        id: 'vendor-1',
        status: 'APPROVED',
      });
      prisma.vendorOrderItem.findMany.mockResolvedValue([]);

      const result = await service.getSalesReport('user-1');

      expect(result.totalOrders).toBe(0);
      expect(result.totalRevenue).toBe('0.00');
      expect(result.netEarnings).toBe('0.00');
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
        status: 'APPROVED',
      });
    });

    it('throws NotFoundException if the vendor has no items on that order', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([]);

      await expect(service.markShipped('user-1', 'order-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects marking a cancelled order shipped', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'CANCELLED' } },
      ]);

      await expect(service.markShipped('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('rejects shipping an order that has not been paid for yet', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PLACED' } },
      ]);

      await expect(service.markShipped('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.vendorOrderItem.updateMany).not.toHaveBeenCalled();
    });

    it('rejects marking already-shipped items shipped again', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PAID' }, shippedAt: new Date() },
      ]);

      await expect(service.markShipped('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
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
      });

      const result = await service.markShipped('user-1', 'order-1');

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

      await service.markShipped('user-1', 'order-1');

      expect(prisma.order.update).not.toHaveBeenCalled();
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
        status: 'APPROVED',
      });
    });

    it('rejects marking delivered before shipped', async () => {
      prisma.vendorOrderItem.findMany.mockResolvedValue([
        { ...baseItem, order: { status: 'PAID' }, shippedAt: null },
      ]);

      await expect(service.markDelivered('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
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
      });

      const result = await service.markDelivered('user-1', 'order-1');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'DELIVERED' },
      });
      expect(result[0].deliveredAt).not.toBeNull();
    });
  });
});
