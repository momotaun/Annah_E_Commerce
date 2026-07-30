import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PaymentGateway,
  InitiatePaymentResult,
} from './payment-gateway.interface';

/**
 * Placeholder gateway implementation. The SDD (Section 7.2) specifies the
 * real payment gateway is "client-provided" but does not name one — this
 * stub lets PaymentsModule be fully wired end-to-end (initiate → webhook →
 * order status update) without a real provider selected yet. Swap this out
 * for a real implementation of PaymentGateway once the client confirms
 * their provider, no other module code should need to change.
 */
@Injectable()
export class StubPaymentGateway implements PaymentGateway {
  async initiate(params: {
    orderId: string;
    amount: string;
    currency: string;
  }): Promise<InitiatePaymentResult> {
    const transactionRef = `stub_${randomUUID()}`;
    return {
      transactionRef,
      redirectUrl: `https://stub-gateway.example.com/pay/${transactionRef}`,
    };
  }

  verifyWebhookSignature(): boolean {
    // Real implementation must verify an HMAC/signature header supplied by
    // the actual gateway before this is safe to deploy. Always returns
    // true for now so the webhook flow is testable locally.
    return true;
  }
}
