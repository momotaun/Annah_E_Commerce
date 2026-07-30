export interface InitiatePaymentResult {
  transactionRef: string;
  redirectUrl: string;
}

export interface PaymentGateway {
  initiate(params: {
    orderId: string;
    amount: string;
    currency: string;
  }): Promise<InitiatePaymentResult>;

  verifyWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string | undefined,
  ): boolean;
}
