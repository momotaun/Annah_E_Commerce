# Apex Marketplace

[![CI](https://github.com/momotaun/Annah_E_Commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/momotaun/Annah_E_Commerce/actions/workflows/ci.yml)

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

## Running the full stack in Docker

Both apps have production Dockerfiles (multi-stage, non-root, with a `HEALTHCHECK`). `docker-compose.yml` runs all three services — Postgres, the API, and the web app:

```bash
cp .env.example .env
docker compose up -d --build
```

Migrations aren't run automatically — apply them from the host once Postgres is up (same command either way, containerized or not):

```bash
cd backend && npx prisma migrate deploy
```

The API is then healthy at `http://localhost:3001/api/health`, and the site at `http://localhost:3000`. See [`backend/README.md`](backend/README.md#docker) for why the frontend needs two different API URLs (one for the browser, one for server-side rendering inside its own container).

The `http://localhost:3001/api` default only works when the whole stack runs on one local machine — it's baked into the browser bundle at build time. Deploying for real users needs the actual public API URL instead:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com docker compose up -d --build
```

## Running tests

```bash
cd backend && npm test      # Jest — unit tests
cd frontend && npm test     # Vitest — component tests
```

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and PR to `develop`: lint, production build, unit tests, and (backend) `test:e2e` against a real Postgres service container with migrations applied. Backend lint currently runs with `continue-on-error` — it surfaces a real, pre-existing body of lint debt (mostly `any`-typed Prisma mocks in older `*.service.spec.ts` files) that predates CI and is too large to fix as a side effect of adding it; everything else gates the build.

## Repository layout

```
.
├── backend/             NestJS API — see backend/README.md
├── frontend/            Next.js web app — see frontend/README.md
├── docker-compose.yml   Local PostgreSQL for development
└── .env.example         Env vars for docker-compose (Postgres credentials)
```

Note there are two separate `.env` files: the one at the repo root only configures the local Postgres container via `docker-compose.yml`; the API's own configuration (database connection, JWT secrets, payment gateway credentials) lives in `backend/.env`.
