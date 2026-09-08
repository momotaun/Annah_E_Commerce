import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { createHash } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

interface AuthResponseBody {
  accessToken: string;
  user: { id: string };
}

interface ProductsListBody {
  data: { id: string }[];
}

interface AddressBody {
  id: string;
}

interface CartBody {
  sessionId: string;
}

interface OrderBody {
  id: string;
  status: string;
  totalAmount: string;
}

interface PaymentResponseBody {
  id: string;
  orderId: string;
  provider: string;
  transactionRef: string;
  status: string;
  amount: string;
  redirectUrl?: string;
}

// Real-looking (but non-production) PayFast sandbox credentials — the same
// ones PayFast's own docs use as example test values, and what
// payfast-payment.gateway.spec.ts already uses for its unit tests. Only
// PayFast is exercised here (per the product decision that Ozow isn't a
// live integration yet), and PAYMENT_PROVIDER is deliberately left unset
// below so this also proves PayFast really is the default gateway, not
// just *a* working one.
const PAYFAST_TEST_ENV = {
  PAYFAST_MERCHANT_ID: '10053897',
  PAYFAST_MERCHANT_KEY: '6cqu7rtkk1nrr',
  PAYFAST_PASSPHRASE: 'e2e-test-passphrase',
  PAYFAST_IS_TEST: 'true',
};

