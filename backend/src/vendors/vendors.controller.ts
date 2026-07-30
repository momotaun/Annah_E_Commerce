import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  register(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RegisterVendorDto,
  ) {
    return this.vendorsService.register(user.userId, dto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  approve(@Param('id') id: string, @Body() dto: ApproveVendorDto) {
    return this.vendorsService.approve(id, dto);
  }
}
