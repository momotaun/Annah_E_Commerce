import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prisma: any;
  let tx: any;

  beforeEach(async () => {
    // The fake transactional client passed into every $transaction callback
    tx = {
      cart: { update: jest.fn() },
      order: { create: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };

    prisma = {
      address: { findUnique: jest.fn() },
      cart: { findUnique: jest.fn() },
      $transaction: jest.fn((callback) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('throws NotFoundException if the address does not exist', async () => {
    prisma.address.findUnique.mockResolvedValue(null);

    await expect(
      service.checkout('user-1', {
        sessionId: 'session-1',
        addressId: 'ghost-address',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException if the address belongs to a different user', async () => {
    prisma.address.findUnique.mockResolvedValue({
      id: 'addr-1',
      userId: 'someone-else',
    });

    await expect(
      service.checkout('user-1', {
        sessionId: 'session-1',
        addressId: 'addr-1',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException for an empty cart', async () => {
    prisma.address.findUnique.mockResolvedValue({
      id: 'addr-1',
      userId: 'user-1',
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: null,
      items: [],
    });

    await expect(
      service.checkout('user-1', {
        sessionId: 'session-1',
        addressId: 'addr-1',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates the order, links the anonymous cart to the user, and clears cart items — all within one transaction', async () => {
    prisma.address.findUnique.mockResolvedValue({
      id: 'addr-1',
      userId: 'user-1',
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: null, // anonymous cart — should get linked
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          product: { price: { toNumber: () => 100 } },
        },
      ],
    });
    tx.order.create.mockResolvedValue({
      id: 'order-1',
      status: 'PLACED',
      totalAmount: { toString: () => '200.00' },
      addressId: 'addr-1',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          priceAtOrder: { toString: () => '100.00' },
          product: { name: 'Test Product' },
        },
      ],
      invoice: { invoiceNumber: 'INV-TEST-001' },
    });

    const result = await service.checkout('user-1', {
      sessionId: 'session-1',
      addressId: 'addr-1',
    });

    // Cart gets linked since it was previously anonymous
    expect(tx.cart.update).toHaveBeenCalledWith({
      where: { id: 'cart-1' },
      data: { userId: 'user-1' },
    });

    // Cart items get cleared after order creation
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1' },
    });

    expect(result.id).toBe('order-1');
    expect(result.invoiceNumber).toBe('INV-TEST-001');
  });

  it('does not re-link a cart that already belongs to a user', async () => {
    prisma.address.findUnique.mockResolvedValue({
      id: 'addr-1',
      userId: 'user-1',
    });
    prisma.cart.findUnique.mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1', // already linked
      items: [
        {
          productId: 'product-1',
          quantity: 1,
          product: { price: { toNumber: () => 50 } },
        },
      ],
    });
    tx.order.create.mockResolvedValue({
      id: 'order-2',
      status: 'PLACED',
      totalAmount: { toString: () => '50.00' },
      addressId: 'addr-1',
      items: [],
      invoice: { invoiceNumber: 'INV-TEST-002' },
    });

    await service.checkout('user-1', {
      sessionId: 'session-1',
      addressId: 'addr-1',
    });

    expect(tx.cart.update).not.toHaveBeenCalled();
  });
});
