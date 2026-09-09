import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ObjectStorageService } from '../uploads/object-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [VendorProductsController],
  providers: [VendorProductsService, RolesGuard, ObjectStorageService],
})
export class VendorProductsModule {}
