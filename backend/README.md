# Apex Marketplace — API

NestJS + Prisma + PostgreSQL backend for Apex Marketplace. See the [repo root README](../README.md) for how this fits together with the frontend.

## Tech stack

- [NestJS 11](https://nestjs.com) on Express
- [Prisma 6](https://www.prisma.io) against PostgreSQL 16
- JWT auth (`@nestjs/jwt` + `passport-jwt`) with access + refresh tokens
- `class-validator` / `class-transformer` for request validation (enforced globally — see `src/main.ts`)
- [PayFast](https://payfast.co.za) and [Ozow](https://ozow.com) payment gateways
- Jest for unit and e2e tests

## Setup

Requires a running PostgreSQL instance — the root [`docker-compose.yml`](../docker-compose.yml) provides one for local development.

```bash
npm install
cp .env.example .env   # then fill in the values below
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

The API listens on `http://localhost:3001` with a global `/api` prefix (e.g. `GET http://localhost:3001/api/categories`).

`GET /api/health` reports readiness for load balancers/orchestrators — `200 {"status":"ok","database":"up"}` when it can reach Postgres, `503` otherwise.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FRONTEND_URL` | Yes | Origin allowed by CORS; also used to build Ozow redirect URLs |
| `BACKEND_URL` | Yes (for payments) | This API's own publicly reachable base URL — Ozow's webhook must be able to reach it. Use a tunnel (ngrok or similar) for local development |
| `JWT_ACCESS_SECRET` | Yes | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Signing secret for refresh tokens (must differ from the access secret) |
| `JWT_ACCESS_EXPIRES_IN` | No | Default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Default `7d` |
| `PAYMENT_PROVIDER` | No | Gateway for new payments: `payfast` (default) or `ozow` |
| `DEFAULT_COMMISSION_RATE` | No | Percentage commission applied to vendor order items at checkout; default `10.00` |
| `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` | For PayFast payments | From the PayFast merchant dashboard |
| `PAYFAST_PASSPHRASE` | Optional for PayFast | Merchant passphrase used for signature verification |
| `PAYFAST_IS_TEST` | No | Defaults to sandbox/test mode; set `false` only for live payments |
| `OZOW_SITE_CODE`, `OZOW_PRIVATE_KEY`, `OZOW_API_KEY` | For Ozow payments | Merchant credentials; keep private keys secret |
| `OZOW_IS_TEST` | No | Defaults to Ozow staging/test mode |
| `RESEND_API_KEY` | No | Selects Resend for email; if unset the API logs email links through `ConsoleMailer` |
| `OBJECT_STORAGE_*` | No | S3-compatible image upload configuration |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | No | Selects Firebase push notifications; if unset the API uses a console notifier |

`DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are required for local startup. `FRONTEND_URL` is also required in production. Payment credentials are required only for the selected gateway when initiating payments; payment webhooks are handled by their matching gateway. `BACKEND_URL` must be publicly reachable for a payment provider to deliver webhooks.

## Available scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start the API in watch mode |
| `npm run start:prod` | Run the compiled build (`npm run build` first) |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | ESLint, auto-fixing |
| `npm test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests against a running instance |
| `npm run test:cov` | Unit tests with coverage report |

## Database

Schema and migrations live in `prisma/`. To change the schema:

```bash
# edit prisma/schema.prisma, then:
npx prisma migrate dev --name <describe-the-change>
```

`prisma/seed.ts` (run via `npx prisma db seed`) is idempotent — its writes use `upsert`, and admin-edited legal content survives a reseed. It also creates fixed local-development accounts with known passwords, documented in the [root README](../README.md#seeded-local-accounts), so it refuses to run when `NODE_ENV=production` unless `ALLOW_SEED_IN_PRODUCTION=true` is explicitly set.

## Payments (PayFast and Ozow)

`src/payments/` implements the payment flow behind a `PaymentGateway` interface (`src/payments/gateways/payment-gateway.interface.ts`). Set `PAYMENT_PROVIDER=payfast` (the default) or `PAYMENT_PROVIDER=ozow` to select the gateway for new payments. Both gateway-specific webhook routes remain enabled:

1. `POST /api/payments` (authenticated) validates order ownership and status, then returns a redirect URL to the selected provider's hosted checkout.
2. The shopper returns to `${FRONTEND_URL}/checkout/payment-result`; independently, the payment provider calls its webhook endpoint (`POST /api/payments/webhook` for Ozow or `POST /api/payments/webhook/payfast` for PayFast).
3. The API validates the provider signature before updating payment/order state.

For local end-to-end payment testing, the selected provider must be able to reach `BACKEND_URL`; use a secure development tunnel and that public URL for callbacks. Keep the provider's test/sandbox mode enabled.

## Password reset & email

Email is sent through the `Mailer` interface. Set `RESEND_API_KEY` to use the Resend implementation; otherwise `ConsoleMailer` logs links instead of sending email, which is useful for local password-reset and verification flows. Check backend logs for the generated link.

Reset tokens are single-use, expire after 1 hour, and resetting a password revokes every existing refresh token for that account.

## Docker

`Dockerfile` is a multi-stage build (deps → build → production) that runs as a non-root user and declares a `HEALTHCHECK` against `/api/health`. Notable detail: `nest build` compiles to `dist/src/main.js`, not `dist/main.js` — `prisma/` lives outside `src/`, so TypeScript's inferred rootDir spans both directories and the output preserves the `src/` prefix. `package.json`'s `start:prod` and the Dockerfile's `CMD` both account for this.

Build and run standalone:

```bash
docker build -t apex-backend .
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL=postgresql://apex_user:apex_password@host.docker.internal:5432/apex_marketplace \
  apex-backend
```

(`host.docker.internal` lets the container reach a Postgres running on your host; use the `postgres` service name instead when running via the root [`docker-compose.yml`](../docker-compose.yml).)

The image applies pending Prisma migrations and seeds default site branding during startup. The full development seed (`npx prisma db seed`) is not run automatically because it creates accounts with known passwords and refuses to run in production mode. When using the root Compose stack, the backend container waits for PostgreSQL and applies migrations on startup; run the full seed from the host after copying `backend/.env.example` to `backend/.env` and ensuring its `DATABASE_URL` points to `localhost:5432`:

```bash
cd backend
npm ci
npx prisma db seed
```

### Frontend needs two API URLs when containerized

`NEXT_PUBLIC_API_URL` is inlined into the frontend's browser bundle at build time, so it has to be a URL the *browser* can reach — but when the frontend server-renders a page inside its own container, that same request comes from the *frontend container*, which can't necessarily reach that URL (e.g. `localhost` inside a container isn't the host). The frontend's `api-client.ts` therefore also reads a plain runtime `API_URL` env var for server-side requests only, preferring it over `NEXT_PUBLIC_API_URL` when running on the server. `docker-compose.yml` sets `NEXT_PUBLIC_API_URL=http://localhost:3001/api` (a build arg, for the browser) and `API_URL=http://backend:3001/api` (a normal runtime env var, for SSR) on the frontend service — see [`frontend/Dockerfile`](../frontend/Dockerfile).

## Project structure

Each top-level module under `src/` is a self-contained Nest module (controller + service + DTOs):

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, JWT refresh, password reset |
| `users` | Profile and address management |
| `products` / `categories` / `search` | Catalogue browsing |
| `cart` | Session-based cart, mergeable into an account |
| `checkout` | Converts a cart into an order; splits vendor line items and computes commissions |
| `payments` | PayFast and Ozow integrations (see above) |
| `orders` | Authenticated order history and detail |
| `order-requests` | Pre-checkout guest quote/inquiry requests |
| `vendors` / `vendor-products` / `vendor-orders` | Vendor onboarding, product management, and order views |
| `admin` | Marketplace analytics and vendor approval |
| `legal-pages` | Admin-editable Privacy Policy / Terms of Service content |
| `common` | Shared infrastructure (global exception filter) |

## Testing

```bash
npm test              # unit tests
npm run test:e2e       # e2e tests
```

Note: coverage is uneven across modules — some services have thorough unit tests, others (and most controllers) currently have none. Check a given module's directory for a `*.spec.ts` file before assuming it's covered.
