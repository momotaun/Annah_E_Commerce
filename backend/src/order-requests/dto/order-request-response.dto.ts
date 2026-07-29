export class OrderRequestItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtOrder: string;
}

export class OrderRequestResponseDto {
  id: string;
  cartId: string;
  customerName: string;
  customerContact: string;
  status: 'PENDING' | 'REVIEWED' | 'FULFILLED';
  items: OrderRequestItemResponseDto[];
  total: string;
  createdAt: Date;
}
