import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { OrderRequestResponseDto } from './dto/order-request-response.dto';

@Injectable()
export class OrderRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(orderRequest: any): OrderRequestResponseDto {
    const items = orderRequest.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      priceAtOrder: item.priceAtOrder.toString(),
    }));

    const total = items
      .reduce(
        (sum: number, item: any) =>
          sum + parseFloat(item.priceAtOrder) * item.quantity,
        0,
      )
      .toFixed(2);

    return {
      id: orderRequest.id,
      cartId: orderRequest.cartId,
      customerName: orderRequest.customerName,
      customerContact: orderRequest.customerContact,
      status: orderRequest.status,
      items,
      total,
      createdAt: orderRequest.createdAt,
    };
  }

  async create(dto: CreateOrderRequestDto): Promise<OrderRequestResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: dto.cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id "${dto.cartId}" not found`);
    }

    if (cart.items.length === 0) {
      throw new BadRequestException(
        'Cannot submit an order request for an empty cart',
      );
    }

    const orderRequest = await this.prisma.orderRequest.create({
      data: {
        cartId: cart.id,
        customerName: dto.customerName,
        customerContact: dto.customerContact,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.product.price, // snapshot at submission time
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    return this.toResponseDto(orderRequest);
  }

  async findOne(id: string): Promise<OrderRequestResponseDto> {
    const orderRequest = await this.prisma.orderRequest.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!orderRequest) {
      throw new NotFoundException(`Order request with id "${id}" not found`);
    }

    return this.toResponseDto(orderRequest);
  }
}
