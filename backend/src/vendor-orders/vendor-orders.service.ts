import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { requireOwnedVendor } from '../vendors/require-owned-vendor';
import { VendorOrderItemResponseDto } from './dto/vendor-order-item-response.dto';
import { VendorDashboardResponseDto } from './dto/vendor-dashboard-response.dto';
import type { Mailer } from '../mailer/mailer.interface';
import { MAILER } from '../mailer/mailer.module';

@Injectable()
export class VendorOrdersService {
  private readonly logger = new Logger(VendorOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAILER) private readonly mailer: Mailer,
  ) {}

  // Ownership + this specific store being APPROVED — fulfilling orders
  // requires an approved store, not just "the user is a VENDOR somewhere."
  private async requireApprovedVendor(userId: string, vendorId: string) {
    const vendor = await requireOwnedVendor(this.prisma, userId, vendorId);
    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenException('Your vendor account is not approved');
    }
    return vendor;
  }

  private toResponseDto(item: {
    id: string;
    orderId: string;
    productId: string;
    product: { name: string };
    quantity: number;
    lineTotal: { toString(): string };
    commission: { amount: { toString(): string } } | null;
    order: { status: string; createdAt: Date };
    shippedAt: Date | null;
    deliveredAt: Date | null;
  }): VendorOrderItemResponseDto {
    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
      commissionAmount: item.commission?.amount.toString() ?? '0.00',
      orderStatus: item.order.status,
      orderCreatedAt: item.order.createdAt,
      shippedAt: item.shippedAt,
      deliveredAt: item.deliveredAt,
    };
  }

  async findAllForVendor(
    userId: string,
    vendorId: string,
  ): Promise<VendorOrderItemResponseDto[]> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);

    const items = await this.prisma.vendorOrderItem.findMany({
      where: { vendorId: vendor.id },
      include: {
        product: true,
        order: true,
        commission: true,
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    return items.map((item) => this.toResponseDto(item));
  }

  async getDashboard(
    userId: string,
    vendorId: string,
  ): Promise<VendorDashboardResponseDto> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);

    const items = await this.prisma.vendorOrderItem.findMany({
      where: { vendorId: vendor.id },
      include: { commission: true, order: true, product: true },
    });

    const totalRevenue = items.reduce(
      (sum, item) => sum + item.lineTotal.toNumber(),
      0,
    );
    const totalCommission = items.reduce(
      (sum, item) => sum + (item.commission?.amount.toNumber() ?? 0),
      0,
    );
    const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalOrders = new Set(items.map((item) => item.orderId)).size;

    return {
      totalOrders,
      totalItemsSold,
      totalRevenue: totalRevenue.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      netEarnings: (totalRevenue - totalCommission).toFixed(2),
      revenueOverTime: this.buildRevenueOverTime(items),
      ordersByStatus: this.buildOrdersByStatus(items),
      topProducts: this.buildTopProducts(items),
    };
  }

  // Local calendar-day key (not toISOString/UTC) — bucket boundaries are
  // computed via setHours/setDate in local time, so keying with the UTC
  // date string would misalign by a day for any timezone that isn't UTC.
  private toDayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Zero-filled daily buckets for the last 30 days (oldest first) so the
  // chart always renders a continuous series instead of gaps on quiet
  // days.
  private buildRevenueOverTime(
    items: {
      lineTotal: { toNumber(): number };
      orderId: string;
      order: { createdAt: Date };
    }[],
  ) {
    const DAY_COUNT = 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = new Map<
      string,
      { revenue: number; orderIds: Set<string> }
    >();
    for (let i = DAY_COUNT - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      buckets.set(this.toDayKey(date), { revenue: 0, orderIds: new Set() });
    }

    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - (DAY_COUNT - 1));
    for (const item of items) {
      if (item.order.createdAt < cutoff) continue;
      const bucket = buckets.get(this.toDayKey(item.order.createdAt));
      if (!bucket) continue;
      bucket.revenue += item.lineTotal.toNumber();
      bucket.orderIds.add(item.orderId);
    }

    return [...buckets.entries()].map(([date, bucket]) => ({
      date,
      revenue: Number(bucket.revenue.toFixed(2)),
      orders: bucket.orderIds.size,
    }));
  }

  // Distinct orders (not line items) per current status — an order with
  // items from multiple vendors is counted once per vendor, since each
  // vendor only sees their own slice of it.
  private buildOrdersByStatus(
    items: { orderId: string; order: { status: string } }[],
  ) {
    const statusByOrderId = new Map<string, string>();
    for (const item of items) {
      statusByOrderId.set(item.orderId, item.order.status);
    }
    const counts = new Map<string, number>();
    for (const status of statusByOrderId.values()) {
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, count]) => ({
      status,
      count,
    }));
  }

  private buildTopProducts(
    items: {
      productId: string;
      product: { name: string };
      quantity: number;
      lineTotal: { toNumber(): number };
    }[],
  ) {
    const totals = new Map<
      string,
      { productName: string; quantitySold: number; revenue: number }
    >();
    for (const item of items) {
      const existing = totals.get(item.productId) ?? {
        productName: item.product.name,
        quantitySold: 0,
        revenue: 0,
      };
      existing.quantitySold += item.quantity;
      existing.revenue += item.lineTotal.toNumber();
      totals.set(item.productId, existing);
    }

    return [...totals.entries()]
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        quantitySold: data.quantitySold,
        revenue: Number(data.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  // Shipping/delivery is tracked per vendor per order — not on Order
  // directly — because one order can span multiple vendors, and this
  // vendor marking their own items shipped must never silently affect
  // another vendor's still-unshipped items on the same order.
  private async markFulfillment(
    userId: string,
    vendorId: string,
    orderId: string,
    stage: 'shippedAt' | 'deliveredAt',
  ): Promise<VendorOrderItemResponseDto[]> {
    const vendor = await this.requireApprovedVendor(userId, vendorId);

    const items = await this.prisma.vendorOrderItem.findMany({
      where: { vendorId: vendor.id, orderId },
      include: { order: true },
    });
    if (items.length === 0) {
      throw new NotFoundException(
        `No items belonging to you were found on order "${orderId}"`,
      );
    }
    if (items[0].order.status === 'CANCELLED') {
      throw new BadRequestException('This order has been cancelled.');
    }
    if (stage === 'shippedAt' && items[0].order.status === 'PLACED') {
      throw new BadRequestException(
        'This order has not been paid for yet, so it cannot be shipped.',
      );
    }

    if (stage === 'deliveredAt' && items.some((item) => !item.shippedAt)) {
      throw new BadRequestException(
        'Mark these items as shipped before marking them delivered.',
      );
    }
    if (items.every((item) => item[stage])) {
      const label = stage === 'shippedAt' ? 'shipped' : 'delivered';
      throw new BadRequestException(
        `These items have already been marked as ${label}.`,
      );
    }

    await this.prisma.vendorOrderItem.updateMany({
      where: { vendorId: vendor.id, orderId },
      data: { [stage]: new Date() },
    });

    await this.recomputeOrderStatus(orderId);

    const updated = await this.prisma.vendorOrderItem.findMany({
      where: { vendorId: vendor.id, orderId },
      include: { product: true, order: true, commission: true },
    });
    return updated.map((item) => this.toResponseDto(item));
  }

  async markShipped(
    userId: string,
    vendorId: string,
    orderId: string,
  ): Promise<VendorOrderItemResponseDto[]> {
    return this.markFulfillment(userId, vendorId, orderId, 'shippedAt');
  }

  async markDelivered(
    userId: string,
    vendorId: string,
    orderId: string,
  ): Promise<VendorOrderItemResponseDto[]> {
    return this.markFulfillment(userId, vendorId, orderId, 'deliveredAt');
  }

  // An order's overall status only advances once every vendor covering
  // items on it has reached that stage — a house-catalogue-only order
  // (no VendorOrderItem rows at all) has no vendor-driven fulfillment
  // mechanism yet, so it's deliberately left untouched here.
  private async recomputeOrderStatus(orderId: string): Promise<void> {
    const allItems = await this.prisma.vendorOrderItem.findMany({
      where: { orderId },
    });
    if (allItems.length === 0) return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order || order.status === 'CANCELLED') return;

    const allDelivered = allItems.every((item) => item.deliveredAt);
    const allShipped = allItems.every((item) => item.shippedAt);

    const nextStatus = allDelivered
      ? 'DELIVERED'
      : allShipped
        ? 'SHIPPED'
        : null;
    if (nextStatus && nextStatus !== order.status) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: nextStatus },
      });

      await this.notifyOrderStatus(orderId, nextStatus);
    }
  }

  // Only reached right after the whole order (all vendors' items, not
  // just this one) actually transitions to SHIPPED/DELIVERED — never on
  // a no-op recompute — so this can't double-send.
  private async notifyOrderStatus(
    orderId: string,
    status: 'SHIPPED' | 'DELIVERED',
  ): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { user: { select: { email: true, firstName: true } } },
    });
    if (!order) return;

    try {
      await this.mailer.sendOrderStatusEmail({
        to: order.user.email,
        firstName: order.user.firstName,
        orderId,
        status,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send ${status} email for order ${orderId}`,
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
