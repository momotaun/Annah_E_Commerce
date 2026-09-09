import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { PRODUCT_IMAGE_URL_PATTERN } from '../../common/product-image-url-pattern';

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
}
