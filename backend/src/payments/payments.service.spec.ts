import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService, PAYMENT_GATEWAY } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';
import { OzowPaymentGateway } from './gateways/ozow-payment.gateway';
import { PayfastPaymentGateway } from './gateways/payfast-payment.gateway';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PayfastWebhookDto } from './dto/payfast-webhook.dto';

function webhookDto(
  overrides: Partial<PaymentWebhookDto> = {},
): PaymentWebhookDto {
  return Object.assign(new PaymentWebhookDto(), {
    SiteCode: 'SITE1',
    TransactionId: 'txn-1',
    TransactionReference: 'ozow_abc123',
    Amount: '500.00',
    Status: 'Complete',
    CurrencyCode: 'ZAR',
    IsTest: 'true',
    Hash: 'deadbeef',
    ...overrides,
  });
}

function payfastWebhookDto(
  overrides: Partial<PayfastWebhookDto> = {},
): PayfastWebhookDto {
  return Object.assign(new PayfastWebhookDto(), {
    m_payment_id: 'payfast_abc123',
    pf_payment_id: '1089250',
    payment_status: 'COMPLETE',
    item_name: 'Order abc123',
    amount_gross: '500.00',
    merchant_id: '10053897',
    signature: 'deadbeef',
    ...overrides,
  });
}

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let gateway: jest.Mocked<PaymentGateway>;
  let ozowGateway: jest.Mocked<OzowPaymentGateway>;
  let payfastGateway: jest.Mocked<PayfastPaymentGateway>;
  let tx: any;

  beforeEach(async () => {
    tx = {
      payment: { update: jest.fn() },
      order: { update: jest.fn() },
    };

    prisma = {
      order: { findUnique: jest.fn() },
      payment: { create: jest.fn(), findUnique: jest.fn() },
      $transaction: jest.fn((callback) => callback(tx)),
    };

    gateway = {
      providerName: 'ozow',
      initiate: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    ozowGateway = {
      providerName: 'ozow',
      initiate: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    } as any;

    payfastGateway = {
      providerName: 'payfast',
      initiate: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PAYMENT_GATEWAY, useValue: gateway },
        { provide: OzowPaymentGateway, useValue: ozowGateway },
        { provide: PayfastPaymentGateway, useValue: payfastGateway },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('initiate', () => {
    it('throws NotFoundException for a nonexistent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.initiate('user-1', { orderId: 'ghost-order' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if the order belongs to a different user', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'someone-else',
        status: 'PLACED',
      });

      await expect(
        service.initiate('user-1', { orderId: 'order-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects initiating payment on an order that is not in PLACED status', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PAID',
      });

      await expect(
        service.initiate('user-1', { orderId: 'order-1' }),
      ).rejects.toThrow(BadRequestException);

      expect(gateway.initiate).not.toHaveBeenCalled();
    });

    it('calls the active gateway and creates an INITIATED payment record for a valid order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PLACED',
        totalAmount: { toString: () => '500.00' },
      });
      gateway.initiate.mockResolvedValue({
        transactionRef: 'ozow_abc123',
        redirectUrl: 'https://pay.ozow.com/abc123',
      });
      prisma.payment.create.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        provider: 'ozow',
        transactionRef: 'ozow_abc123',
        status: 'INITIATED',
        amount: { toString: () => '500.00' },
      });

      const result = await service.initiate('user-1', { orderId: 'order-1' });

      expect(gateway.initiate).toHaveBeenCalledWith({
        orderId: 'order-1',
        amount: '500.00',
        currency: 'ZAR',
      });
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ provider: 'ozow' }),
      });
      expect(result.redirectUrl).toBe('https://pay.ozow.com/abc123');
    });
  });

  describe('handleWebhook (Ozow)', () => {
    it('rejects a webhook with an invalid signature', async () => {
      ozowGateway.verifyWebhookSignature.mockReturnValue(false);

      await expect(service.handleWebhook(webhookDto())).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if no payment matches the transactionRef', async () => {
      ozowGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.handleWebhook(
          webhookDto({ TransactionReference: 'unknown-ref' }),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('is idempotent — a webhook for an already-SUCCEEDED payment is a no-op, not reprocessed', async () => {
      ozowGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'SUCCEEDED', // already processed
      });

      const result = await service.handleWebhook(webhookDto());

      expect(result).toEqual({ received: true, alreadyProcessed: true });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates payment status and flips order to PAID on a Complete webhook', async () => {
      ozowGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
      });

      const result = await service.handleWebhook(
        webhookDto({ Status: 'Complete' }),
      );

      expect(tx.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'SUCCEEDED' },
      });
      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PAID' },
      });
      expect(result).toEqual({ received: true, alreadyProcessed: false });
    });

    it.each(['Cancelled', 'Error', 'Abandoned'])(
      'does not flip the order to PAID on a %s webhook',
      async (status) => {
        ozowGateway.verifyWebhookSignature.mockReturnValue(true);
        prisma.payment.findUnique.mockResolvedValue({
          id: 'payment-1',
          orderId: 'order-1',
          status: 'INITIATED',
        });

        await service.handleWebhook(webhookDto({ Status: status }));

        expect(tx.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-1' },
          data: { status: 'FAILED' },
        });
        expect(tx.order.update).not.toHaveBeenCalled();
      },
    );

    it('no-ops on an unrecognized status like PendingInvestigation without touching payment/order state', async () => {
      ozowGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
      });

      const result = await service.handleWebhook(
        webhookDto({ Status: 'PendingInvestigation' }),
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true, alreadyProcessed: false });
    });
  });

  describe('handlePayfastWebhook', () => {
    it('rejects a webhook with an invalid signature', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(false);

      await expect(
        service.handlePayfastWebhook(payfastWebhookDto()),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if no payment matches the transactionRef', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.handlePayfastWebhook(
          payfastWebhookDto({ m_payment_id: 'unknown-ref' }),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects a webhook whose amount_gross does not match the stored payment amount', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
        amount: '500.00',
      });

      await expect(
        service.handlePayfastWebhook(
          payfastWebhookDto({ amount_gross: '1.00' }),
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('is idempotent — a webhook for an already-SUCCEEDED payment is a no-op, not reprocessed', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'SUCCEEDED',
        amount: '500.00',
      });

      const result = await service.handlePayfastWebhook(payfastWebhookDto());

      expect(result).toEqual({ received: true, alreadyProcessed: true });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates payment status and flips order to PAID on a COMPLETE webhook', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
        amount: '500.00',
      });

      const result = await service.handlePayfastWebhook(
        payfastWebhookDto({ payment_status: 'COMPLETE' }),
      );

      expect(tx.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'SUCCEEDED' },
      });
      expect(tx.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PAID' },
      });
      expect(result).toEqual({ received: true, alreadyProcessed: false });
    });

    it('does not flip the order to PAID on a CANCELLED webhook', async () => {
      payfastGateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
        amount: '500.00',
      });

      await service.handlePayfastWebhook(
        payfastWebhookDto({ payment_status: 'CANCELLED' }),
      );

      expect(tx.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'FAILED' },
      });
      expect(tx.order.update).not.toHaveBeenCalled();
    });
  });
});
