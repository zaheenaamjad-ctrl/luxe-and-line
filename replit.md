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

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, wouter (routing), TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — full OpenAPI spec (source of truth for API contract)
- `lib/db/src/schema/index.ts` — DB schema (products + orders tables)
- `artifacts/api-server/src/routes/` — Express route handlers (products, cart, orders, admin)
- `artifacts/luxe-and-line/src/pages/` — All frontend pages
- `artifacts/luxe-and-line/src/components/` — Navbar, Footer, Layout + shadcn/ui components
- `artifacts/luxe-and-line/public/videos/` — Cropped homepage videos (video1.mp4, video2.mp4, video3.mp4)
- `artifacts/luxe-and-line/public/product-images/` — Kunafa product images (kunafa-front.jpg, kunafa-back.jpg)

## Architecture decisions

- Session-based in-memory cart (Map keyed by cookie) — no user auth required for shopping
- Admin login uses email-only validation (syedimad348@gmail.com OR 15568@cityuniversity.edu.pk), token stored in localStorage
- Customer accounts: users table in DB (name, email, passwordHash, token). Register/Login at /register /login. Token stored in localStorage as "customer_token" and "customer_user".
- All product prices include UK delivery (deliveryIncluded column in DB)
- Videos are cropped (bottom 80px removed) to remove watermarks; served from public/
- Payment methods: bank transfer and cash on delivery — no payment gateway needed

## Product

- **Homepage**: 3-video scroll-driven hero → Featured products → Category grid → Brand story → Contact strip
- **Shop**: Category-filtered product grid with "The Edit" branding
- **Product Detail**: Image gallery, size/colour picker, quantity selector, add to cart
- **Cart**: Item management, quantity adjustment, order summary
- **Checkout**: Delivery info form, bank transfer / cash on delivery payment
- **Order Confirmation**: Success state with next steps and contact info
- **About**: Particle diamond animation background, brand story, team info
- **Contact**: Hexagon geometric animation background, contact details + form
- **Policy/Terms**: Floating dots / pulse grid animation backgrounds
- **Admin Portal**: Email login (syedimad348@gmail.com or 15568@cityuniversity.edu.pk), dashboard stats, order management table with status buttons
- **Login / Register**: Customer account pages at /login and /register. Password hashed with scrypt. Token persisted in localStorage.
- **Terms & Conditions**: 13-section detailed legal document at /terms
- **Privacy Policy**: 12-section UK GDPR compliant document at /policy
- **Shop**: Red SALE badge (replaces Featured), gold prices, category filter
- **Product Detail**: Related products section at bottom (same category, up to 4 items)
- **About**: Product gallery (jeans/kunafa/wallets), no personal names shown

## User preferences

- Business contact: Atif Shah, +44 7405 358689, 39 Stanley Street L7 0JN Liverpool
- Admin email: syedimad348@gmail.com
- Site email: hello@luxeandline.co.uk
- Luxury dark navy (#0D1117 range) + gold (HSL 43 65% 50%) theme
- Fonts: Cormorant Garamond (serif display) + Montserrat (body)

## Gotchas

- Cart is in-memory — restarting the API server clears all carts
- Admin token is a fixed string "luxe_admin_secret_token_2024" — not production-grade auth
- Products use Unsplash placeholder images for clothing/wallets; kunafa uses real images
- The `@import url()` for Google Fonts must be the FIRST line in index.css (PostCSS requirement)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
