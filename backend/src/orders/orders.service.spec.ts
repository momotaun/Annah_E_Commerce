import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: {
    order: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    returnRequest: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      order: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      returnRequest: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }],
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
