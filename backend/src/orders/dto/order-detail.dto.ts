export class OrderDetailItemDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  priceAtOrder: string;
}

export class OrderDetailPaymentDto {
  id: string;
  provider: string;
  status: string;
  amount: string;
}

export class OrderDetailReturnRequestDto {
  status: string;
  reason: string;
  createdAt: Date;
}

export class OrderDetailDto {
  id: string;
  status: string;
  totalAmount: string;
  address: {
    line1: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: OrderDetailItemDto[];
  payments: OrderDetailPaymentDto[];
  invoice: {
    invoiceNumber: string;
    issuedAt: Date;
  } | null;
  returnRequest: OrderDetailReturnRequestDto | null;
  createdAt: Date;
}
