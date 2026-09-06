import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PRODUCT_SORT_OPTIONS } from '../../common/product-sort';
import type { ProductSort } from '../../common/product-sort';

export class QueryProductsDto {
  // Accepts either a single slug or a comma-separated list (?category=a,b)
  // so the catalogue filter can select more than one category at once.
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsString({ each: true })
  category?: string[]; // category slugs

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsIn(PRODUCT_SORT_OPTIONS)
  sort?: ProductSort;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

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
