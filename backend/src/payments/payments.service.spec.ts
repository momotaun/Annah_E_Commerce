import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService, PAYMENT_GATEWAY } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentGateway } from './gateways/payment-gateway.interface';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let gateway: jest.Mocked<PaymentGateway>;
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
      initiate: jest.fn(),
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PAYMENT_GATEWAY, useValue: gateway },
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

    it('calls the gateway and creates an INITIATED payment record for a valid order', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PLACED',
        totalAmount: { toString: () => '500.00' },
      });
      gateway.initiate.mockResolvedValue({
        transactionRef: 'stub_abc123',
        redirectUrl: 'https://stub-gateway.example.com/pay/stub_abc123',
      });
      prisma.payment.create.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        provider: 'stub',
        transactionRef: 'stub_abc123',
        status: 'INITIATED',
        amount: { toString: () => '500.00' },
      });

      const result = await service.initiate('user-1', { orderId: 'order-1' });

      expect(gateway.initiate).toHaveBeenCalledWith({
        orderId: 'order-1',
        amount: '500.00',
        currency: 'ZAR',
      });
      expect(result.redirectUrl).toBe(
        'https://stub-gateway.example.com/pay/stub_abc123',
      );
    });
  });

  describe('handleWebhook', () => {
    it('rejects a webhook with an invalid signature', async () => {
      gateway.verifyWebhookSignature.mockReturnValue(false);

      await expect(
        service.handleWebhook(Buffer.from('{}'), 'bad-signature', {
          transactionRef: 'stub_abc123',
          status: 'SUCCEEDED',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundException if no payment matches the transactionRef', async () => {
      gateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.handleWebhook(Buffer.from('{}'), 'valid-signature', {
          transactionRef: 'unknown-ref',
          status: 'SUCCEEDED',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('is idempotent — a webhook for an already-SUCCEEDED payment is a no-op, not reprocessed', async () => {
      gateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'SUCCEEDED', // already processed
      });

      const result = await service.handleWebhook(
        Buffer.from('{}'),
        'valid-signature',
        {
        transactionRef: 'stub_abc123',
        status: 'SUCCEEDED',
      });

      expect(result).toEqual({ received: true, alreadyProcessed: true });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates payment status and flips order to PAID on a genuine SUCCEEDED webhook', async () => {
      gateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
      });

      const result = await service.handleWebhook(
        Buffer.from('{}'),
        'valid-signature',
        {
        transactionRef: 'stub_abc123',
        status: 'SUCCEEDED',
      });

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

    it('does not flip the order to PAID on a FAILED webhook', async () => {
      gateway.verifyWebhookSignature.mockReturnValue(true);
      prisma.payment.findUnique.mockResolvedValue({
        id: 'payment-1',
        orderId: 'order-1',
        status: 'INITIATED',
      });

      await service.handleWebhook(Buffer.from('{}'), 'valid-signature', {
        transactionRef: 'stub_abc123',
        status: 'FAILED',
      });

      expect(tx.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'FAILED' },
      });
      expect(tx.order.update).not.toHaveBeenCalled();
    });
  });
});