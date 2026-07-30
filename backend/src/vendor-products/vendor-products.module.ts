import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VendorProductsService } from './vendor-products.service';
import { VendorProductsController } from './vendor-products.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [VendorProductsController],
  providers: [VendorProductsService, RolesGuard],
})
export class VendorProductsModule {}
