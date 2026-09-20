export class CartItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
    deliveryOption: string | null;
    // Present only for products sold by an approved vendor — mirrors
    // toProductResponseDto's own rule (a pending/suspended vendor has no
    // public storefront to attach a "Sold by" claim to).
    vendor: { businessName: string; verified: boolean } | null;
  };
  lineTotal: string;
}

export class CartResponseDto {
  id: string;
  sessionId: string;
  items: CartItemResponseDto[];
  subtotal: string;
}
