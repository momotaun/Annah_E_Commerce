import { Test, TestingModule } from '@nestjs/testing';
import { VendorOrdersService } from './vendor-orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('VendorOrdersService', () => {
  let service: VendorOrdersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vendor: { findUnique: jest.fn() },
      vendorOrderItem: { findMany: jest.fn() },
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
});