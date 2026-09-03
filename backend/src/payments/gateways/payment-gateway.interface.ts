export interface InitiatePaymentResult {
  transactionRef: string;
  redirectUrl: string;
}

export interface PaymentGateway {
  readonly providerName: string;

  initiate(params: {
    orderId: string;
    amount: string;
    currency: string;
  }): Promise<InitiatePaymentResult>;

  // Real gateways commonly embed their signature/hash as a field within the
  // webhook payload itself (Ozow, PayFast) rather than in a header, so the
  // gateway needs the full set of posted fields to recompute and compare it.
  verifyWebhookSignature(payload: Record<string, string>): boolean;
}
