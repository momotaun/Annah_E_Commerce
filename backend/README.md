# Apex Marketplace — API

NestJS + Prisma + PostgreSQL backend for Apex Marketplace. See the [repo root README](../README.md) for how this fits together with the frontend.

## Tech stack

- [NestJS 11](https://nestjs.com) on Express
- [Prisma 6](https://www.prisma.io) against PostgreSQL 16
- JWT auth (`@nestjs/jwt` + `passport-jwt`) with access + refresh tokens
- `class-validator` / `class-transformer` for request validation (enforced globally — see `src/main.ts`)
- [Ozow](https://ozow.com) as the payment gateway
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
| `DEFAULT_COMMISSION_RATE` | No | Percentage commission applied to vendor order items at checkout; default `10.00` |
| `OZOW_SITE_CODE` | For payments | From your Ozow merchant dashboard |
| `OZOW_PRIVATE_KEY` | For payments | Used to sign requests and verify webhook signatures — never expose this |
| `OZOW_API_KEY` | For payments | Sent as the `ApiKey` header on requests to Ozow |
| `OZOW_IS_TEST` | For payments | `true` routes to Ozow's staging API and marks transactions as test; set `false` to take real payments |

Everything except the `OZOW_*` and `BACKEND_URL` variables is required for the API to boot and serve most routes; payments-related endpoints will fail without the Ozow variables set.

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

`prisma/seed.ts` (run via `npx prisma db seed`) is idempotent — every write is an `upsert`, so re-running it never overwrites data that's already been changed (e.g. admin edits to legal page content survive a reseed). It does, however, create the fixed local-dev accounts documented in the [root README](../README.md#2-backend-api) with known passwords — don't run it against a database anyone else can reach.

## Payments (Ozow)

`src/payments/` implements the payment flow behind a `PaymentGateway` interface (`src/payments/gateways/payment-gateway.interface.ts`), with `OzowPaymentGateway` as the concrete implementation:

1. `POST /api/payments` (authenticated) — validates the order belongs to the caller and is still `PLACED`, calls Ozow's `PostPaymentRequest` API, and returns a redirect URL to Ozow's hosted payment page.
2. Ozow redirects the shopper back to `${FRONTEND_URL}/checkout/payment-result` and, independently, POSTs a status notification to `POST /api/payments/webhook`. The webhook payload's `Hash` field is verified before anything is applied; on a genuine success the order is transactioned to `PAID`.

Because Ozow needs to reach `BACKEND_URL` directly, local end-to-end testing requires exposing your local API through a tunnel and pointing Ozow's dashboard (or `BACKEND_URL`) at it.

## Project structure

Each top-level module under `src/` is a self-contained Nest module (controller + service + DTOs):

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, JWT refresh, password reset |
| `users` | Profile and address management |
| `products` / `categories` / `search` | Catalogue browsing |
| `cart` | Session-based cart, mergeable into an account |
| `checkout` | Converts a cart into an order; splits vendor line items and computes commissions |
| `payments` | Ozow integration (see above) |
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
