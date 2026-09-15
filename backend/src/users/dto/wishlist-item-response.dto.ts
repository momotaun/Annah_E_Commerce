import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class WishlistItemResponseDto {
  id: string;
  productId: string;
  product: ProductResponseDto;
  createdAt: Date;
}
