import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async toResponseDto(cartId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price?.toString() ?? null,
        imageUrl: item.product.imageUrl,
      },
      // A product priced when added can, in principle, have its price
      // cleared later via the vendor's own edit endpoint — treat that as
      // 0 here rather than crash; addItem already blocks adding an
      // unpriced product in the first place.
      lineTotal: (
        (item.product.price?.toNumber() ?? 0) * item.quantity
      ).toFixed(2),
    }));

    const subtotal = items
      .reduce((sum, item) => sum + parseFloat(item.lineTotal), 0)
      .toFixed(2);

    return {
      id: cart.id,
      sessionId: cart.sessionId,
      items,
      subtotal,
    };
  }

  async addItem(dto: AddToCartDto): Promise<CartResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new BadRequestException(
        `Product "${dto.productId}" does not exist`,
      );
    }
    if (product.status !== 'PUBLISHED' || product.price === null) {
      throw new BadRequestException(
        `Product "${dto.productId}" is not available for purchase`,
      );
    }

    let cart = dto.sessionId
      ? await this.prisma.cart.findUnique({
          where: { sessionId: dto.sessionId },
        })
      : null;

    if (dto.sessionId && !cart) {
      throw new NotFoundException(
        `Cart with sessionId "${dto.sessionId}" not found`,
      );
    }

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionId: randomUUID() },
      });
    }

    const quantity = dto.quantity ?? 1;

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId: dto.productId, quantity },
    });

    return this.toResponseDto(cart.id);
  }

  async getCart(sessionId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      throw new NotFoundException(
        `Cart with sessionId "${sessionId}" not found`,
      );
    }
    return this.toResponseDto(cart.id);
  }

  async updateItemQuantity(
    sessionId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      throw new NotFoundException(
        `Cart with sessionId "${sessionId}" not found`,
      );
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException(`Item "${itemId}" not found in this cart`);
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.toResponseDto(cart.id);
  }

  async removeItem(
    sessionId: string,
    itemId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      throw new NotFoundException(
        `Cart with sessionId "${sessionId}" not found`,
      );
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.cartId !== cart.id) {
      throw new NotFoundException(`Item "${itemId}" not found in this cart`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return this.toResponseDto(cart.id);
  }
}
