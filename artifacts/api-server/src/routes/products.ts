import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

// GET /products
router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.safeParse(req.query);
    let products = await db.select().from(productsTable);

    if (query.success) {
      if (query.data.category) {
        products = products.filter((p) => p.category === query.data.category);
      }
      if (query.data.featured !== undefined) {
        products = products.filter((p) => p.featured === query.data.featured);
      }
    }

    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

// POST /products
router.post("/products", async (req, res) => {
  try {
    const parsed = CreateProductBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid product data" }); return;
    }
    const { data } = parsed;
    const [product] = await db
      .insert(productsTable)
      .values({
        name: data.name,
        category: data.category,
        price: data.price,
        currency: data.currency ?? "GBP",
        description: data.description,
        images: data.images,
        sizes: data.sizes ?? [],
        colors: data.colors ?? [],
        inStock: data.inStock,
        featured: data.featured,
        stitched: data.stitched ?? null,
        deliveryIncluded: data.deliveryIncluded,
        weight: data.weight ?? null,
      })
      .returning();
    res.status(201).json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

// GET /products/stats/summary
router.get("/products/stats/summary", async (req, res) => {
  try {
    const products = await db.select().from(productsTable);
    const orders = await db.execute(
      sql`SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );

    const byCategory: Record<string, number> = {};
    for (const p of products) {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    }

    const rows = orders.rows as Array<{ status: string; count: string }>;
    const totalOrders = rows.reduce((s, r) => s + parseInt(r.count), 0);
    const pendingOrders = rows.find((r) => r.status === "pending")?.count ?? "0";

    res.json({
      total: products.length,
      byCategory,
      totalOrders,
      pendingOrders: parseInt(pendingOrders),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get product stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const params = GetProductParams.safeParse({ id: parseInt(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, params.data.id));

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "Failed to get product" });
  }
});

// PATCH /products/:id
router.patch("/products/:id", async (req, res) => {
  try {
    const params = UpdateProductParams.safeParse({ id: parseInt(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }

    const parsed = UpdateProductBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

    const [product] = await db
      .update(productsTable)
      .set(parsed.data)
      .where(eq(productsTable.id, params.data.id))
      .returning();

    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    const params = DeleteProductParams.safeParse({ id: parseInt(req.params.id) });
    if (!params.success) { res.status(400).json({ error: "Invalid ID" }); return; }

    await db.delete(productsTable).where(eq(productsTable.id, params.data.id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
