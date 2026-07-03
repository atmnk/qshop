# Qshop

Qshop is an open source multi-vendor marketplace sample app built with Next.js, React 19, Drizzle ORM, Better Auth, Neon Postgres, and hosted payment providers.

This repo supports two main roles:

- Buyers can browse products, add items to cart, place orders, and complete checkout through a hosted payment page.
- Sellers can sign in to a dashboard, create products, manage listings, and track orders.

The project was assembled end-to-end with Codex, so this repository is also a useful reference if you want to study an AI-assisted full-stack app with real auth, database, and payment integrations.

## What is in the app

- Next.js App Router storefront and seller dashboard
- Better Auth email/password authentication with email verification
- Drizzle ORM models for users, products, orders, sessions, accounts, and verifications
- Neon/Postgres-backed data layer
- Cart state stored in the browser
- Hosted checkout support through DodoPayments or Chargebee
- Seed script with sample buyers, sellers, and products

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM + drizzle-kit
- Better Auth
- Neon serverless Postgres driver
- DodoPayments or Chargebee

## Bootstrap locally

### 1. Prerequisites

- Node.js `v24.13.0` (from [`.tool-versions`](./.tool-versions))
- npm
- A Postgres database URL
  - Neon works out of the box, but any PostgreSQL database should work as long as `DATABASE_URL` is valid.
  - If you do not already have Postgres running, the easiest beginner path is Docker. See the next step.

### 2. Install dependencies

```bash
npm install
```

### 3. Start Postgres locally with Docker (optional, beginner-friendly)

If you already have a Postgres database, skip to the next step.

If you have Docker installed, this will start a local Postgres 16 container:

```bash
docker run --name qshop-postgres \
  -e POSTGRES_USER=qshop \
  -e POSTGRES_PASSWORD=qshop \
  -e POSTGRES_DB=qshop \
  -p 5432:5432 \
  -d postgres:16
```

Use this local connection string in `.env.local`:

```env
DATABASE_URL=postgresql://qshop:qshop@localhost:5432/qshop
```

Helpful Docker commands:

```bash
docker start qshop-postgres
docker stop qshop-postgres
docker logs qshop-postgres
```

If port `5432` is already in use on your machine, change the port mapping to something like `-p 5433:5432` and then use:

```env
DATABASE_URL=postgresql://qshop:qshop@localhost:5433/qshop
```

### 4. Create your local env file

Copy the example file and fill in the values you want to use:

```bash
cp .env.example .env.local
```

Minimum env vars required to boot the app:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
PAYMENT_GATEWAY=dodo
NEXT_PUBLIC_PAYMENT_GATEWAY=dodo
```

Notes:

- `DATABASE_URL` is required immediately. The app reads it at startup.
- `MAILJET_*` vars are needed if you want sign-up email verification to work.
- Payment credentials are only required if you want to test real hosted checkout.
- If you just want to explore the app locally, use the seeded users below instead of creating new accounts.
- If you used the Docker Postgres setup above, paste that `DATABASE_URL` directly into `.env.local`.

### 5. Push the schema to your database

This repo currently bootstraps best with `db:push`:

```bash
npm run db:push
```

Optional database commands:

```bash
npm run db:generate
npm run db:studio
npm run db:clean
```

### 6. Seed demo data

```bash
npm run db:seed
```

This creates:

- 5 seller accounts
- 4 buyer accounts
- a populated product catalog

All seeded accounts use the password:

```text
password123
```

Example users:

- Buyer: `alice@qshop.dev`
- Buyer: `bob@qshop.dev`
- Seller: `techgadgets@qshop.dev`
- Seller: `stylehub@qshop.dev`

### 7. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Local testing flow

If you want the fastest first run:

1. Set up `.env.local`
2. Start Postgres
3. Run `npm run db:push`
4. Run `npm run db:seed`
5. Run `npm run dev`
6. Sign in with a seeded buyer or seller account

What you can test without extra third-party setup:

- Browse products
- Add items to cart
- Sign in with seeded accounts
- Open buyer pages like `/orders` and `/profile`
- Open seller pages like `/seller` and `/seller/products`
- Create and edit products as a seller

What needs external services configured:

- New account sign-up with email verification requires Mailjet SMTP credentials
- Real checkout redirect requires either DodoPayments or Chargebee credentials
- Payment confirmation updates require the matching webhook setup

## Environment variables

See [`.env.example`](./.env.example) for the full list.

Important groups:

- Database: `DATABASE_URL`
- App URLs: `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`
- Auth secret: `BETTER_AUTH_SECRET`
- Mail: `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_FROM_EMAIL`
- Payments: `PAYMENT_GATEWAY`, `NEXT_PUBLIC_PAYMENT_GATEWAY`
- Dodo: `DODO_PAYMENTS_API_KEY`, `DODO_WEBHOOK_SECRET`
- Chargebee: `CHARGEBEE_SITE`, `CHARGEBEE_API_KEY`, `CHARGEBEE_WEBHOOK_PASSWORD`

## Project shape

```text
src/app                Next.js routes for shop, auth, seller, and APIs
src/components         UI, cart, product, and seller components
src/db                 Drizzle database client and schema
src/lib                auth, session, payments, and shared helpers
scripts                database seed and cleanup scripts
```

## Helpful scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:seed
npm run db:clean
npm run db:studio
```

## Notes for contributors

- The app defaults to `dodo` as the payment gateway when `PAYMENT_GATEWAY` is not set.
- Seeded users are marked as email-verified, so they work well for local development.
- Auth, seeding, and Drizzle config load values from `.env.local`.
- Checkout creates an order first, then redirects to the configured hosted payment page.
