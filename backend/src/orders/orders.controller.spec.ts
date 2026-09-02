import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: {
    findAllForUser: jest.Mock;
    findOneForUser: jest.Mock;
    cancelOrder: jest.Mock;
    requestReturn: jest.Mock;
  };
  const user = { userId: 'user-1', email: 'jane@example.co.za' };

  beforeEach(async () => {
    ordersService = {
      findAllForUser: jest.fn(),
      findOneForUser: jest.fn(),
      cancelOrder: jest.fn(),
      requestReturn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it("lists only the current user's orders", async () => {
    const orders = [{ id: 'order-1' }];
    ordersService.findAllForUser.mockResolvedValue(orders);

    const result = await controller.findAll(user);

    expect(ordersService.findAllForUser).toHaveBeenCalledWith('user-1');
    expect(result).toBe(orders);
  });

  it('fetches a single order scoped to the current user, from the route param', async () => {
    const order = { id: 'order-1' };
    ordersService.findOneForUser.mockResolvedValue(order);

    const result = await controller.findOne(user, 'order-1');

    expect(ordersService.findOneForUser).toHaveBeenCalledWith(
      'user-1',
      'order-1',
    );
    expect(result).toBe(order);
  });

  it('cancels an order scoped to the current user, from the route param', async () => {
    const cancelled = { id: 'order-1', status: 'CANCELLED' };
    ordersService.cancelOrder.mockResolvedValue(cancelled);

    const result = await controller.cancel(user, 'order-1');

    expect(ordersService.cancelOrder).toHaveBeenCalledWith('user-1', 'order-1');
    expect(result).toBe(cancelled);
  });

  it('files a return request with the reason from the body, for an order scoped to the current user', async () => {
    const updated = { id: 'order-1' };
    ordersService.requestReturn.mockResolvedValue(updated);

    const result = await controller.requestReturn(user, 'order-1', {
      reason: 'Wrong size',
    });

    expect(ordersService.requestReturn).toHaveBeenCalledWith(
      'user-1',
      'order-1',
      'Wrong size',
    );
    expect(result).toBe(updated);
  });
});
