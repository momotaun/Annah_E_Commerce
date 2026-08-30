import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsService, PAYMENT_GATEWAY } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OzowPaymentGateway } from './gateways/ozow-payment.gateway';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENT_GATEWAY, useClass: OzowPaymentGateway },
  ],
})
export class PaymentsModule {}
