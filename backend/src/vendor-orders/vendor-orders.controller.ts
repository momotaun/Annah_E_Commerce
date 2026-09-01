import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { VendorOrdersService } from './vendor-orders.service';

@Controller('vendors/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR')
export class VendorOrdersController {
  constructor(private readonly vendorOrdersService: VendorOrdersService) {}

  @Get('orders')
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.vendorOrdersService.findAllForVendor(user.userId);
  }

  @Get('sales-report')
  getSalesReport(@CurrentUser() user: CurrentUserPayload) {
    return this.vendorOrdersService.getSalesReport(user.userId);
  }

  @Patch('orders/:orderId/ship')
  @HttpCode(HttpStatus.OK)
  markShipped(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.vendorOrdersService.markShipped(user.userId, orderId);
  }

  @Patch('orders/:orderId/deliver')
  @HttpCode(HttpStatus.OK)
  markDelivered(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.vendorOrdersService.markDelivered(user.userId, orderId);
  }
}
