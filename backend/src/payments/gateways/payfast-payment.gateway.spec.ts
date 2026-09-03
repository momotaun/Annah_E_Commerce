import { createHash } from 'crypto';
import { InternalServerErrorException } from '@nestjs/common';
import { PayfastPaymentGateway } from './payfast-payment.gateway';

function pfUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(
      /[!'()*~]/g,
      (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
    );
}

// Outgoing (initiate): PayFast's own generateSignature() skips blank values.
function expectedSignature(
  pairs: Array<[string, string]>,
  passphrase?: string,
): string {
  const base = pairs
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${pfUrlEncode(v)}`)
    .join('&');
  const full = passphrase
    ? `${base}&passphrase=${pfUrlEncode(passphrase)}`
    : base;
  return createHash('md5').update(full).digest('hex');
}

// Incoming (ITN): PayFast's own validation walks $_POST as received and
// does NOT skip blanks (it only stops once it hits the 'signature' key) —
// see the gateway's verifyWebhookSignature doc comment.
function expectedItnSignature(
  pairs: Array<[string, string]>,
  passphrase?: string,
): string {
  const base = pairs.map(([k, v]) => `${k}=${pfUrlEncode(v)}`).join('&');
  const full = passphrase
    ? `${base}&passphrase=${pfUrlEncode(passphrase)}`
    : base;
  return createHash('md5').update(full).digest('hex');
}

describe('PayfastPaymentGateway', () => {
  const ORIGINAL_ENV = process.env;
  let gateway: PayfastPaymentGateway;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      PAYFAST_MERCHANT_ID: '10053897',
      PAYFAST_MERCHANT_KEY: '6cqu7rtkk1nrr',
      PAYFAST_PASSPHRASE: 'super-secret-salt',
      PAYFAST_IS_TEST: 'true',
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_URL: 'http://localhost:3001',
    };
    gateway = new PayfastPaymentGateway();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('initiate', () => {
    it('throws if PayFast env vars are missing', async () => {
      delete process.env.PAYFAST_MERCHANT_ID;
      gateway = new PayfastPaymentGateway();

      await expect(
        gateway.initiate({
          orderId: 'order-1',
          amount: '500.00',
          currency: 'ZAR',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('builds a sandbox redirect URL with a correctly-signed query string', async () => {
      const result = await gateway.initiate({
        orderId: 'order-1',
        amount: '500',
        currency: 'ZAR',
      });

      const url = new URL(result.redirectUrl);
      expect(url.origin + url.pathname).toBe(
        'https://sandbox.payfast.co.za/eng/process',
      );

      const params = url.searchParams;
      expect(params.get('merchant_id')).toBe('10053897');
      expect(params.get('merchant_key')).toBe('6cqu7rtkk1nrr');
      expect(params.get('amount')).toBe('500.00');
      expect(params.get('m_payment_id')).toBe(result.transactionRef);
      expect(params.get('notify_url')).toBe(
        'http://localhost:3001/api/payments/webhook/payfast',
      );
      expect(params.get('return_url')).toContain(
        '/checkout/payment-result?orderId=order-1&outcome=success',
      );

      const expected = expectedSignature(
        [
          ['merchant_id', params.get('merchant_id')!],
          ['merchant_key', params.get('merchant_key')!],
          ['return_url', params.get('return_url')!],
          ['cancel_url', params.get('cancel_url')!],
          ['notify_url', params.get('notify_url')!],
          ['m_payment_id', params.get('m_payment_id')!],
          ['amount', params.get('amount')!],
          ['item_name', params.get('item_name')!],
        ],
        'super-secret-salt',
      );
      expect(params.get('signature')).toBe(expected);
    });

    it('uses the live process URL when PAYFAST_IS_TEST is false', async () => {
      process.env.PAYFAST_IS_TEST = 'false';
      gateway = new PayfastPaymentGateway();

      const result = await gateway.initiate({
        orderId: 'order-1',
        amount: '500.00',
        currency: 'ZAR',
      });

      expect(result.redirectUrl).toContain(
        'https://www.payfast.co.za/eng/process',
      );
    });
  });

  describe('verifyWebhookSignature', () => {
    function buildPayload(signature: string) {
      return {
        m_payment_id: 'payfast_abc123',
        pf_payment_id: '1089250',
        payment_status: 'COMPLETE',
        item_name: 'Order abc123',
        item_description: '',
        amount_gross: '500.00',
        amount_fee: '-4.60',
        amount_net: '495.40',
        custom_str1: '',
        custom_str2: '',
        custom_str3: '',
        custom_str4: '',
        custom_str5: '',
        custom_int1: '',
        custom_int2: '',
        custom_int3: '',
        custom_int4: '',
        custom_int5: '',
        name_first: '',
        name_last: '',
        email_address: '',
        merchant_id: '10053897',
        signature,
      };
    }

    const ITN_ORDER: Array<keyof ReturnType<typeof buildPayload>> = [
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
    ];

    it('accepts a payload whose signature matches the recomputed one', () => {
      const payload = buildPayload('placeholder');
      const valid = expectedItnSignature(
        ITN_ORDER.map((k) => [k, payload[k]] as [string, string]),
        'super-secret-salt',
      );

      expect(
        gateway.verifyWebhookSignature({ ...payload, signature: valid }),
      ).toBe(true);
    });

    it('rejects a payload with a tampered signature', () => {
      expect(
        gateway.verifyWebhookSignature(buildPayload('not-the-real-signature')),
      ).toBe(false);
    });

    it('rejects a payload with a tampered field even if signature looks well-formed', () => {
      const payload = buildPayload('placeholder');
      const valid = expectedItnSignature(
        ITN_ORDER.map((k) => [k, payload[k]] as [string, string]),
        'super-secret-salt',
      );

      expect(
        gateway.verifyWebhookSignature({
          ...payload,
          signature: valid,
          amount_gross: '1.00',
        }),
      ).toBe(false);
    });

    it('verifies correctly when no passphrase is configured', () => {
      delete process.env.PAYFAST_PASSPHRASE;
      gateway = new PayfastPaymentGateway();

      const payload = buildPayload('placeholder');
      const valid = expectedItnSignature(
        ITN_ORDER.map((k) => [k, payload[k]] as [string, string]),
        undefined,
      );

      expect(
        gateway.verifyWebhookSignature({ ...payload, signature: valid }),
      ).toBe(true);
    });
  });
});
