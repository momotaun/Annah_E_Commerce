import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VendorOrdersService } from './vendor-orders.service';
import { VendorOrdersController } from './vendor-orders.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [VendorOrdersController],
  providers: [VendorOrdersService, RolesGuard],
})
export class VendorOrdersModule {}
