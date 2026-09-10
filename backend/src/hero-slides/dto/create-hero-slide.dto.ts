import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PRODUCT_IMAGE_URL_PATTERN } from '../../common/product-image-url-pattern';

export class CreateHeroSlideDto {
  @IsString()
  @MinLength(1)
  eyebrow: string;

  @IsString()
  @MinLength(1)
  headlineBefore: string;

  @IsString()
  @MinLength(1)
  highlight: string;

  // Allowed to be "" — slide 4's real copy today has no text after the
  // highlighted word ("Gear up for your next [adventure]").
  @IsString()
  headlineAfter: string;

  @IsString()
  @MinLength(1)
  subheading: string;

  @IsString()
  @Matches(PRODUCT_IMAGE_URL_PATTERN, {
    message: 'imageUrl must be an uploaded image URL',
  })
  imageUrl: string;

  @IsString()
  @MinLength(1)
  ctaLabel: string;

  // Not validated as an internal route — an admin could legitimately link a
  // slide to an external promo URL, not just a same-site path.
  @IsString()
  @MinLength(1)
  ctaHref: string;

  @IsString()
  @MinLength(1)
  badgeValue: string;

  @IsString()
  @MinLength(1)
  badgeCaption: string;

  // The admin UI sends an explicit null to clear a previously-set category
  // (as opposed to omitting the field) — @IsOptional() skips validation for
  // both null and undefined, so the type has to admit null too.
  @IsOptional()
  @IsString()
  categorySlug?: string | null;
}
