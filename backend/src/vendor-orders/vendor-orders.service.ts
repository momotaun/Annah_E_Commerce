import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VendorOrderItemResponseDto } from './dto/vendor-order-item-response.dto';
import { SalesReportResponseDto } from './dto/sales-report-response.dto';

@Injectable()
export class VendorOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireVendor(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      throw new NotFoundException('No vendor account found for this user');
    }
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
  ): Promise<VendorOrderItemResponseDto[]> {
    const vendor = await this.requireVendor(userId);

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

  async getSalesReport(userId: string): Promise<SalesReportResponseDto> {
    const vendor = await this.requireVendor(userId);

    const items = await this.prisma.vendorOrderItem.findMany({
      where: { vendorId: vendor.id },
      include: { commission: true },
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
    };
  }

  // Shipping/delivery is tracked per vendor per order — not on Order
  // directly — because one order can span multiple vendors, and this
  // vendor marking their own items shipped must never silently affect
  // another vendor's still-unshipped items on the same order.
  private async markFulfillment(
    userId: string,
    orderId: string,
    stage: 'shippedAt' | 'deliveredAt',
  ): Promise<VendorOrderItemResponseDto[]> {
    const vendor = await this.requireVendor(userId);

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
    orderId: string,
  ): Promise<VendorOrderItemResponseDto[]> {
    return this.markFulfillment(userId, orderId, 'shippedAt');
  }

  async markDelivered(
    userId: string,
    orderId: string,
  ): Promise<VendorOrderItemResponseDto[]> {
    return this.markFulfillment(userId, orderId, 'deliveredAt');
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
    }
  }
}
