import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  transactionRef: string;

  @IsIn(['SUCCEEDED', 'FAILED'])
  status: 'SUCCEEDED' | 'FAILED';
}
