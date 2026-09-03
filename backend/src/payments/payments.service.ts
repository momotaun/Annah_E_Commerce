import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PayfastWebhookDto } from './dto/payfast-webhook.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import type { PaymentGateway } from './gateways/payment-gateway.interface';
import { OzowPaymentGateway } from './gateways/ozow-payment.gateway';
import { PayfastPaymentGateway } from './gateways/payfast-payment.gateway';

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    // Used for initiate() — whichever gateway PAYMENT_PROVIDER selects.
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
    // Webhooks arrive on gateway-specific routes and must always be
    // verified by the matching gateway, regardless of which one is
    // currently active for new payments — see handleWebhook/handlePayfastWebhook.
    private readonly ozowGateway: OzowPaymentGateway,
    private readonly payfastGateway: PayfastPaymentGateway,
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
        provider: this.gateway.providerName,
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

  // Ozow's own statuses (not our internal PaymentStatus enum). Complete is
  // the only success state; Cancelled/Error/Abandoned are all terminal
  // failures from the shopper's point of view. PendingInvestigation is
  // deliberately left unmapped — Ozow will send a follow-up notify once
  // it's resolved, so we no-op rather than guess.
  private mapOzowStatus(status: string): 'SUCCEEDED' | 'FAILED' | null {
    if (status === 'Complete') return 'SUCCEEDED';
    if (['Cancelled', 'Error', 'Abandoned'].includes(status)) return 'FAILED';
    return null;
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payload: Record<string, string> = { ...dto };
    const isValid = this.ozowGateway.verifyWebhookSignature(payload);
    if (!isValid) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    return this.applyWebhookStatus(
      dto.TransactionReference,
      this.mapOzowStatus(dto.Status),
    );
  }

  // PayFast's own statuses (not our internal PaymentStatus enum). COMPLETE
  // is the only success state; CANCELLED is a terminal failure. Any other
  // value (e.g. a future status PayFast adds) is deliberately left
  // unmapped rather than guessed at.
  private mapPayfastStatus(status: string): 'SUCCEEDED' | 'FAILED' | null {
    if (status === 'COMPLETE') return 'SUCCEEDED';
    if (status === 'CANCELLED') return 'FAILED';
    return null;
  }

  async handlePayfastWebhook(dto: PayfastWebhookDto) {
    const payload: Record<string, string> = { ...dto };
    const isValid = this.payfastGateway.verifyWebhookSignature(payload);
    if (!isValid) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { transactionRef: dto.m_payment_id },
    });
    if (!payment) {
      throw new NotFoundException(
        `No payment found for transactionRef "${dto.m_payment_id}"`,
      );
    }

    // PayFast's own recommended check: the amount they say was paid must
    // match what we actually charged for, not just a valid signature.
    if (Math.abs(Number(dto.amount_gross) - Number(payment.amount)) > 0.01) {
      throw new ForbiddenException('Webhook amount does not match payment');
    }

    return this.applyWebhookStatus(
      dto.m_payment_id,
      this.mapPayfastStatus(dto.payment_status),
      payment,
    );
  }

  private async applyWebhookStatus(
    transactionRef: string,
    mappedStatus: 'SUCCEEDED' | 'FAILED' | null,
    knownPayment?: { id: string; orderId: string; status: string },
  ) {
    const payment =
      knownPayment ??
      (await this.prisma.payment.findUnique({ where: { transactionRef } }));
    if (!payment) {
      throw new NotFoundException(
        `No payment found for transactionRef "${transactionRef}"`,
      );
    }

    if (!mappedStatus) {
      // e.g. Ozow's PendingInvestigation — nothing to apply yet.
      return { received: true, alreadyProcessed: false };
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
        data: { status: mappedStatus },
      });

      if (mappedStatus === 'SUCCEEDED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        });
      }
    });

    return { received: true, alreadyProcessed: false };
  }
}
