export class VendorOrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  lineTotal: string;
  commissionAmount: string;
  orderStatus: string;
  orderCreatedAt: Date;
}
