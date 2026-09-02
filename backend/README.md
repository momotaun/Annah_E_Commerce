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

`prisma/seed.ts` (run via `npx prisma db seed`) is idempotent — every write is an `upsert`, so re-running it never overwrites data that's already been changed (e.g. admin edits to legal page content survive a reseed). It does, however, create the fixed local-dev accounts documented in the [root README](../README.md#2-backend-api) with known passwords, so it refuses to run at all when `NODE_ENV=production` (set `ALLOW_SEED_IN_PRODUCTION=true` for the rare case you genuinely mean to).

## Payments (Ozow)

`src/payments/` implements the payment flow behind a `PaymentGateway` interface (`src/payments/gateways/payment-gateway.interface.ts`), with `OzowPaymentGateway` as the concrete implementation:

1. `POST /api/payments` (authenticated) — validates the order belongs to the caller and is still `PLACED`, calls Ozow's `PostPaymentRequest` API, and returns a redirect URL to Ozow's hosted payment page.
2. Ozow redirects the shopper back to `${FRONTEND_URL}/checkout/payment-result` and, independently, POSTs a status notification to `POST /api/payments/webhook`. The webhook payload's `Hash` field is verified before anything is applied; on a genuine success the order is transactioned to `PAID`.

Because Ozow needs to reach `BACKEND_URL` directly, local end-to-end testing requires exposing your local API through a tunnel and pointing Ozow's dashboard (or `BACKEND_URL`) at it.

## Password reset & email

There is no email provider wired up yet (no SMTP/SendGrid/Resend/etc.). `src/auth/` sends mail through a `Mailer` interface (`src/auth/mailer/mailer.interface.ts`); the only implementation right now is `ConsoleMailer`, which logs the reset link instead of emailing it — check the server log (`[ConsoleMailer] Password reset link for ...`) to get a working link during local development. Swap in a real implementation and change the provider in `src/auth/auth.module.ts` when one is chosen; nothing else needs to change.

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

The image doesn't run migrations on startup — apply them explicitly (from the host, against whichever `DATABASE_URL` you're targeting):

```bash
npx prisma migrate deploy
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
