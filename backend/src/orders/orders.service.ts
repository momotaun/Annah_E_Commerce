import {
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
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
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
      createdAt: order.createdAt,
    };
  }
}
