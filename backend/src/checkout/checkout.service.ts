import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  private generateInvoiceNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV-${datePart}-${randomPart}`;
  }

  async checkout(userId: string, dto: CheckoutDto): Promise<OrderResponseDto> {
    const address = await this.prisma.address.findUnique({
      where: { id: dto.addressId },
    });
    if (!address) {
      throw new NotFoundException(`Address "${dto.addressId}" not found`);
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('This address does not belong to you');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { sessionId: dto.sessionId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) {
      throw new NotFoundException(
        `Cart with sessionId "${dto.sessionId}" not found`,
      );
    }
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    const totalAmount = cart.items
      .reduce(
        (sum, item) => sum + item.product.price.toNumber() * item.quantity,
        0,
      )
      .toFixed(2);

    const order = await this.prisma.$transaction(async (tx) => {
      if (!cart.userId) {
        await tx.cart.update({ where: { id: cart.id }, data: { userId } });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId,
          addressId: dto.addressId,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: item.product.price,
            })),
          },
          invoice: {
            create: { invoiceNumber: this.generateInvoiceNumber() },
          },
        },
        include: {
          items: { include: { product: true } },
          invoice: true,
        },
      });

      // Phase 3 order splitting (Section 8.4): group items by vendorId and
      // create VendorOrderItem + Commission records for any vendor-owned
      // products in this order. Items with no vendorId (Phase 1/2 catalogue
      // products) are simply skipped — nothing to split.
      const commissionRate = parseFloat(
        process.env.DEFAULT_COMMISSION_RATE ?? '10.00',
      );

      for (const item of createdOrder.items) {
        if (!item.product.vendorId) continue;

        const lineTotal = item.priceAtOrder.toNumber() * item.quantity;

        const vendorOrderItem = await tx.vendorOrderItem.create({
          data: {
            orderId: createdOrder.id,
            vendorId: item.product.vendorId,
            productId: item.productId,
            quantity: item.quantity,
            lineTotal: lineTotal.toFixed(2),
          },
        });

        await tx.commission.create({
          data: {
            vendorId: item.product.vendorId,
            orderItemId: vendorOrderItem.id,
            rate: commissionRate,
            amount: ((lineTotal * commissionRate) / 100).toFixed(2),
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      addressId: order.addressId,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder.toString(),
      })),
      invoiceNumber: order.invoice!.invoiceNumber,
      createdAt: order.createdAt,
    };
  }
}
