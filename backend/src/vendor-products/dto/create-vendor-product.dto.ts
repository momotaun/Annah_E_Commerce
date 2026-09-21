import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';
import { PRODUCT_IMAGE_URL_PATTERN } from '../../common/product-image-url-pattern';
import { ProductOptionInputDto } from './product-option-input.dto';

export class CreateVendorProductDto {
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  // The pre-discount "was" price. Optional — set it to put the product on
  // sale, or send null to clear one (same @IsOptional()-treats-null-as-
  // missing convention as UpdateSiteSettingsDto.logoUrl). Not validated
  // against price here (e.g. > price): a vendor may legitimately clear a
  // sale by lowering price below a stale compareAtPrice before removing
  // it, and the response only ever renders a discount when
  // compareAtPrice > price anyway.
  @IsOptional()
  @IsNumber()
  @IsPositive()
  compareAtPrice?: number | null;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  @Matches(PRODUCT_IMAGE_URL_PATTERN, {
    message:
      'imageUrl must be a local /images/... path, an https S3 URL (bucket.s3.amazonaws.com), or a Neon Object Storage URL (*.aws.neon.tech)',
  })
  imageUrl?: string;

  // Already-uploaded image URLs (via POST /vendors/me/products/images),
  // in display order. imageUrl is derived from images[0] if not set
  // explicitly, so existing single-image consumers (product cards, cart,
  // order line items) keep working unchanged.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @Matches(PRODUCT_IMAGE_URL_PATTERN, { each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  // Variant pickers (Color, Size, Storage Capacity...) — which types are
  // valid depends on categoryId, checked in VendorProductsService against
  // product-option-types.ts's CATEGORY_OPTION_TYPES (a DTO decorator alone
  // can't see a sibling field's value). Sending [] clears every existing
  // option on update; omitting the field entirely leaves them untouched.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionInputDto)
  options?: ProductOptionInputDto[];
}
