import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

interface AuthResponseBody {
  accessToken: string;
  user: { id: string };
}

interface ProductsListBody {
  data: { id: string; vendorId: string | null }[];
}

interface AddressBody {
  id: string;
}

interface CartBody {
  sessionId: string;
  items: unknown[];
}

interface OrderBody {
  id: string;
  status: string;
  items: { productId: string; quantity: number }[];
  invoiceNumber: string;
  address?: { line1: string };
  returnRequest: { status: string; resolvedAt: string | null } | null;
}

interface AdminOrdersListBody {
  data: { id: string; returnRequest: { status: string } | null }[];
}

// Exercises the real revenue path end to end against the real database —
// no mocking — because that's exactly what the previous unit-test-only
// coverage for checkout/orders/admin couldn't catch: guard wiring, DTO
// validation via the real ValidationPipe, and cross-module behavior (does
// checkout's vendor-split logic actually produce rows the admin analytics
// endpoint can find?) that only show up when the whole stack runs together.
describe('Checkout, Orders, and Admin (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `e2e-checkout-${Date.now()}@example.test`;
  const otherEmail = `e2e-other-${Date.now()}@example.test`;

  let accessToken: string;
  let otherAccessToken: string;
  let adminAccessToken: string;
  let userId: string;
  let addressId: string;
  let productId: string;
  let productIsVendorOwned = false;

  const orderIds: string[] = [];

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    // Deepest dependency first — Order's children default to onDelete:
    // Restrict (not Cascade), so this order matters: deleting Order before
    // its VendorOrderItem/ReturnRequest/Invoice rows would fail outright.
    await prisma.commission.deleteMany({
      where: { orderItem: { orderId: { in: orderIds } } },
    });
    await prisma.vendorOrderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.returnRequest.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.invoice.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } }); // cascades OrderItem
    if (userId) {
      await prisma.cart.deleteMany({ where: { userId } }); // cascades CartItem
      await prisma.user.delete({ where: { id: userId } }); // cascades RefreshToken, Address
    }
    await prisma.user.deleteMany({ where: { email: otherEmail } }); // cascades RefreshToken

    await app.close();
  });

  it('registers a new customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'testPassword123',
        firstName: 'E2E',
        lastName: 'Tester',
      });

    expect(res.status).toBe(201);
    const body = res.body as AuthResponseBody;
    expect(body.accessToken).toEqual(expect.any(String));
    accessToken = body.accessToken;
    userId = body.user.id;
  });

  it('registers a second, unrelated customer (used later to prove order ownership is enforced)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: otherEmail,
        password: 'testPassword123',
        firstName: 'Someone',
        lastName: 'Else',
      });

    expect(res.status).toBe(201);
    otherAccessToken = (res.body as AuthResponseBody).accessToken;
  });

  it('finds a real product to buy, preferring a vendor-owned one to exercise the commission split', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/products?limit=100',
    );

    expect(res.status).toBe(200);
    const products = (res.body as ProductsListBody).data;
    expect(products.length).toBeGreaterThan(0);

    const vendorProduct = products.find((p) => p.vendorId);
    productId = (vendorProduct ?? products[0]).id;
    productIsVendorOwned = !!vendorProduct;
  });

  it('creates a shipping address for the customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/users/me/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        line1: '123 E2E Test Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
      });

    expect(res.status).toBe(201);
    addressId = (res.body as AddressBody).id;
  });

  describe('a full checkout', () => {
    let sessionId: string;
    let orderId: string;

    it('adds the product to a new cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cart')
        .send({ productId, quantity: 2 });

      expect(res.status).toBe(201);
      const body = res.body as CartBody;
      expect(body.items).toHaveLength(1);
      sessionId = body.sessionId;
    });

    it('turns the cart into a real order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/checkout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ sessionId, addressId });

      expect(res.status).toBe(201);
      const body = res.body as OrderBody;
      expect(body.status).toBe('PLACED');
      expect(body.items).toHaveLength(1);
      expect(body.items[0].productId).toBe(productId);
      expect(body.items[0].quantity).toBe(2);
      expect(body.invoiceNumber).toEqual(expect.any(String));

      orderId = body.id;
      orderIds.push(orderId);
    });

    it('emptied the cart it checked out from', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/cart/${sessionId}`,
      );

      expect(res.status).toBe(200);
      expect((res.body as CartBody).items).toHaveLength(0);
    });

    it('splits the order into a commissioned VendorOrderItem when the product is vendor-owned', async () => {
      const vendorOrderItems = await prisma.vendorOrderItem.findMany({
        where: { orderId },
        include: { commission: true },
      });

      if (productIsVendorOwned) {
        expect(vendorOrderItems).toHaveLength(1);
        expect(vendorOrderItems[0].commission).not.toBeNull();
      } else {
        // Non-vendor (Phase 1/2 catalogue) products deliberately produce
        // no VendorOrderItem — nothing to split.
        expect(vendorOrderItems).toHaveLength(0);
      }
    });

    it('lets the customer see the order in their own list and in detail', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(listRes.status).toBe(200);
      const list = listRes.body as { id: string }[];
      expect(list.some((o) => o.id === orderId)).toBe(true);

      const detailRes = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(detailRes.status).toBe(200);
      const detail = detailRes.body as OrderBody;
      expect(detail.id).toBe(orderId);
      expect(detail.address?.line1).toBe('123 E2E Test Street');
    });

    it('refuses to let a different customer view this order', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('refuses an unauthenticated request entirely', async () => {
      const res = await request(app.getHttpServer()).get(
        `/api/orders/${orderId}`,
      );

      expect(res.status).toBe(401);
    });

    it('lets the customer cancel it while still PLACED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect((res.body as OrderBody).status).toBe('CANCELLED');
    });

    it('refuses to cancel it a second time, since it is no longer PLACED', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('a return request, from filing through admin resolution', () => {
    let orderId: string;

    beforeAll(async () => {
      // Returns can only be requested for a PAID/DELIVERED order, and
      // there's no Ozow webhook to trigger in this test — so this checks
      // out a second cart the normal way, then reaches into the database
      // to mark it PAID, standing in for "the payment webhook already
      // fired." Everything from here on goes through real HTTP endpoints.
      const cartRes = await request(app.getHttpServer())
        .post('/api/cart')
        .send({ productId, quantity: 1 });
      const checkoutRes = await request(app.getHttpServer())
        .post('/api/checkout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          sessionId: (cartRes.body as CartBody).sessionId,
          addressId,
        });

      orderId = (checkoutRes.body as OrderBody).id;
      orderIds.push(orderId);
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });
    });

    it('lets the customer file a return request', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/orders/${orderId}/return-request`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reason: 'Wrong size, needs a medium instead.' });

      expect(res.status).toBe(200);
      expect((res.body as OrderBody).returnRequest?.status).toBe('PENDING');
    });

    it('refuses filing a second return request for the same order', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/orders/${orderId}/return-request`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ reason: 'Trying again.' });

      expect(res.status).toBe(409);
    });

    it('refuses a non-admin customer trying to view the admin orders list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(403);
    });

    it('lets an admin see the pending return request and approve it', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@apex.co.za', password: 'adminPassword123' });
      expect(loginRes.status).toBe(200);
      adminAccessToken = (loginRes.body as AuthResponseBody).accessToken;

      const listRes = await request(app.getHttpServer())
        .get('/api/admin/orders?limit=100')
        .set('Authorization', `Bearer ${adminAccessToken}`);
      expect(listRes.status).toBe(200);
      const listed = (listRes.body as AdminOrdersListBody).data.find(
        (o) => o.id === orderId,
      );
      expect(listed).toBeDefined();
      expect(listed?.returnRequest?.status).toBe('PENDING');

      const resolveRes = await request(app.getHttpServer())
        .patch(`/api/admin/orders/${orderId}/return-request`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'APPROVED' });
      expect(resolveRes.status).toBe(200);
      const resolved = resolveRes.body as OrderBody;
      expect(resolved.returnRequest?.status).toBe('APPROVED');
      expect(resolved.returnRequest?.resolvedAt).not.toBeNull();
    });

    it('refuses resolving the same return request twice', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/admin/orders/${orderId}/return-request`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'REJECTED' });

      expect(res.status).toBe(400);
    });
  });
});
