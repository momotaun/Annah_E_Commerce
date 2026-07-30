import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import type { PaymentGateway } from './gateways/payment-gateway.interface';

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async initiate(
    userId: string,
    dto: InitiatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order "${dto.orderId}" not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you');
    }
    if (order.status !== 'PLACED') {
      throw new BadRequestException(
        `Order is in status "${order.status}" and cannot be paid again`,
      );
    }

    const gatewayResult = await this.gateway.initiate({
      orderId: order.id,
      amount: order.totalAmount.toString(),
      currency: 'ZAR',
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'stub', // becomes the real provider identifier once selected
        transactionRef: gatewayResult.transactionRef,
        status: 'INITIATED',
        amount: order.totalAmount,
      },
    });

    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      transactionRef: payment.transactionRef,
      status: payment.status,
      amount: payment.amount.toString(),
      redirectUrl: gatewayResult.redirectUrl,
    };
  }

  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
    dto: PaymentWebhookDto,
  ) {
    const isValid = this.gateway.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { transactionRef: dto.transactionRef },
    });
    if (!payment) {
      throw new NotFoundException(
        `No payment found for transactionRef "${dto.transactionRef}"`,
      );
    }

    // Idempotency: gateways commonly retry webhook delivery. If we've
    // already processed a terminal status for this payment, no-op rather
    // than re-applying side effects.
    if (payment.status === 'SUCCEEDED' || payment.status === 'FAILED') {
      return { received: true, alreadyProcessed: true };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: dto.status },
      });

      if (dto.status === 'SUCCEEDED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        });
      }
    });

    return { received: true, alreadyProcessed: false };
  }
}
