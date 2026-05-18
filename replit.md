# Luxe & Line

A luxury UK e-commerce website for a Pakistani fashion brand based in Liverpool. Sells shalwar kameez (Nureh Gardenia, Charizma Sun Shone, Zeenet Embroidered), premium jeans, leather wallets, and Pistachio Kunafa Bites (£22). All prices include UK delivery.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/luxe-and-line run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `RESEND_API_KEY` — email sending via Resend; `RESEND_FROM` — sender address override
- Optional env: `VITE_GOOGLE_CLIENT_ID` (frontend) — enables "Continue with Google" buttons

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, wouter (routing), TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (two bundles: `dist/index.mjs` for dev server, `dist/app.mjs` for Vercel)
- Email: Resend (`resend` npm package) — falls back gracefully if RESEND_API_KEY not set

## Where things live

- `lib/api-spec/openapi.yaml` — full OpenAPI spec (source of truth for API contract)
- `lib/db/src/schema/index.ts` — DB schema (products, orders, users, reviews tables)
- `lib/db/src/schema/reviews.ts` — reviews table schema
- `artifacts/api-server/src/routes/` — Express route handlers (products, cart, orders, admin, reviews, auth)
- `artifacts/api-server/src/mailer.ts` — Resend email helpers (order confirmation + welcome emails)
- `artifacts/luxe-and-line/src/pages/` — All frontend pages
- `artifacts/luxe-and-line/src/components/` — Navbar, Footer, Layout + shadcn/ui components
- `artifacts/luxe-and-line/public/videos/` — Cropped homepage videos (video1.mp4, video2.mp4, video3.mp4)
- `artifacts/luxe-and-line/public/product-images/` — Kunafa product images (kunafa-front.jpg, kunafa-back.jpg)
- `artifacts/luxe-and-line/public/sitemap.xml` — SEO sitemap
- `artifacts/luxe-and-line/public/robots.txt` — SEO robots file

## Architecture decisions

- Session-based in-memory cart (Map keyed by cookie) — no user auth required for shopping
- Admin login uses email-only validation (see ADMIN_EMAILS below), token stored in localStorage
- Customer accounts: users table in DB (name, email, passwordHash, token). Register/Login at /register /login. Token stored in localStorage as "customer_token" and "customer_user".
- Google OAuth: POST /api/auth/google — verifies Google ID token via tokeninfo endpoint, upserts user in DB
- All product prices include UK delivery (deliveryIncluded column in DB)
- Videos are cropped (bottom 80px removed) to remove watermarks; served from public/
- Payment methods: bank transfer and cash on delivery — no payment gateway needed
- Reviews stored in DB (reviews table) — submitted via POST /api/reviews; moderated = false by default

## Product

- **Homepage**: 3-video scroll-driven hero → Featured products → Category grid → Brand story → Contact strip
- **Shop**: Category-filtered product grid with "The Edit" branding; red SALE badge; gold prices
- **Product Detail**: Image gallery, size/colour picker, quantity selector, add to cart; related products section
- **Cart**: Item management, quantity adjustment, order summary
- **Checkout**: Delivery info form, bank transfer / cash on delivery payment
- **Order Confirmation**: Success state with next steps and contact info
- **About**: Particle diamond animation background, brand story, team info (Amjad Khan / Zaheena Khan), product gallery
- **Contact**: Hexagon geometric animation background, contact details + form
- **Policy/Terms**: Floating dots / pulse grid animation backgrounds
- **Admin Portal**: Email login (3 admins), Orders/Users/Reviews tabs, dashboard stats, order status management
- **Login / Register**: Customer account pages at /login and /register. Password hashed with scrypt. Google OAuth button. Token persisted in localStorage.
- **Reviews**: DB-backed review submission form; star rating; 4.8/5 display
- **Terms & Conditions**: 13-section detailed legal document at /terms
- **Privacy Policy**: 12-section UK GDPR compliant document at /policy

## User preferences

- Business contact: Atif Shah, +44 7405 358689, 39 Stanley Street L7 0JN Liverpool
- Owner: Amjad Khan | Vice Owner: Zaheena Khan (shown in Footer + About page)
- Admin emails: syedimad348@gmail.com, zaheenaamjad@gmail.com, luxeline26@gmail.com
- Site email: hello@luxeandline.co.uk
- Luxury dark navy (#0D1117 range) + gold (HSL 43 65% 50%) theme
- Fonts: Cormorant Garamond (serif display) + Montserrat (body)

## Gotchas

- Cart is in-memory — restarting the API server clears all carts
- Admin token is a fixed string "luxe_admin_secret_token_2024" — not production-grade auth
- Products use Unsplash placeholder images for clothing/wallets; kunafa uses real images
- The `@import url()` for Google Fonts must be the FIRST line in index.css (PostCSS requirement)
- Google OAuth requires a Google Cloud project with OAuth 2.0 client ID; set VITE_GOOGLE_CLIENT_ID env var
- Resend emails are sent from "onboarding@resend.dev" until a verified domain is configured in RESEND_FROM
- Reviews table added in a later migration — if DB is reset, run `pnpm --filter @workspace/db run push` again

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Vercel deployment: outputDirectory is `artifacts/luxe-and-line/dist/public`; API runs as serverless function from `dist/app.mjs`
