import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
import {
  DELIVERY_OPTIONS,
  PRODUCT_SEGMENTS,
} from '../../common/product-filters';
import type {
  DeliveryOptionFilter,
  ProductSegmentFilter,
} from '../../common/product-filters';

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

  // Comma-separated, same convention as `category` — a shopper can select
  // more than one delivery speed at once.
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsIn(DELIVERY_OPTIONS, { each: true })
  delivery?: DeliveryOptionFilter[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray()
  @IsIn(PRODUCT_SEGMENTS, { each: true })
  segment?: ProductSegmentFilter[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  // Accepts the usual truthy query-string spellings (?verifiedOnly=true)
  // rather than requiring the client send a literal boolean.
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verifiedOnly?: boolean;

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
