export class AdminOrderReturnRequestDto {
  status: string;
  reason: string;
  createdAt: Date;
  resolvedAt: Date | null;
}

export class AdminOrderListItemDto {
  id: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  paymentStatus: string | null;
  returnRequest: AdminOrderReturnRequestDto | null;
  createdAt: Date;
}

export class PaginatedAdminOrdersResponseDto {
  data: AdminOrderListItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
