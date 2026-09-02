import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketplaceAnalyticsResponseDto } from './dto/marketplace-analytics-response.dto';
import { AdminOrderListItemDto } from './dto/admin-order-list-item.dto';

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
      const orderCount = new Set(vendor.vendorOrderItems.map((i) => i.orderId))
        .size;

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

  private toAdminOrderListItem(order: {
    id: string;
    status: string;
    totalAmount: { toString(): string };
    user: { email: string };
    payments: { status: string }[];
    returnRequest: {
      status: string;
      reason: string;
      createdAt: Date;
      resolvedAt: Date | null;
    } | null;
    createdAt: Date;
  }): AdminOrderListItemDto {
    const latestPayment = order.payments[order.payments.length - 1];
    return {
      id: order.id,
      customerEmail: order.user.email,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      paymentStatus: latestPayment?.status ?? null,
      returnRequest: order.returnRequest
        ? {
            status: order.returnRequest.status,
            reason: order.returnRequest.reason,
            createdAt: order.returnRequest.createdAt,
            resolvedAt: order.returnRequest.resolvedAt,
          }
        : null,
      createdAt: order.createdAt,
    };
  }

  async listOrders(): Promise<AdminOrderListItemDto[]> {
    const orders = await this.prisma.order.findMany({
      include: { user: true, payments: true, returnRequest: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toAdminOrderListItem(order));
  }

  // Approving/rejecting only updates the return request's own record —
  // it deliberately doesn't touch Order.status or process a refund.
  // There's no Ozow refund integration, so actually returning money to
  // a customer is still a manual step outside this system; pretending
  // otherwise here would just be a different kind of dishonest UI.
  async resolveReturnRequest(
    orderId: string,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<AdminOrderListItemDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, payments: true, returnRequest: true },
    });
    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }
    if (!order.returnRequest) {
      throw new NotFoundException(
        `No return request has been filed for order "${orderId}"`,
      );
    }
    if (order.returnRequest.status !== 'PENDING') {
      throw new BadRequestException(
        `This return request has already been ${order.returnRequest.status.toLowerCase()}.`,
      );
    }

    const updatedReturnRequest = await this.prisma.returnRequest.update({
      where: { orderId },
      data: { status, resolvedAt: new Date() },
    });

    return this.toAdminOrderListItem({
      ...order,
      returnRequest: updatedReturnRequest,
    });
  }
}
