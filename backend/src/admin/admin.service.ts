import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceAnalyticsResponseDto } from './dto/marketplace-analytics-response.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsResponseDto> {
    const vendors = await this.prisma.vendor.findMany({
      where: { status: 'APPROVED' },
      include: {
        vendorOrderItems: { include: { commission: true } },
      },
    });

    const vendorBreakdown = vendors.map((vendor) => {
      const revenue = vendor.vendorOrderItems.reduce(
        (sum, item) => sum + item.lineTotal.toNumber(),
        0,
      );
      const commission = vendor.vendorOrderItems.reduce(
        (sum, item) => sum + (item.commission?.amount.toNumber() ?? 0),
        0,
      );
      const orderCount = new Set(vendor.vendorOrderItems.map((i) => i.orderId)).size;

      return {
        vendorId: vendor.id,
        businessName: vendor.businessName,
        totalRevenue: revenue.toFixed(2),
        totalCommission: commission.toFixed(2),
        totalOrders: orderCount,
      };
    });

    const totalRevenue = vendorBreakdown.reduce(
      (sum, v) => sum + parseFloat(v.totalRevenue),
      0,
    );
    const totalCommissionEarned = vendorBreakdown.reduce(
      (sum, v) => sum + parseFloat(v.totalCommission),
      0,
    );
    const totalOrders = await this.prisma.order.count();

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      totalCommissionEarned: totalCommissionEarned.toFixed(2),
      activeVendorCount: vendors.length,
      vendorBreakdown,
    };
  }
}
