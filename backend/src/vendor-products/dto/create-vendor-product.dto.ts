import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

// Accepts either a local /images/... asset (what the seed data uses) or an
// S3 virtual-hosted-style URL (bucket.s3.amazonaws.com or
// bucket.s3.<region>.amazonaws.com) — the only image host this app
// actually integrates with. Anything else is rejected here rather than
// left to break at render time: next/image throws for any remote host
// that isn't in next.config.ts's images.remotePatterns.
const PRODUCT_IMAGE_URL_PATTERN =
  /^(\/images\/[\w.-]+\.(?:jpg|jpeg|png|webp|gif)|https:\/\/[a-z0-9.-]+\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com\/.+)$/i;

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
      'imageUrl must be a local /images/... path or an https S3 URL (bucket.s3.amazonaws.com)',
  })
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
