---
name: Luxe & Line Web Improvements
description: Summary of 10 web improvement sections applied and key decisions
---

# Luxe & Line Web Improvements

**Why:** User cancelled mobile app Task #2 and only wants web improvements.

## Applied changes
- Hero: 2 videos (swan.mp4 + video2.mp4), 4 stages, mobile uses object-contain sm:object-cover
- Email: STATUS_LABELS processing → "Order Confirmed"; welcome email SA ref removed
- Products API: case-insensitive category filter (toLowerCase comparison)
- Checkout: trust badge grid added above place-order button
- All "South Asian" / "Pakistani" references removed from Footer, About, Cart, Policy, Terms, Chatbot, mailer welcome email, index.html
- index.html: SEO title/desc/keywords/OG rewritten (no Pakistani), GA4 G-0XSNYRRKHN added
- Admin statuses (Admin.tsx): pending, processing(→"Processing" label), shipped(→"Dispatched"), out_for_delivery, delivered, cancelled

## Known issue
- RESEND_API_KEY is not set in environment secrets → emails silently skip. User must add via Secrets panel → restart API server.

## How to apply
- If user reports emails not sending: check RESEND_API_KEY secret first.
- If user adds new product category: lowercase matching in products.ts handles it.
