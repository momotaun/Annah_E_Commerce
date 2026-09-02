import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminOrdersController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
