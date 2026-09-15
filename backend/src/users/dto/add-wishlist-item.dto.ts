import { IsNotEmpty } from 'class-validator';

export class AddWishlistItemDto {
  @IsNotEmpty()
  productId: string;
}
