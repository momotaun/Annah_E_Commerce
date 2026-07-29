export class CartItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
  };
  lineTotal: string;
}

export class CartResponseDto {
  id: string;
  sessionId: string;
  items: CartItemResponseDto[];
  subtotal: string;
}
