# Apex Marketplace

A multi-vendor e-commerce marketplace: shoppers browse a shared catalogue, vendors apply to sell and manage their own storefronts and products, and admins approve vendors and maintain platform-wide content. Checkout is backed by [Ozow](https://ozow.com), a South African instant EFT payment gateway.

This repository is a monorepo with two independently deployable apps:

| App | Path | Stack |
|---|---|---|
| API | [`backend/`](backend) | NestJS 11, Prisma 6, PostgreSQL |
| Web | [`frontend/`](frontend) | Next.js 16 (App Router), React 19, Tailwind CSS 4 |

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for app-specific details. This file covers running the whole stack locally.

## Features

- Product catalogue with categories, search, and per-vendor storefronts
- Session-based cart (works for guests, merges into the account on login) and checkout
- Payments via Ozow (hosted instant EFT redirect + webhook confirmation)
- Order history for shoppers
- Vendor onboarding, product management, and order/sales views
- Admin dashboard for vendor approval, marketplace analytics, and editing legal pages (Privacy Policy, Terms of Service) without a deploy
- JWT-based auth with short-lived access tokens and rotating refresh tokens

## Prerequisites

- Node.js 20 or later
- Docker (for a local PostgreSQL instance) — or a PostgreSQL 16 instance you provide yourself

## Getting started

Clone the repo, then set up the database, API, and web app in that order.

### 1. Database

```bash
cp .env.example .env
docker compose up -d
```

This starts a `postgres:16-alpine` container using the credentials in `.env`. The defaults in `.env.example` work out of the box for local development.

### 2. Backend (API)

```bash
cd backend
cp .env.example .env
npm install
```

Open `backend/.env` and fill in:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate each with `node -e "console.log(require('crypto').randomBytes(50).toString('hex'))"`
- `OZOW_*` — only required to actually initiate a payment; everything else works without them. See [`backend/README.md`](backend/README.md#payments-ozow) for details.

Then apply migrations, seed some sample data, and start the API:

```bash
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

The API is now running at `http://localhost:3001/api`.

The seed script creates two accounts for local testing — **do not use these outside local development**:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@apex.co.za` | `adminPassword123` |
| Vendor | `vendor@meridianapparel.co.za` | `vendorPassword123` |

### 3. Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

The site is now running at `http://localhost:3000`. It talks to the API at `http://localhost:3001/api` by default; override this with `NEXT_PUBLIC_API_URL` if your API runs elsewhere.

## Running tests

```bash
cd backend && npm test      # Jest — unit tests
cd frontend && npm test     # Vitest — component tests
```

## Repository layout

```
.
├── backend/             NestJS API — see backend/README.md
├── frontend/            Next.js web app — see frontend/README.md
├── docker-compose.yml   Local PostgreSQL for development
└── .env.example         Env vars for docker-compose (Postgres credentials)
```

Note there are two separate `.env` files: the one at the repo root only configures the local Postgres container via `docker-compose.yml`; the API's own configuration (database connection, JWT secrets, payment gateway credentials) lives in `backend/.env`.
