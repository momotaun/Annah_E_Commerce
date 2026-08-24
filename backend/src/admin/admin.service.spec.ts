import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      vendor: { findMany: jest.fn() },
      order: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

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