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
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { ArchiveVendorProductDto } from './dto/archive-vendor-product.dto';
import { MAX_PRODUCT_IMAGE_SIZE_BYTES } from '../uploads/object-storage.service';

@Controller('vendors/mine/:vendorId/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR')
export class VendorProductsController {
  constructor(private readonly vendorProductsService: VendorProductsService) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
  ) {
    return this.vendorProductsService.findAllForVendor(user.userId, vendorId);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @Body() dto: CreateVendorProductDto,
  ) {
    return this.vendorProductsService.create(user.userId, vendorId, dto);
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_PRODUCT_IMAGE_SIZE_BYTES },
    }),
  )
  async uploadImage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }
    const url = await this.vendorProductsService.uploadProductImage(
      user.userId,
      vendorId,
      file,
    );
    return { url };
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVendorProductDto,
  ) {
    return this.vendorProductsService.update(user.userId, vendorId, id, dto);
  }

  @Post(':id/archive')
  archive(
    @CurrentUser() user: CurrentUserPayload,
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
    @Body() dto: ArchiveVendorProductDto,
  ) {
    return this.vendorProductsService.archive(user.userId, vendorId, id, dto);
  }
}
