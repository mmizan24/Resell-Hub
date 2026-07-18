# ResellHub Frontend

ResellHub is a marketplace frontend built with Next.js App Router. It powers the buyer, seller, and admin experiences for a second-hand product platform with Stripe checkout, role-based dashboards, wishlist support, reviews, and marketplace discovery pages.

## Key Features

- Public marketplace homepage with featured products, seller highlights, categories, and trust sections
- Product browsing with search, category filtering, seller filtering, sorting, and review summaries
- Secure buyer checkout with Stripe
- Payment success, cancel, and loading states
- Buyer dashboard with orders, payment history, wishlist, profile editing, and product reviews
- Seller dashboard with add product, inventory management, order flow, and sales analytics
- Admin dashboard with user, product, order, and admin-member management
- MongoDB-backed auth and marketplace data
- Responsive UI across desktop, tablet, and mobile

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Heroui
- Motion
- MongoDB Node driver
- Better Auth
- Stripe

## Project Structure

- `src/app` - App Router pages, layouts, and API routes
- `src/components` - Shared feature components used by the app routes
- `components` - Shared UI for the homepage, dashboards, checkout, and product views
- `src/lib` - Database, auth, Stripe, marketplace, review, and order helpers
- `scripts` - Development helpers and admin bootstrap script
- `public` - Static assets

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database or Atlas cluster
- Stripe account
- ImgBB account for image uploads
- Google OAuth credentials if you use Google sign-in

## Environment Variables

Create `resell-client/resellhub/.env.local` from `.env.example` and fill in:

- `API_URL` - Express server base URL, usually `http://localhost:5000`
- `MONGODB_URI` - MongoDB connection string used by auth and marketplace reads
- `AUTH_DB_NAME` - Auth database name, usually `resellhub`
- `IMGBB_API_KEY` - ImgBB upload key
- `NEXT_PUBLIC_APP_URL` - Public frontend URL, usually `http://localhost:3000`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key for server routes
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `GOOGLE_CLIENT_ID` - Optional Google OAuth client id
- `GOOGLE_CLIENT_SECRET` - Optional Google OAuth client secret

## Setup

```bash
cd resell-client/resellhub
npm install
```

Then create the local environment file:

```bash
copy .env.example .env.local
```

Update the values before starting the app.

## Development

The project has two useful development modes:

```bash
npm run dev
```

This helper script starts the backend server on port `5000` if needed and then launches Next.js on port `3000`.

```bash
npm run dev:next
```

Use this if the backend is already running separately and you only want the Next.js app.

## Production Build

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Main Pages

- `/` - Marketplace home
- `/products` - Full product browser
- `/products/[id]` - Product details
- `/categories` - Category directory
- `/sellers` - Seller directory
- `/wishlist` - Buyer wishlist
- `/checkout` - Secure checkout flow
- `/checkout/success` - Payment success page
- `/checkout/cancel` - Payment cancelled page
- `/dashboard/buyer` - Buyer dashboard
- `/dashboard/seller` - Seller dashboard
- `/dashboard/admin` - Admin dashboard

## How The App Gets Data

- Product catalog and marketplace summaries come from the Express server and MongoDB
- Auth, admin, seller, buyer, orders, reviews, and payments are all driven by MongoDB-backed server routes
- The frontend reads approved product data and hides pending seller listings from buyers

## Notes For Deployment

- Make sure `API_URL` points to the deployed backend
- Make sure `MONGODB_URI` and Stripe keys are set in the deployment environment
- If you deploy the frontend separately, the backend must be reachable from that host
- Keep the backend CORS `FRONTEND_URL` aligned with the deployed frontend URL

## Troubleshooting

- If product data does not load, verify the backend is running and `API_URL` is correct
- If auth fails, confirm `MONGODB_URI`, `AUTH_DB_NAME`, and Better Auth settings
- If uploads fail, check `IMGBB_API_KEY`
- If payments fail, verify the Stripe secret, publishable key, and webhook secret

