import { createHash } from 'crypto';
import { InternalServerErrorException } from '@nestjs/common';
import { OzowPaymentGateway } from './ozow-payment.gateway';

function expectedHash(values: string[], privateKey: string): string {
  return createHash('sha512')
    .update((values.join('') + privateKey).toLowerCase())
    .digest('hex')
    .toLowerCase();
}

interface OzowRequestBody {
  SiteCode: string;
  CountryCode: string;
  CurrencyCode: string;
  Amount: string;
  TransactionReference: string;
  BankReference: string;
  CancelUrl: string;
  ErrorUrl: string;
  SuccessUrl: string;
  NotifyUrl: string;
  IsTest: string;
  HashCheck: string;
}

describe('OzowPaymentGateway', () => {
  const ORIGINAL_ENV = process.env;
  let gateway: OzowPaymentGateway;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      OZOW_SITE_CODE: 'SITE1',
      OZOW_PRIVATE_KEY: 'super-secret',
      OZOW_API_KEY: 'api-key-123',
      OZOW_IS_TEST: 'true',
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_URL: 'http://localhost:3001',
    };
    gateway = new OzowPaymentGateway();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  function mockFetchResponse(body: unknown, ok = true) {
    fetchMock.mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    } as Response);
  }

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  describe('initiate', () => {
    it('throws if Ozow env vars are missing', async () => {
      delete process.env.OZOW_SITE_CODE;
      gateway = new OzowPaymentGateway();

      await expect(
        gateway.initiate({
          orderId: 'order-1',
          amount: '500.00',
          currency: 'ZAR',
        }),
      ).rejects.toThrow(InternalServerErrorException);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts a correctly-shaped request to Ozow and returns the redirect URL', async () => {
      mockFetchResponse({
        paymentRequestId: 'req-1',
        url: 'https://pay.ozow.com/abc',
      });

      const result = await gateway.initiate({
        orderId: 'order-1',
        amount: '500',
        currency: 'ZAR',
      });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://stagingapi.ozow.com/postpaymentrequest');
      expect(init?.method).toBe('POST');
      expect((init?.headers as Record<string, string>).ApiKey).toBe(
        'api-key-123',
      );

      const body = JSON.parse(init!.body as string) as OzowRequestBody;
      expect(body.SiteCode).toBe('SITE1');
      expect(body.Amount).toBe('500.00');
      expect(body.IsTest).toBe('true');
      expect(body.SuccessUrl).toContain(
        '/checkout/payment-result?orderId=order-1&outcome=success',
      );
      expect(body.NotifyUrl).toBe('http://localhost:3001/api/payments/webhook');

      const expected = expectedHash(
        [
          body.SiteCode,
          body.CountryCode,
          body.CurrencyCode,
          body.Amount,
          body.TransactionReference,
          body.BankReference,
          '',
          '',
          '',
          '',
          '',
          body.CancelUrl,
          body.ErrorUrl,
          body.SuccessUrl,
          body.NotifyUrl,
          body.IsTest,
        ],
        'super-secret',
      );
      expect(body.HashCheck).toBe(expected);

      expect(result).toEqual({
        transactionRef: body.TransactionReference,
        redirectUrl: 'https://pay.ozow.com/abc',
      });
    });

    it('throws when Ozow responds with an error', async () => {
      mockFetchResponse({ errorMessage: 'Invalid site code' });

      await expect(
        gateway.initiate({
          orderId: 'order-1',
          amount: '500.00',
          currency: 'ZAR',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyWebhookSignature', () => {
    function buildPayload(hash: string) {
      return {
        SiteCode: 'SITE1',
        TransactionId: 'txn-1',
        TransactionReference: 'ozow_abc123',
        Amount: '500.00',
        Status: 'Complete',
        Optional1: 'order-1',
        Optional2: '',
        Optional3: '',
        Optional4: '',
        Optional5: '',
        CurrencyCode: 'ZAR',
        IsTest: 'true',
        StatusMessage: 'Complete',
        Hash: hash,
      };
    }

    it('accepts a payload whose Hash matches the recomputed hash', () => {
      const payload = buildPayload('placeholder');
      const validHash = expectedHash(
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
        'super-secret',
      );

      expect(
        gateway.verifyWebhookSignature({ ...payload, Hash: validHash }),
      ).toBe(true);
    });

    it('rejects a payload with a tampered Hash', () => {
      expect(
        gateway.verifyWebhookSignature(buildPayload('not-the-real-hash')),
      ).toBe(false);
    });

    it('rejects a payload with a tampered field even if Hash looks well-formed', () => {
      const payload = buildPayload('placeholder');
      const validHash = expectedHash(
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
        'super-secret',
      );

      expect(
        gateway.verifyWebhookSignature({
          ...payload,
          Hash: validHash,
          Amount: '999.00',
        }),
      ).toBe(false);
    });

    it('returns false when OZOW_PRIVATE_KEY is not configured', () => {
      delete process.env.OZOW_PRIVATE_KEY;
      expect(gateway.verifyWebhookSignature(buildPayload('anything'))).toBe(
        false,
      );
    });
  });
});
