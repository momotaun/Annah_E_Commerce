import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  category?: string; // category slug

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100) // a client could otherwise request ?limit=999999 and force the whole catalogue back in one query
  limit?: number = 20;
}
