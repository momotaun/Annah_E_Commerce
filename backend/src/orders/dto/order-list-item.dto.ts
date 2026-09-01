export class OrderReturnRequestDto {
  status: string;
  reason: string;
  createdAt: Date;
}

export class OrderListItemDto {
  id: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  returnRequest: OrderReturnRequestDto | null;
  createdAt: Date;
}
