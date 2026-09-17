import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { InvoicePdfService } from './invoice-pdf.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, InvoicePdfService],
})
export class OrdersModule {}
