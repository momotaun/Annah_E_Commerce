import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
      throw new NotFoundException(`Cart with sessionId "${dto.sessionId}" not found`);
    }
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    const totalAmount = cart.items
      .reduce((sum, item) => sum + item.product.price.toNumber() * item.quantity, 0)
      .toFixed(2);

    const order = await this.prisma.$transaction(async (tx) => {
      // Link the (previously anonymous) cart to this authenticated user
      if (!cart.userId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { userId },
        });
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
            create: {
              invoiceNumber: this.generateInvoiceNumber(),
            },
          },
        },
        include: {
          items: { include: { product: true } },
          invoice: true,
        },
      });

      // Purchased items no longer belong in the active cart
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
