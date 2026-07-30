import { IsNotEmpty, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
