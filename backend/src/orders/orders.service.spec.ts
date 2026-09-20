import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoicePdfService } from './invoice-pdf.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    order: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    returnRequest: { create: jest.Mock };
    siteSettings: { findUnique: jest.Mock };
  };
  let invoicePdfService: { generate: jest.Mock };

  beforeEach(async () => {
    prisma = {
      order: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      returnRequest: { create: jest.fn() },
      siteSettings: { findUnique: jest.fn() },
    };
    invoicePdfService = { generate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: InvoicePdfService, useValue: invoicePdfService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException if the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.findOneForUser('user-1', 'ghost-order'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if the order belongs to a different user', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'someone-else',
      });

      await expect(service.findOneForUser('user-1', 'order-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getInvoicePdf', () => {
    const baseOrder = {
      id: 'order-1',
      userId: 'user-1',
      totalAmount: { toString: () => '649.00' },
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.co.za',
      },
      address: {
        line1: '1 Main Rd',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
      },
      items: [
        {
          product: { name: 'Meridian Leather Gloves' },
          quantity: 1,
          priceAtOrder: { toString: () => '649.00' },
        },
      ],
      payments: [
        {
          provider: 'PayFast',
          status: 'SUCCEEDED',
          amount: { toString: () => '649.00' },
        },
      ],
      invoice: {
        invoiceNumber: 'INV-2026-0001',
        issuedAt: new Date('2026-01-01'),
      },
    };

    it('throws NotFoundException if the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getInvoicePdf('user-1', 'ghost-order'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if the order belongs to a different user', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...baseOrder,
        userId: 'someone-else',
      });

      await expect(service.getInvoicePdf('user-1', 'order-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException if the order has no invoice', async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...baseOrder,
        invoice: null,
      });

      await expect(service.getInvoicePdf('user-1', 'order-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('generates the PDF from the real order, address and site name', async () => {
      prisma.order.findUnique.mockResolvedValue(baseOrder);
      prisma.siteSettings.findUnique.mockResolvedValue({
        siteName: 'Nhundzu',
      });
      const pdfBuffer = Buffer.from('%PDF-1.4');
      invoicePdfService.generate.mockResolvedValue(pdfBuffer);

      const result = await service.getInvoicePdf('user-1', 'order-1');

      expect(invoicePdfService.generate).toHaveBeenCalledWith(
        {
          id: 'order-1',
          invoiceNumber: 'INV-2026-0001',
          issuedAt: baseOrder.invoice.issuedAt,
          totalAmount: '649.00',
          customerName: 'Jane Doe',
          customerEmail: 'jane@example.co.za',
          address: {
            line1: '1 Main Rd',
            city: 'Cape Town',
            province: 'Western Cape',
            postalCode: '8001',
          },
          items: [
            {
              productName: 'Meridian Leather Gloves',
              quantity: 1,
              priceAtOrder: '649.00',
            },
          ],
          payments: [
            { provider: 'PayFast', status: 'SUCCEEDED', amount: '649.00' },
          ],
        },
        'Nhundzu',
      );
      expect(result).toBe(pdfBuffer);
    });

    it('falls back to "Nhundzu" if site settings have not been seeded', async () => {
      prisma.order.findUnique.mockResolvedValue(baseOrder);
      prisma.siteSettings.findUnique.mockResolvedValue(null);
      invoicePdfService.generate.mockResolvedValue(Buffer.from('%PDF-1.4'));

      await service.getInvoicePdf('user-1', 'order-1');

      expect(invoicePdfService.generate).toHaveBeenCalledWith(
        expect.anything(),
        'Nhundzu',
      );
    });
  });

  describe('findAllForUser', () => {
    it('sums quantities across items into itemCount', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PLACED',
          totalAmount: { toString: () => '150.00' },
          items: [{ quantity: 2 }, { quantity: 3 }],
          returnRequest: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.findAllForUser('user-1');

      expect(result[0].itemCount).toBe(5);
      expect(result[0].returnRequest).toBeNull();
    });

    it('surfaces a return request when one exists', async () => {
      const returnRequestCreatedAt = new Date();
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          status: 'PAID',
          totalAmount: { toString: () => '150.00' },
          items: [{ quantity: 1 }],
          returnRequest: {
            status: 'PENDING',
            reason: 'Wrong size',
            createdAt: returnRequestCreatedAt,
          },
          createdAt: new Date(),
        },
      ]);

      const result = await service.findAllForUser('user-1');

      expect(result[0].returnRequest).toEqual({
        status: 'PENDING',
        reason: 'Wrong size',
        createdAt: returnRequestCreatedAt,
      });
    });
  });

  describe('cancelOrder', () => {
    it('throws NotFoundException for a nonexistent order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelOrder('user-1', 'ghost-order'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if the order belongs to a different user', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'someone-else',
        status: 'PLACED',
        items: [],
        returnRequest: null,
      });

      await expect(service.cancelOrder('user-1', 'order-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects cancelling an order that is not PLACED', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PAID',
        items: [],
        returnRequest: null,
      });

      await expect(service.cancelOrder('user-1', 'order-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('cancels a PLACED order', async () => {
      const createdAt = new Date();
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PLACED',
        totalAmount: { toString: () => '100.00' },
        items: [{ quantity: 1 }],
        returnRequest: null,
        createdAt,
      });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'CANCELLED',
        totalAmount: { toString: () => '100.00' },
        createdAt,
      });

      const result = await service.cancelOrder('user-1', 'order-1');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CANCELLED' },
      });
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('requestReturn', () => {
    it('rejects a return request on an order that is not PAID or DELIVERED', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PLACED',
        items: [],
        returnRequest: null,
      });

      await expect(
        service.requestReturn('user-1', 'order-1', 'Changed my mind'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.returnRequest.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate return request', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PAID',
        items: [],
        returnRequest: {
          status: 'PENDING',
          reason: 'Already requested',
          createdAt: new Date(),
        },
      });

      await expect(
        service.requestReturn('user-1', 'order-1', 'Changed my mind'),
      ).rejects.toThrow(ConflictException);
      expect(prisma.returnRequest.create).not.toHaveBeenCalled();
    });

    it.each(['PAID', 'DELIVERED'])(
      'creates a return request for a %s order',
      async (status) => {
        const createdAt = new Date();
        prisma.order.findUnique.mockResolvedValue({
          id: 'order-1',
          userId: 'user-1',
          status,
          totalAmount: { toString: () => '250.00' },
          items: [{ quantity: 2 }],
          returnRequest: null,
          createdAt,
        });
        prisma.returnRequest.create.mockResolvedValue({
          status: 'PENDING',
          reason: 'Wrong colour',
          createdAt,
        });

        const result = await service.requestReturn(
          'user-1',
          'order-1',
          'Wrong colour',
        );

        expect(prisma.returnRequest.create).toHaveBeenCalledWith({
          data: { orderId: 'order-1', reason: 'Wrong colour' },
        });
        expect(result.returnRequest).toEqual({
          status: 'PENDING',
          reason: 'Wrong colour',
          createdAt,
        });
      },
    );
  });
});
