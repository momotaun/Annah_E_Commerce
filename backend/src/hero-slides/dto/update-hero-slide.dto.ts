import { CreateHeroSlideDto } from './create-hero-slide.dto';

// Same shape as create — a hero slide's fields are all meaningfully required
// (a slide with no image or CTA isn't valid), so this is a full-field
// replace rather than a PartialType, matching how vendor product create/
// update deliberately diverge from a blanket "everything optional" pattern.
export class UpdateHeroSlideDto extends CreateHeroSlideDto {}
