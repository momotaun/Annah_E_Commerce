import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService, RolesGuard],
})
export class VendorsModule {}
