import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  productId: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number = 1;
}
