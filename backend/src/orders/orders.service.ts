import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderListItemDto } from './dto/order-list-item.dto';
import { OrderDetailDto } from './dto/order-detail.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string): Promise<OrderListItemDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true, returnRequest: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      returnRequest: order.returnRequest
        ? {
            status: order.returnRequest.status,
            reason: order.returnRequest.reason,
            createdAt: order.returnRequest.createdAt,
          }
        : null,
      createdAt: order.createdAt,
    }));
  }

  async findOneForUser(
    userId: string,
    orderId: string,
  ): Promise<OrderDetailDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: { include: { product: true } },
        payments: true,
        invoice: true,
        returnRequest: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you');
    }

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      address: {
        line1: order.address.line1,
        city: order.address.city,
        province: order.address.province,
        postalCode: order.address.postalCode,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImageUrl: item.product.imageUrl,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder.toString(),
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: p.amount.toString(),
      })),
      invoice: order.invoice
        ? {
            invoiceNumber: order.invoice.invoiceNumber,
            issuedAt: order.invoice.issuedAt,
          }
        : null,
      returnRequest: order.returnRequest
        ? {
            status: order.returnRequest.status,
            reason: order.returnRequest.reason,
            createdAt: order.returnRequest.createdAt,
          }
        : null,
      createdAt: order.createdAt,
    };
  }

  private async findOwnedOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, returnRequest: true },
    });
    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you');
    }
    return order;
  }

  private toListItem(order: {
    id: string;
    status: string;
    totalAmount: { toString(): string };
    items: { quantity: number }[];
    returnRequest: {
      status: string;
      reason: string;
      createdAt: Date;
    } | null;
    createdAt: Date;
  }): OrderListItemDto {
    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      returnRequest: order.returnRequest
        ? {
            status: order.returnRequest.status,
            reason: order.returnRequest.reason,
            createdAt: order.returnRequest.createdAt,
          }
        : null,
      createdAt: order.createdAt,
    };
  }

  // No payment has been taken yet at this point, so cancellation is
  // instant and self-service. Once an order is PAID, real money has
  // moved — that's a return request (below), reviewed by staff, per the
  // Returns page's own copy ("our support team will confirm the return").
  async cancelOrder(
    userId: string,
    orderId: string,
  ): Promise<OrderListItemDto> {
    const order = await this.findOwnedOrder(userId, orderId);

    if (order.status !== 'PLACED') {
      throw new BadRequestException(
        `Only orders awaiting payment can be cancelled this way. This order is "${order.status}" — contact support for help with it.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return this.toListItem({ ...order, ...updated });
  }

  // Files a return request for staff review — doesn't move the order out
  // of PAID/DELIVERED or touch the payment record. There's no automated
  // refund path (Ozow refunds aren't integrated), so this deliberately
  // stops at "recorded and pending review," matching what the Returns
  // page actually promises rather than pretending to refund instantly.
  async requestReturn(
    userId: string,
    orderId: string,
    reason: string,
  ): Promise<OrderListItemDto> {
    const order = await this.findOwnedOrder(userId, orderId);

    if (order.status !== 'PAID' && order.status !== 'DELIVERED') {
      throw new BadRequestException(
        `Returns can only be requested for paid or delivered orders. This order is "${order.status}".`,
      );
    }
    if (order.returnRequest) {
      throw new ConflictException(
        'A return has already been requested for this order.',
      );
    }

    const returnRequest = await this.prisma.returnRequest.create({
      data: { orderId, reason },
    });

    return this.toListItem({ ...order, returnRequest });
  }
}
