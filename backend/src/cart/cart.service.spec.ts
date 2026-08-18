import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: { findUnique: jest.fn() },
      cart: { findUnique: jest.fn(), create: jest.fn(), findUniqueOrThrow: jest.fn() },
      cartItem: { upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addItem', () => {
    it('rejects adding a nonexistent product', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem({ productId: 'nonexistent', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if a sessionId is supplied but no matching cart exists', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem({ sessionId: 'ghost-session', productId: 'product-1', quantity: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates a brand new cart when no sessionId is provided', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
      prisma.cart.create.mockResolvedValue({ id: 'cart-1', sessionId: 'generated-session-id' });
      prisma.cartItem.upsert.mockResolvedValue({});
      prisma.cart.findUniqueOrThrow.mockResolvedValue({
        id: 'cart-1',
        sessionId: 'generated-session-id',
        items: [],
      });

      await service.addItem({ productId: 'product-1', quantity: 2 });

      expect(prisma.cart.create).toHaveBeenCalled();
      expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { quantity: { increment: 2 } },
        }),
      );
    });
  });

  describe('updateItemQuantity — cart isolation', () => {
    it('rejects updating an item that belongs to a different cart', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', sessionId: 'session-1' });
      prisma.cartItem.findUnique.mockResolvedValue({ id: 'item-1', cartId: 'someone-elses-cart' });

      await expect(
        service.updateItemQuantity('session-1', 'item-1', { quantity: 5 }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });
});
