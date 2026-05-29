/**
 * Production database seed script.
 *
 * Usage:
 *   DATABASE_URL="<your-neon-or-cloud-postgres-url>" pnpm --filter @workspace/scripts run seed
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING.
 * After inserting, the sequence is reset to MAX(id) so new inserts auto-increment correctly.
 */

import { db, productsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

type InsertProduct = typeof productsTable.$inferInsert;

const PRODUCTS: InsertProduct[] = [
  {
    id: 1,
    name: "Nureh Gardenia",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-215 — Stunning teal blue unstitched lawn suit with vibrant coastal-inspired print. Features embroidered neckline and ornate cuff detailing. Includes kameez, trouser and chiffon dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-215.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Ivory", "Blush Pink", "Sage Green"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 2,
    name: "Charizma Sun Shine CSS-01",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit Collection with Embroidered Chiffon Dupatta Vol.01. 3-piece suit (stitched kameez, trouser, embroidered chiffon dupatta). Available in 10 pieces per set. Summer 2026 new arrival.",
    images: ["/product-images/charizma/css-01.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Amber Gold", "Champagne", "Burnt Orange"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 3,
    name: "Zeenat Embroidered Cotton Lawn",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 9 designs available, sizes S, M, L. Stitched and ready to wear. Summer 2026 new arrival.",
    images: [
      "/product-images/nureh-gardenia/nsg-221.png",
      "/product-images/nureh-gardenia/nsg-222.png",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Navy Blue", "Forest Green", "Deep Maroon"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 4,
    name: "Premium Jeans",
    category: "jeans",
    price: 38,
    currency: "GBP",
    description:
      "Premium quality slim fit and wide-leg denim for men and women. Light blue, dark blue and charcoal styles available. Sizes 28–36. UK delivery included.",
    images: [
      "/product-images/jeans/j-women-lightblue.png",
      "/product-images/jeans/j-men-lightblue.png",
      "/product-images/jeans/j-women-blue.png",
      "/product-images/jeans/j-men-blue.png",
      "/product-images/jeans/j-women-dark.png",
      "/product-images/jeans/j-men-dark.png",
    ],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Midnight Blue", "Black", "Indigo"],
    inStock: true,
    featured: true,
    stitched: null,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 5,
    name: "Heritage Straight Cut Jeans",
    category: "jeans",
    price: 38,
    currency: "GBP",
    description:
      "Premium quality straight cut denim for men and women. Multiple washes available. Sizes 28–36. UK delivery included.",
    images: [
      "/product-images/jeans/j-men-blue.png",
      "/product-images/jeans/j-women-blue.png",
      "/product-images/jeans/j-men-dark.png",
      "/product-images/jeans/j-women-dark.png",
      "/product-images/jeans/j-men-lightblue.png",
      "/product-images/jeans/j-women-lightblue.png",
    ],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    colors: ["Classic Blue", "Stone Wash", "Charcoal"],
    inStock: true,
    featured: false,
    stitched: null,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 6,
    name: "Atrix Leather Accordion Wallet",
    category: "wallets",
    price: 12,
    currency: "GBP",
    description:
      "Genuine Atrix leather zip-around accordion wallet. Multiple card slots, zipper closure, snap button. Brown and beige available. Premium everyday carry. UK delivery included.",
    images: [
      "/product-images/wallets/w-accordion-brown.png",
      "/product-images/wallets/w-embossed-brown.png",
      "/product-images/wallets/w-snap-beige.png",
    ],
    sizes: [],
    colors: ["Cognac Brown", "Jet Black", "Tan"],
    inStock: true,
    featured: true,
    stitched: null,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 7,
    name: "Compact Snap Button Wallet",
    category: "wallets",
    price: 12,
    currency: "GBP",
    description:
      "Slim compact leather wallet with snap button closure. Embossed design detail. Multiple card slots. Brown and beige available. UK delivery included.",
    images: [
      "/product-images/wallets/w-snap-beige.png",
      "/product-images/wallets/w-embossed-brown.png",
      "/product-images/wallets/w-accordion-brown.png",
    ],
    sizes: [],
    colors: ["Espresso Brown", "Matte Black", "Burgundy"],
    inStock: true,
    featured: false,
    stitched: null,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 8,
    name: "Pistachio Kunafa Bites",
    category: "food",
    price: 22,
    currency: "GBP",
    description:
      "B.C.C. Pistachio Kunafa Bites — premium pistachio kunafa in chocolate form. Rich creamy pistachio filling with a satisfying crunch. Individually wrapped. Perfect as a gift. UK delivery included.",
    images: [
      "/product-images/kunafa/k-jar-branded.png",
      "/product-images/kunafa/k-jar-open.png",
      "/product-images/kunafa/k-loose-pieces.png",
      "/product-images/kunafa/k-single-wrap.png",
    ],
    sizes: [],
    colors: [],
    inStock: true,
    featured: true,
    stitched: null,
    deliveryIncluded: true,
    weight: "1kg",
  },
  {
    id: 9,
    name: "Nureh Gardenia NSG-216",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-216 — Soft pastel blush with lavender butterfly print. Delicate floral embroidery throughout with lace-trimmed dupatta. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-216.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Lavender Purple"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 10,
    name: "Nureh Gardenia NSG-217",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-217 — Deep ocean teal with bold geometric print. Rich navy border embroidery. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-217.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Teal Blue"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 11,
    name: "Nureh Gardenia NSG-218",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-218 — Sage green floral lawn with lilac accent embroidery and delicate lace trim on sleeves. Includes kameez, trouser and floral dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-218.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Mint Floral"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 12,
    name: "Nureh Gardenia NSG-219",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-219 — Magenta rose with intricate snowflake embroidery. Heavy thread work on front panel with printed dupatta. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-219.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Deep Magenta"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 13,
    name: "Nureh Gardenia NSG-220",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "Nureh Gardenia — Blue & White. Prints that express freedom like a whisper, adorned with botanical patterns on lawn. Unstitched 3-piece. Price includes UK delivery.",
    images: ["/product-images/nureh-gardenia/nsg-220.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Blue & White"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 14,
    name: "Nureh Gardenia NSG-221",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-221 — Teal aqua with ornate lace overlay panels and embroidered sleeves with scalloped trim. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-221.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Teal Embroidered"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 15,
    name: "Nureh Gardenia NSG-222",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-222 — Soft lavender with blooming floral print and elegant lace front detailing. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-222.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Lavender Floral"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 16,
    name: "Nureh Gardenia NSG-224",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-224 — Midnight black with silver floral embroidery and sheer organza overlay. Dramatic statement piece. Includes kameez, trouser and dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-224.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Black Luxury"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 17,
    name: "Zeenat Solid Pret ZPSP-01",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-01.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 18,
    name: "Zeenat Solid Pret ZPSP-02",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-02.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 19,
    name: "Zeenat Solid Pret ZPSP-03",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-03.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 20,
    name: "Zeenat Solid Pret ZPSP-04",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-04.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 21,
    name: "Zeenat Solid Pret ZPSP-05",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-05.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: true,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 22,
    name: "Nureh Gardenia NSG-223",
    category: "shalwar-kameez",
    price: 65,
    currency: "GBP",
    description:
      "NSG-223 — Bold crimson red with intricate gold embroidery on neckline and cuffs. Vibrant all-over floral print. Includes kameez, trouser and chiffon dupatta fabric. Unstitched — delivered as fabric pieces ready to be stitched to your measurements.",
    images: ["/product-images/nureh-gardenia/nsg-223.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["Crimson Red"],
    inStock: true,
    featured: true,
    stitched: false,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 23,
    name: "Charizma Sun Shine CSS-02",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-02.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 24,
    name: "Charizma Sun Shine CSS-03",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-03.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 25,
    name: "Charizma Sun Shine CSS-04",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-04.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 26,
    name: "Charizma Sun Shine CSS-05",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-05.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 27,
    name: "Charizma Sun Shine CSS-06",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-06.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 28,
    name: "Charizma Sun Shine CSS-07",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-07.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 29,
    name: "Charizma Sun Shine CSS-08",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-08.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 30,
    name: "Charizma Sun Shine CSS-09",
    category: "shalwar-kameez",
    price: 85,
    currency: "GBP",
    description:
      "Charizma Sun Shine Stitched Embroidered Lawn Suit with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/charizma/css-09.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 31,
    name: "Zeenat Solid Pret ZPSP-06",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-06.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 32,
    name: "Zeenat Solid Pret ZPSP-07",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-07.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 33,
    name: "Zeenat Solid Pret ZPSP-08",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-08.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 34,
    name: "Zeenat Solid Pret ZPSP-09",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-09.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
  {
    id: 35,
    name: "Zeenat Solid Pret ZPSP-10",
    category: "shalwar-kameez",
    price: 45,
    currency: "GBP",
    description:
      "Zeenat Solid Pret Stitched Cotton Lawn Vol-1. Embroidered lawn with printed embroidered fancy chiffon dupatta. 3-piece stitched suit. Ready to wear.",
    images: ["/product-images/zeenat/zpsp-10.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom"],
    colors: ["As Shown"],
    inStock: true,
    featured: false,
    stitched: true,
    deliveryIncluded: true,
    weight: null,
  },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL is not set.");
    console.error(
      "Usage: DATABASE_URL=<your-postgres-url> pnpm --filter @workspace/scripts run seed"
    );
    process.exit(1);
  }

  console.log(`Seeding ${PRODUCTS.length} products...`);
  console.log(`Target: ${url.replace(/:\/\/[^@]+@/, "://<credentials>@")}`);

  let inserted = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    const result = await db
      .insert(productsTable)
      .values(product)
      .onConflictDoNothing()
      .returning({ id: productsTable.id });

    if (result.length > 0) {
      console.log(`  ✓ Inserted: [${product.id}] ${product.name}`);
      inserted++;
    } else {
      console.log(`  — Skipped (already exists): [${product.id}] ${product.name}`);
      skipped++;
    }
  }

  // Reset sequence so future inserts don't collide with our explicit IDs
  await db.execute(
    sql`SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products))`
  );

  console.log(`\nDone. ${inserted} inserted, ${skipped} already existed.`);
  console.log("Sequence reset to MAX(id).");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
