import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  PaymentGateway,
  InitiatePaymentResult,
} from './payment-gateway.interface';

interface OzowPostPaymentRequestResponse {
  paymentRequestId?: string;
  url?: string;
  errorMessage?: string | null;
}

/**
 * Ozow (https://ozow.com) instant EFT gateway. Hash algorithm and field
 * order follow Ozow's "Hosted Payment Page" integration guide: concatenate
 * the listed field values in order, append the private key, lowercase the
 * whole string, then SHA512-hex it. Verify this against Ozow's current
 * docs/sandbox before taking real payments — their docs are the source of
 * truth, not this comment.
 */
@Injectable()
export class OzowPaymentGateway implements PaymentGateway {
  private hash(values: Array<string | undefined>, privateKey: string): string {
    const concatenated = values.map((v) => v ?? '').join('') + privateKey;
    return createHash('sha512')
      .update(concatenated.toLowerCase())
      .digest('hex')
      .toLowerCase();
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new InternalServerErrorException(
        `Ozow is not configured: missing ${name}`,
      );
    }
    return value;
  }

  async initiate(params: {
    orderId: string;
    amount: string;
    currency: string;
  }): Promise<InitiatePaymentResult> {
    const siteCode = this.requireEnv('OZOW_SITE_CODE');
    const privateKey = this.requireEnv('OZOW_PRIVATE_KEY');
    const apiKey = this.requireEnv('OZOW_API_KEY');
    const isTest = process.env.OZOW_IS_TEST === 'true';
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
    const apiBaseUrl =
      process.env.OZOW_API_BASE_URL ??
      (isTest ? 'https://stagingapi.ozow.com' : 'https://api.ozow.com');

    const transactionReference = `ozow_${randomUUID()}`;
    const bankReference = params.orderId.slice(0, 20);
    const amount = Number(params.amount).toFixed(2);

    const successUrl = `${frontendUrl}/checkout/payment-result?orderId=${params.orderId}&outcome=success`;
    const cancelUrl = `${frontendUrl}/checkout/payment-result?orderId=${params.orderId}&outcome=cancelled`;
    const errorUrl = `${frontendUrl}/checkout/payment-result?orderId=${params.orderId}&outcome=error`;
    const notifyUrl = `${backendUrl}/api/payments/webhook`;
    const isTestValue = isTest ? 'true' : 'false';

    const hashCheck = this.hash(
      [
        siteCode,
        'ZA',
        params.currency,
        amount,
        transactionReference,
        bankReference,
        '',
        '',
        '',
        '',
        '',
        cancelUrl,
        errorUrl,
        successUrl,
        notifyUrl,
        isTestValue,
      ],
      privateKey,
    );

    const requestBody = {
      SiteCode: siteCode,
      CountryCode: 'ZA',
      CurrencyCode: params.currency,
      Amount: amount,
      TransactionReference: transactionReference,
      BankReference: bankReference,
      Optional1: '',
      Optional2: '',
      Optional3: '',
      Optional4: '',
      Optional5: '',
      CancelUrl: cancelUrl,
      ErrorUrl: errorUrl,
      SuccessUrl: successUrl,
      NotifyUrl: notifyUrl,
      IsTest: isTestValue,
      HashCheck: hashCheck,
    };

    const res = await fetch(`${apiBaseUrl}/postpaymentrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ApiKey: apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const data = (await res
      .json()
      .catch(() => ({}))) as OzowPostPaymentRequestResponse;

    if (!res.ok || !data.url || data.errorMessage) {
      throw new InternalServerErrorException(
        `Ozow payment request failed: ${data.errorMessage ?? res.statusText}`,
      );
    }

    return {
      transactionRef: transactionReference,
      redirectUrl: data.url,
    };
  }

  verifyWebhookSignature(payload: Record<string, string>): boolean {
    const privateKey = process.env.OZOW_PRIVATE_KEY;
    if (!privateKey) return false;

    const expected = this.hash(
      [
        payload.SiteCode,
        payload.TransactionId,
        payload.TransactionReference,
        payload.Amount,
        payload.Status,
        payload.Optional1,
        payload.Optional2,
        payload.Optional3,
        payload.Optional4,
        payload.Optional5,
        payload.CurrencyCode,
        payload.IsTest,
        payload.StatusMessage,
      ],
      privateKey,
    );

    return !!payload.Hash && expected === payload.Hash.toLowerCase();
  }
}
