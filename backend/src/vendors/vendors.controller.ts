import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { MAX_PRODUCT_IMAGE_SIZE_BYTES } from '../uploads/object-storage.service';

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

  // The `mine` routes are declared before `:id` — Nest matches in
  // declaration order, so `GET /vendors/mine` would otherwise be swallowed
  // by `GET /vendors/:id` with id="mine". Guarded by login only (not the
  // VENDOR role): a PENDING-only vendor is still a CUSTOMER and needs these
  // to finish onboarding.
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findAllMine(@CurrentUser() user: CurrentUserPayload) {
    return this.vendorsService.findAllMine(user.userId);
  }

  @Get('mine/:vendorId')
  @UseGuards(JwtAuthGuard)
  findMine(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
  ) {
    return this.vendorsService.findMine(user.userId, vendorId);
  }

  @Patch('mine/:vendorId')
  @UseGuards(JwtAuthGuard)
  updateMine(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.vendorsService.updateMine(user.userId, vendorId, dto);
  }

  @Post('mine/:vendorId/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE_BYTES },
    }),
  )
  async uploadLogo(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }
    const url = await this.vendorsService.uploadLogo(
      user.userId,
      vendorId,
      file,
    );
    return { url };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  approve(@Param('id') id: string, @Body() dto: ApproveVendorDto) {
    return this.vendorsService.approve(id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Query('status') status?: 'PENDING' | 'APPROVED' | 'SUSPENDED') {
    return this.vendorsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findPublic(id);
  }
}
