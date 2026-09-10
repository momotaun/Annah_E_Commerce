import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PRODUCT_IMAGE_URL_PATTERN } from '../../common/product-image-url-pattern';

// Every field is optional so the onboarding "Store Setup" step can send just
// the logo/bio it collects, and the settings page can send whatever changed.
// Nullable fields (bio, logoUrl) accept an explicit null to clear them —
// @IsOptional() skips the remaining validators for null as well as
// undefined.
export class UpdateVendorProfileDto {
  @IsOptional()
  @IsNotEmpty()
  businessName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @IsOptional()
  @IsString()
  @Matches(PRODUCT_IMAGE_URL_PATTERN, {
    message: 'logoUrl must be an uploaded image URL',
  })
  logoUrl?: string | null;
}
