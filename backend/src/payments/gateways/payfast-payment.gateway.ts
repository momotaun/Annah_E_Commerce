import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import {
  PaymentGateway,
  InitiatePaymentResult,
} from './payment-gateway.interface';

// PayFast's ITN field order, exactly as documented — signature verification
// must walk fields in this order (not object/POST-body iteration order,
// which class-transformer doesn't guarantee preserves), including blank
// ones, stopping before 'signature' itself.
const ITN_FIELD_ORDER = [
  'm_payment_id',
  'pf_payment_id',
  'payment_status',
  'item_name',
  'item_description',
  'amount_gross',
  'amount_fee',
  'amount_net',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'name_first',
  'name_last',
  'email_address',
  'merchant_id',
] as const;

/**
 * PayFast (https://payfast.co.za) hosted checkout gateway. Field order and
 * signature algorithm follow PayFast's Custom Integration guide
 * (developers.payfast.co.za): concatenate non-blank "key=urlencoded(value)"
 * pairs with '&' in *attribute-declaration* order (not alphabetical — that's
 * the separate API-signature format), append "&passphrase=..." when one is
 * set, MD5 the result. PayFast's own urlencode() (PHP) encodes spaces as
 * '+' and escapes !'()* — encodeURIComponent doesn't, hence pfUrlEncode
 * below. Verify against PayFast's current docs/sandbox before taking real
 * payments — their docs are the source of truth, not this comment.
 */
@Injectable()
export class PayfastPaymentGateway implements PaymentGateway {
  readonly providerName = 'payfast';

  private pfUrlEncode(value: string): string {
    return encodeURIComponent(value)
      .replace(/%20/g, '+')
      .replace(
        /[!'()*~]/g,
        (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
      );
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new InternalServerErrorException(
        `PayFast is not configured: missing ${name}`,
      );
    }
    return value;
  }

  // No await needed — unlike Ozow, PayFast's hosted-checkout flow is just a
  // signed redirect URL, no server-to-server call to build it. Stays async
  // anyway so requireEnv() throwing becomes a rejected promise like Ozow's,
  // rather than a synchronous throw callers of this interface don't expect.
  // eslint-disable-next-line @typescript-eslint/require-await
  async initiate(params: {
    orderId: string;
    amount: string;
    currency: string;
  }): Promise<InitiatePaymentResult> {
    const merchantId = this.requireEnv('PAYFAST_MERCHANT_ID');
    const merchantKey = this.requireEnv('PAYFAST_MERCHANT_KEY');
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const isTest = process.env.PAYFAST_IS_TEST !== 'false';
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
    const processUrl =
      process.env.PAYFAST_PROCESS_URL ??
      (isTest
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process');

    // PayFast only supports ZAR — Ozow's `currency` param exists because
    // Ozow's API technically accepts a currency code, but this app only
    // ever transacts in ZAR (see PaymentsService.initiate), so there's
    // nothing to map here.
    const transactionReference = `payfast_${randomUUID()}`;
    const amount = Number(params.amount).toFixed(2);

    const returnUrl = `${frontendUrl}/checkout/payment-result?orderId=${params.orderId}&outcome=success`;
    const cancelUrl = `${frontendUrl}/checkout/payment-result?orderId=${params.orderId}&outcome=cancelled`;
    const notifyUrl = `${backendUrl}/api/payments/webhook/payfast`;

    // Declaration order matters for the outgoing signature too (see class
    // comment) — this object's insertion order IS that order.
    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      m_payment_id: transactionReference,
      amount,
      item_name: `Order ${params.orderId.slice(0, 20)}`,
    };

    const signatureString =
      Object.entries(fields)
        .filter(([, v]) => v !== '')
        .map(([k, v]) => `${k}=${this.pfUrlEncode(v)}`)
        .join('&') +
      (passphrase ? `&passphrase=${this.pfUrlEncode(passphrase)}` : '');

    const signature = createHash('md5').update(signatureString).digest('hex');

    const query = new URLSearchParams({ ...fields, signature }).toString();

    return {
      transactionRef: transactionReference,
      redirectUrl: `${processUrl}?${query}`,
    };
  }

  verifyWebhookSignature(payload: Record<string, string>): boolean {
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    const paramString = ITN_FIELD_ORDER.map(
      (key) => `${key}=${this.pfUrlEncode(payload[key] ?? '')}`,
    ).join('&');

    const fullString = passphrase
      ? `${paramString}&passphrase=${this.pfUrlEncode(passphrase)}`
      : paramString;

    const expected = createHash('md5').update(fullString).digest('hex');

    return !!payload.signature && expected === payload.signature.toLowerCase();
  }
}
