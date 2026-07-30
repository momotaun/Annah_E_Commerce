export class PaymentResponseDto {
  id: string;
  orderId: string;
  provider: string;
  transactionRef: string;
  status: string;
  amount: string;
  redirectUrl?: string;
}
