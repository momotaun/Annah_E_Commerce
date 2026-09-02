import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketplaceAnalyticsResponseDto } from './dto/marketplace-analytics-response.dto';
import {
  AdminOrderListItemDto,
  PaginatedAdminOrdersResponseDto,
} from './dto/admin-order-list-item.dto';
import { QueryAdminOrdersDto } from './dto/query-admin-orders.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMarketplaceAnalytics(): Promise<MarketplaceAnalyticsResponseDto> {
    // Sums and per-vendor order counts used to be computed by loading every
    // vendorOrderItem (plus its commission) for every approved vendor into
    // memory and reducing over them in JS — fine with a handful of orders,
    // but it means this endpoint's cost grows without bound as the
    // marketplace does. All three aggregates below are instead computed by
    // Postgres itself; only the small, vendor-count-sized results come back.
    const [
      approvedVendors,
      revenueByVendor,
      commissionByVendor,
      vendorOrderPairs,
      totalOrders,
    ] = await Promise.all([
      this.prisma.vendor.findMany({
        where: { status: 'APPROVED' },
        select: { id: true, businessName: true },
      }),
      this.prisma.vendorOrderItem.groupBy({
        by: ['vendorId'],
        where: { vendor: { status: 'APPROVED' } },
        _sum: { lineTotal: true },
      }),
      this.prisma.commission.groupBy({
        by: ['vendorId'],
        where: { vendor: { status: 'APPROVED' } },
        _sum: { amount: true },
      }),
      // Prisma's groupBy has no COUNT(DISTINCT ...), and orderCount needs
      // *distinct orders* per vendor, not line-item rows (one order can
      // contain several of a vendor's items). Grouping by the
      // (vendorId, orderId) pair first — selecting only those two
      // columns, not the full rows — gives one row per pair; counting
      // those in JS below reproduces the original distinct-order count.
      this.prisma.vendorOrderItem.groupBy({
        by: ['vendorId', 'orderId'],
        where: { vendor: { status: 'APPROVED' } },
      }),
      this.prisma.order.count(),
    ]);

    const revenueByVendorId = new Map(
      revenueByVendor.map((r) => [
        r.vendorId,
        r._sum.lineTotal?.toNumber() ?? 0,
      ]),
    );
    const commissionByVendorId = new Map(
      commissionByVendor.map((c) => [
        c.vendorId,
        c._sum.amount?.toNumber() ?? 0,
      ]),
    );
    const orderCountByVendorId = new Map<string, number>();
    for (const pair of vendorOrderPairs) {
      orderCountByVendorId.set(
        pair.vendorId,
        (orderCountByVendorId.get(pair.vendorId) ?? 0) + 1,
      );
    }

    const vendorBreakdown = approvedVendors.map((vendor) => ({
      vendorId: vendor.id,
      businessName: vendor.businessName,
      totalRevenue: (revenueByVendorId.get(vendor.id) ?? 0).toFixed(2),
      totalCommission: (commissionByVendorId.get(vendor.id) ?? 0).toFixed(2),
      totalOrders: orderCountByVendorId.get(vendor.id) ?? 0,
    }));

    const totalRevenue = vendorBreakdown.reduce(
      (sum, v) => sum + parseFloat(v.totalRevenue),
      0,
    );
    const totalCommissionEarned = vendorBreakdown.reduce(
      (sum, v) => sum + parseFloat(v.totalCommission),
      0,
    );

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      totalCommissionEarned: totalCommissionEarned.toFixed(2),
      activeVendorCount: approvedVendors.length,
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

  async listOrders(
    query: QueryAdminOrdersDto,
  ): Promise<PaginatedAdminOrdersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        include: { user: true, payments: true, returnRequest: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders.map((order) => this.toAdminOrderListItem(order)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
