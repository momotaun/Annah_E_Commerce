import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderRequestDto {
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerContact: string;
}
