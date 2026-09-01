# Apex Marketplace — Web

Next.js (App Router) frontend for Apex Marketplace. See the [repo root README](../README.md) for how this fits together with the API.

> **Note for contributors:** this project pins a modified build of Next.js with breaking changes from the version you may be used to. Read [`AGENTS.md`](AGENTS.md) and the docs under `node_modules/next/dist/docs/` before relying on prior Next.js knowledge.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router), React 19
- Tailwind CSS 4
- `class-variance-authority` + `tailwind-merge` for component variants
- Vitest + Testing Library for component tests

## Setup

Requires the [API](../backend) running (defaults to `http://localhost:3001/api`).

```bash
npm install
npm run dev
```

The site is available at `http://localhost:3000`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Base URL of the API. Defaults to `http://localhost:3001/api`. Override by adding a `.env.local` file if your API runs elsewhere |

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build (run `npm run build` first) |
| `npm run lint` | ESLint |
| `npm test` | Run component tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project structure

Routes live under `src/app/`, one directory per route following the App Router convention. Notable areas:

| Path | Description |
|---|---|
| `catalogue/`, `products/`, `categories/`, `collections/` | Browsing and product detail |
| `cart/`, `checkout/` | Cart and checkout, including the post-payment landing page at `checkout/payment-result/` |
| `orders/` | Authenticated order history |
| `login/`, `register/`, `forgot-password/`, `reset-password/` | Auth flows |
| `profile/` | Account settings |
| `vendor/`, `vendor-onboarding/`, `vendors/` | Vendor storefronts, dashboard, and the vendor application flow |
| `admin/` | Vendor approval, analytics, and the legal-pages editor |
| `components/` | Shared UI — `ui/` (atoms: Button, Input, etc.), `shared/` (composed pieces), `layout/` (Header/Footer) |
| `playground/` | Internal component gallery for manually reviewing UI atoms; not a customer-facing route |

State that needs to persist across a session (auth, cart) lives in React Context under `src/context/`. API calls are grouped by resource under `src/lib/api/`, all going through the shared `src/lib/api-client.ts` (handles auth headers and silent token refresh on a 401).

## Testing

```bash
npm test
```

Coverage today is limited to core UI atoms (`Button`, `Input`, `Select`, `Checkbox`, `RatingStars`, `ProductCard`) and the `Auth`/`Cart` contexts — most pages (checkout, cart, admin, vendor flows) don't yet have test coverage.
