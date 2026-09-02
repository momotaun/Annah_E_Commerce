import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let checkoutService: { checkout: jest.Mock };

  beforeEach(async () => {
    checkoutService = { checkout: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [{ provide: CheckoutService, useValue: checkoutService }],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
  });

  it("checks out the current user's cart, not one read from the request body", async () => {
    const order = { id: 'order-1', status: 'PLACED' };
    checkoutService.checkout.mockResolvedValue(order);
    const dto = { sessionId: 'session-1', addressId: 'address-1' };

    const result = await controller.checkout(
      { userId: 'user-1', email: 'jane@example.co.za' },
      dto,
    );

    expect(checkoutService.checkout).toHaveBeenCalledWith('user-1', dto);
    expect(result).toBe(order);
  });
});
