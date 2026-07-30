import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VendorOrderItemResponseDto } from './dto/vendor-order-item-response.dto';

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

  async findAllForVendor(userId: string): Promise<VendorOrderItemResponseDto[]> {
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

    return items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      lineTotal: item.lineTotal.toString(),
      commissionAmount: item.commission?.amount.toString() ?? '0.00',
      orderStatus: item.order.status,
      orderCreatedAt: item.order.createdAt,
    }));
  }
}
