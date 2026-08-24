import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { order: { findMany: jest.fn(), findUnique: jest.fn() } };

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
          createdAt: new Date(),
        },
      ]);

      const result = await service.findAllForUser('user-1');

      expect(result[0].itemCount).toBe(5);
    });
  });
});