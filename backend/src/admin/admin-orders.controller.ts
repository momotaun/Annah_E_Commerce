import {
  Body,
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
import { AdminService } from './admin.service';
import { ResolveReturnRequestDto } from './dto/resolve-return-request.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminOrdersController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.listOrders();
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
