import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PaymentsService, PAYMENT_GATEWAY } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OzowPaymentGateway } from './gateways/ozow-payment.gateway';
import { PayfastPaymentGateway } from './gateways/payfast-payment.gateway';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OzowPaymentGateway,
    PayfastPaymentGateway,
    // Both gateways are always registered (webhooks need their matching
    // gateway regardless of which is active), but only one is used for new
    // payments — PAYMENT_PROVIDER=ozow switches it back; defaults to
    // PayFast since it's the one with a self-serve sandbox for the demo.
    {
      provide: PAYMENT_GATEWAY,
      useFactory: (ozow: OzowPaymentGateway, payfast: PayfastPaymentGateway) =>
        process.env.PAYMENT_PROVIDER === 'ozow' ? ozow : payfast,
      inject: [OzowPaymentGateway, PayfastPaymentGateway],
    },
  ],
})
export class PaymentsModule {}
