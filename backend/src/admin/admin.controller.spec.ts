import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: { getMarketplaceAnalytics: jest.Mock };

  beforeEach(async () => {
    adminService = { getMarketplaceAnalytics: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: adminService }],
    })
      // JwtAuthGuard/RolesGuard authentication and role-checking is
      // covered end to end by test/checkout-orders-admin.e2e-spec.ts
      // (real 401s and 403s over HTTP); this file only tests that the
      // controller delegates correctly, so the guards are stubbed out
      // rather than pulling in their own dependencies (Reflector,
      // PrismaService) just to satisfy Nest's DI at module-compile time.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('returns the marketplace analytics from the service unchanged', async () => {
    const analytics = { totalOrders: 5, vendorBreakdown: [] };
    adminService.getMarketplaceAnalytics.mockResolvedValue(analytics);

    const result = await controller.getAnalytics();

    expect(adminService.getMarketplaceAnalytics).toHaveBeenCalledWith();
    expect(result).toBe(analytics);
  });
});
