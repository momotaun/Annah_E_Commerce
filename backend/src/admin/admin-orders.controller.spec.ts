import { Test, TestingModule } from '@nestjs/testing';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AdminOrdersController', () => {
  let controller: AdminOrdersController;
  let adminService: { listOrders: jest.Mock; resolveReturnRequest: jest.Mock };

  beforeEach(async () => {
    adminService = {
      listOrders: jest.fn(),
      resolveReturnRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminOrdersController],
      providers: [{ provide: AdminService, useValue: adminService }],
    })
      // See admin.controller.spec.ts — guard behavior itself is covered
      // by the e2e suite; these are stubbed so Nest's DI doesn't need
      // their real dependencies just to compile this test module.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminOrdersController>(AdminOrdersController);
  });

  it('passes the page/limit query straight through to the service', async () => {
    const page = {
      data: [],
      meta: { page: 2, limit: 10, total: 0, totalPages: 0 },
    };
    adminService.listOrders.mockResolvedValue(page);
    const query = { page: 2, limit: 10 };

    const result = await controller.findAll(query);

    expect(adminService.listOrders).toHaveBeenCalledWith(query);
    expect(result).toBe(page);
  });

  it('resolves a return request using the orderId route param and the status from the body', async () => {
    const updated = { id: 'order-1' };
    adminService.resolveReturnRequest.mockResolvedValue(updated);

    const result = await controller.resolveReturnRequest('order-1', {
      status: 'APPROVED',
    });

    expect(adminService.resolveReturnRequest).toHaveBeenCalledWith(
      'order-1',
      'APPROVED',
    );
    expect(result).toBe(updated);
  });
});
