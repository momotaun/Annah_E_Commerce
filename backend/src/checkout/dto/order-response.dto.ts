export class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: string;
}

export class OrderResponseDto {
  id: string;
  status: string;
  totalAmount: string;
  addressId: string;
  items: OrderItemResponseDto[];
  invoiceNumber: string;
  createdAt: Date;
}
