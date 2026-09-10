import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PRODUCT_IMAGE_URL_PATTERN } from '../../common/product-image-url-pattern';

export class UpdateSiteSettingsDto {
  @IsString()
  @MinLength(1)
  siteName: string;

  // @IsOptional() treats both undefined (field omitted) and null (explicit
  // clear) as "missing" and skips the rest of this field's validators — so
  // sending logoUrl: null to remove the logo passes without being checked
  // against the URL pattern, exactly as intended.
  @IsOptional()
  @IsString()
  @Matches(PRODUCT_IMAGE_URL_PATTERN, {
    message: 'logoUrl must be an uploaded image URL',
  })
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  announcementText?: string | null;
}
