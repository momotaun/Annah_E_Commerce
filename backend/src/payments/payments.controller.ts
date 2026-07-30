import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  initiate(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiate(user.userId, dto);
  }

  @Post('webhook')
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-signature') signature: string | undefined,
    @Body() dto: PaymentWebhookDto,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(dto));
    return this.paymentsService.handleWebhook(rawBody, signature, dto);
  }
}
