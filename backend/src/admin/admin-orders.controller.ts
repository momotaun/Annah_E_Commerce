import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { ResolveReturnRequestDto } from './dto/resolve-return-request.dto';
import { QueryAdminOrdersDto } from './dto/query-admin-orders.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminOrdersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll(@Query() query: QueryAdminOrdersDto) {
    return this.adminService.listOrders(query);
  }

  @Patch(':orderId/return-request')
  @HttpCode(HttpStatus.OK)
  resolveReturnRequest(
    @Param('orderId') orderId: string,
    @Body() dto: ResolveReturnRequestDto,
  ) {
    return this.adminService.resolveReturnRequest(orderId, dto.status);
  }
}