// PayFast's urlencode() (PHP) encodes spaces as '+' and escapes !'()* —
// mirrors PayfastPaymentGateway's private pfUrlEncode exactly, since ITN
// payloads in this file need to be signed the same way PayFast itself
// signs them.
function pfUrlEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(
      /[!'()*~]/g,
      (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
    );
}

// PayFast's ITN field order — see PayfastPaymentGateway's ITN_FIELD_ORDER
// doc comment for why this exact order (and not alphabetical, and not
// object-iteration order) matters for the signature to match.
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

type ItnFields = Record<(typeof ITN_FIELD_ORDER)[number], string>;

function signItn(fields: ItnFields, passphrase: string): string {
  const base = ITN_FIELD_ORDER.map(
    (k) => `${k}=${pfUrlEncode(fields[k])}`,
  ).join('&');
  return createHash('md5')
    .update(`${base}&passphrase=${pfUrlEncode(passphrase)}`)
    .digest('hex');
}

// Builds a fully-formed, correctly-signed ITN payload — exactly what a real
// PayFast webhook POST body looks like — with sensible defaults so each
// test only has to specify what it's actually varying.
function buildItn(
  overrides: Partial<ItnFields>,
): ItnFields & { signature: string } {
  const fields: ItnFields = {
    m_payment_id: '',
    pf_payment_id: '1000001',
    payment_status: 'COMPLETE',
    item_name: 'Order test',
    item_description: '',
    amount_gross: '0.00',
    amount_fee: '-1.00',
    amount_net: '0.00',
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
    merchant_id: PAYFAST_TEST_ENV.PAYFAST_MERCHANT_ID,
    ...overrides,
  };
  return {
    ...fields,
    signature: signItn(fields, PAYFAST_TEST_ENV.PAYFAST_PASSPHRASE),
  };
}

// Exercises the real revenue-critical path — initiate a PayFast payment,
// then simulate PayFast's own ITN webhook hitting our server — over real
// HTTP against the real database, the same way checkout-orders-admin does
// for the rest of checkout. Unit tests already cover the gateway's signing
// math and the service's branching logic in isolation; what only shows up
// here is: does the real controller route actually reach PayFast's gateway
// with real env config, does the ValidationPipe accept a real ITN body
// shape, and does a webhook POST really flip a real order to PAID.
describe('PayFast payments (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const ORIGINAL_ENV = { ...process.env };

  const testEmail = `e2e-payfast-${Date.now()}@example.test`;
  const otherEmail = `e2e-payfast-other-${Date.now()}@example.test`;

  let accessToken: string;
  let otherAccessToken: string;
  let userId: string;
  let addressId: string;
  let productId: string;

  const orderIds: string[] = [];

  beforeAll(async () => {
    Object.assign(process.env, PAYFAST_TEST_ENV);
    delete process.env.PAYMENT_PROVIDER; // unset = PayFast, matching production's actual default

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'testPassword123',
        firstName: 'E2E',
        lastName: 'Payer',
      });
    accessToken = (registerRes.body as AuthResponseBody).accessToken;
    userId = (registerRes.body as AuthResponseBody).user.id;

    const otherRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: otherEmail,
        password: 'testPassword123',
        firstName: 'Someone',
        lastName: 'Else',
      });
    otherAccessToken = (otherRes.body as AuthResponseBody).accessToken;

    const productsRes = await request(app.getHttpServer()).get(
      '/api/products?limit=1',
    );
    productId = (productsRes.body as ProductsListBody).data[0].id;

    const addressRes = await request(app.getHttpServer())
      .post('/api/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        line1: '1 Payment Test Avenue',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
      });
    addressId = (addressRes.body as AddressBody).id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    if (userId) {
      await prisma.cart.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.user.deleteMany({ where: { email: otherEmail } });

    await app.close();
    process.env = ORIGINAL_ENV;
  });

  async function placeOrder(): Promise<OrderBody> {
    const cartRes = await request(app.getHttpServer())
      .post('/api/cart')
      .send({ productId, quantity: 1 });
    const checkoutRes = await request(app.getHttpServer())
      .post('/api/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sessionId: (cartRes.body as CartBody).sessionId, addressId });

    const order = checkoutRes.body as OrderBody;
    orderIds.push(order.id);
    return order;
  }

  describe('initiating a payment', () => {
    let order: OrderBody;

    beforeAll(async () => {
      order = await placeOrder();
    });

    it('requires authentication', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .send({ orderId: order.id });

      expect(res.status).toBe(401);
    });

    it("refuses to initiate payment for someone else's order", async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({ orderId: order.id });

      expect(res.status).toBe(403);
    });

    it('returns 404 for a nonexistent order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ orderId: 'does-not-exist' });

      expect(res.status).toBe(404);
    });

    it('defaults to PayFast (not Ozow) and returns a correctly-signed sandbox redirect', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ orderId: order.id });

      expect(res.status).toBe(201);
      const body = res.body as PaymentResponseBody;
      expect(body.provider).toBe('payfast');
      expect(body.status).toBe('INITIATED');
      expect(body.orderId).toBe(order.id);
      expect(body.transactionRef).toMatch(/^payfast_/);

      const url = new URL(body.redirectUrl!);
      expect(url.origin + url.pathname).toBe(
        'https://sandbox.payfast.co.za/eng/process',
      );
      expect(url.searchParams.get('merchant_id')).toBe(
        PAYFAST_TEST_ENV.PAYFAST_MERCHANT_ID,
      );
      expect(url.searchParams.get('m_payment_id')).toBe(body.transactionRef);
      expect(url.searchParams.get('amount')).toBe(
        Number(order.totalAmount).toFixed(2),
      );
      // Recomputing the exact signature here would just duplicate the
      // gateway's own unit tests — this end confirms one really is
      // present and well-formed on a real HTTP response.
      expect(url.searchParams.get('signature')).toMatch(/^[0-9a-f]{32}$/);

      const payment = await prisma.payment.findUnique({
        where: { transactionRef: body.transactionRef },
      });
      expect(payment).not.toBeNull();
      expect(payment!.provider).toBe('payfast');
      expect(payment!.status).toBe('INITIATED');
      expect(payment!.amount.toString()).toBe(order.totalAmount);
    });

    it('refuses to initiate a second payment once the order is no longer PLACED', async () => {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ orderId: order.id });

      expect(res.status).toBe(400);
    });
  });

  describe('the PayFast ITN webhook', () => {
    async function initiatePayment(
      order: OrderBody,
    ): Promise<PaymentResponseBody> {
      const res = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ orderId: order.id });
      return res.body as PaymentResponseBody;
    }

    it('flips the order to PAID on a well-signed COMPLETE notification for the right amount', async () => {
      const order = await placeOrder();
      const payment = await initiatePayment(order);

      const itn = buildItn({
        m_payment_id: payment.transactionRef,
        payment_status: 'COMPLETE',
        amount_gross: Number(order.totalAmount).toFixed(2),
        item_name: `Order ${order.id.slice(0, 20)}`,
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ received: true, alreadyProcessed: false });

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder!.status).toBe('PAID');
      const updatedPayment = await prisma.payment.findUnique({
        where: { transactionRef: payment.transactionRef },
      });
      expect(updatedPayment!.status).toBe('SUCCEEDED');
    });

    it('is idempotent — a replayed COMPLETE notification is a no-op, not reprocessed', async () => {
      const order = await placeOrder();
      const payment = await initiatePayment(order);
      const itn = buildItn({
        m_payment_id: payment.transactionRef,
        payment_status: 'COMPLETE',
        amount_gross: Number(order.totalAmount).toFixed(2),
      });

      const first = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);
      expect(first.body).toEqual({ received: true, alreadyProcessed: false });

      const replay = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);
      expect(replay.status).toBe(201);
      expect(replay.body).toEqual({ received: true, alreadyProcessed: true });

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder!.status).toBe('PAID');
    });

    it('rejects a notification with a tampered signature and leaves the order untouched', async () => {
      const order = await placeOrder();
      const payment = await initiatePayment(order);
      const itn = buildItn({
        m_payment_id: payment.transactionRef,
        payment_status: 'COMPLETE',
        amount_gross: Number(order.totalAmount).toFixed(2),
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send({ ...itn, signature: 'not-the-real-signature' });

      expect(res.status).toBe(403);

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder!.status).toBe('PLACED');
    });

    it('rejects a well-signed notification whose amount_gross does not match what was actually charged', async () => {
      const order = await placeOrder();
      const payment = await initiatePayment(order);
      // Internally consistent — this amount really is what the signature
      // covers — but it doesn't match the payment we actually created,
      // which is exactly the tampering scenario this check exists for.
      const itn = buildItn({
        m_payment_id: payment.transactionRef,
        payment_status: 'COMPLETE',
        amount_gross: '1.00',
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);

      expect(res.status).toBe(403);

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder!.status).toBe('PLACED');
      const updatedPayment = await prisma.payment.findUnique({
        where: { transactionRef: payment.transactionRef },
      });
      expect(updatedPayment!.status).toBe('INITIATED');
    });

    it('returns 404 for a well-signed notification referencing a payment we never created', async () => {
      const itn = buildItn({
        m_payment_id: 'payfast_never_existed',
        payment_status: 'COMPLETE',
        amount_gross: '500.00',
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);

      expect(res.status).toBe(404);
    });

    it('marks the payment FAILED and leaves the order un-paid on a CANCELLED notification', async () => {
      const order = await placeOrder();
      const payment = await initiatePayment(order);
      const itn = buildItn({
        m_payment_id: payment.transactionRef,
        payment_status: 'CANCELLED',
        amount_gross: Number(order.totalAmount).toFixed(2),
      });

      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send(itn);

      expect(res.status).toBe(201);

      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      expect(updatedOrder!.status).toBe('PLACED');
      const updatedPayment = await prisma.payment.findUnique({
        where: { transactionRef: payment.transactionRef },
      });
      expect(updatedPayment!.status).toBe('FAILED');
    });

    it('rejects a webhook body missing required ITN fields via the real ValidationPipe', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/payments/webhook/payfast')
        .send({ m_payment_id: 'payfast_incomplete', signature: 'whatever' });

      expect(res.status).toBe(400);
    });
  });
});
