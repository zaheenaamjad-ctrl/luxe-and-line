import { Router } from "express";
import { db, ordersTable, usersTable, reviewsTable, productsTable } from "@workspace/db";
import { sql, desc, eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAILS = ["syedimad348@gmail.com", "zaheenaamjad@gmail.com", "luxeline26@gmail.com"];
const ADMIN_TOKEN = "luxe_admin_secret_token_2024";

function requireAdmin(req: import("express").Request, res: import("express").Response): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// POST /admin/login
router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }
  if (!ADMIN_EMAILS.includes(parsed.data.email)) {
    res.status(401).json({ success: false, token: "" }); return;
  }
  res.json({ success: true, token: ADMIN_TOKEN });
});

// GET /admin/dashboard
router.get("/admin/dashboard", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [orders, userCountResult, reviewCountResult, productCountResult] = await Promise.all([
      db.select().from(ordersTable),
      db.execute(sql`SELECT COUNT(*) as count FROM users`),
      db.execute(sql`SELECT COUNT(*) as count FROM reviews`),
      db.execute(sql`SELECT COUNT(*) as count FROM products`),
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "verified")
      .reduce((sum, o) => sum + o.total, 0);

    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const revenueThisMonth = orders
      .filter((o) => o.paymentStatus === "verified" && new Date(o.createdAt) >= thisMonthStart)
      .reduce((s, o) => s + o.total, 0);
    const revenueLastMonth = orders
      .filter((o) => o.paymentStatus === "verified" && new Date(o.createdAt) >= lastMonthStart && new Date(o.createdAt) < thisMonthStart)
      .reduce((s, o) => s + o.total, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ordersThisWeek = orders.filter((o) => new Date(o.createdAt) >= weekAgo).length;

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const totalUsers = parseInt(String((userCountResult.rows[0] as Record<string, unknown>)?.count ?? "0"));
    const totalReviews = parseInt(String((reviewCountResult.rows[0] as Record<string, unknown>)?.count ?? "0"));
    const totalProducts = parseInt(String((productCountResult.rows[0] as Record<string, unknown>)?.count ?? "0"));

    res.json({
      totalOrders: orders.length,
      pendingOrders: ordersByStatus["pending"] ?? 0,
      dispatchedOrders: ordersByStatus["shipped"] ?? 0,
      deliveredOrders: ordersByStatus["delivered"] ?? 0,
      cancelledOrders: ordersByStatus["cancelled"] ?? 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
      ordersThisWeek,
      totalUsers,
      totalReviews,
      totalProducts,
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin dashboard");
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

// GET /admin/analytics
router.get("/admin/analytics", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const orders = await db.select().from(ordersTable);

    const days: Record<string, { revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { revenue: 0, orders: 0 };
    }
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (days[key]) {
        days[key].orders++;
        if (o.paymentStatus === "verified") days[key].revenue += o.total;
      }
    }

    const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const o of orders) {
      const items = o.items as Array<{ name: string; quantity: number; price: number }>;
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!productCounts[item.name]) productCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
        productCounts[item.name].count += item.quantity;
        productCounts[item.name].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    const dailyStats = Object.entries(days).map(([date, stat]) => ({ date, ...stat }));

    res.json({ dailyStats, topProducts });
  } catch (err) {
    req.log.error({ err }, "Failed to get analytics");
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// GET /admin/users
router.get("/admin/users", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [users, orders] = await Promise.all([
      db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, createdAt: usersTable.createdAt })
        .from(usersTable).orderBy(desc(usersTable.createdAt)),
      db.select().from(ordersTable),
    ]);
    const userStats: Record<string, { count: number; spent: number }> = {};
    for (const o of orders) {
      const email = o.customerEmail.toLowerCase();
      if (!userStats[email]) userStats[email] = { count: 0, spent: 0 };
      userStats[email].count++;
      if (o.paymentStatus === "verified") userStats[email].spent += o.total;
    }
    const enriched = users.map((u) => {
      const stats = userStats[u.email.toLowerCase()] ?? { count: 0, spent: 0 };
      return { ...u, orderCount: stats.count, totalSpent: Math.round(stats.spent * 100) / 100 };
    });
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /admin/reviews
router.get("/admin/reviews", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch (err) {
    req.log.error({ err }, "Failed to list reviews");
    res.status(500).json({ error: "Failed to list reviews" });
  }
});

// PATCH /admin/reviews/:id/approve
router.patch("/admin/reviews/:id/approve", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id);
    const { approved } = req.body as { approved?: boolean };
    await db.update(reviewsTable).set({ approved: approved ?? true }).where(eq(reviewsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

// DELETE /admin/reviews/:id
router.delete("/admin/reviews/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await db.delete(reviewsTable).where(eq(reviewsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete review");
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// GET /admin/products
router.get("/admin/products", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.category, productsTable.name);
    res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

// PATCH /admin/products/:id
router.patch("/admin/products/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = parseInt(req.params.id);
    const updates = req.body as Record<string, unknown>;
    const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

// POST /admin/products
router.post("/admin/products", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const data = req.body as {
      name: string; category: string; price: number; description: string;
      images?: string[]; sizes?: string[]; colors?: string[];
      inStock?: boolean; featured?: boolean; deliveryIncluded?: boolean;
    };
    if (!data.name || !data.category || !data.price || !data.description) {
      res.status(400).json({ error: "name, category, price, description are required" }); return;
    }
    const [product] = await db.insert(productsTable).values({
      name: data.name, category: data.category, price: data.price, description: data.description,
      images: data.images ?? [], sizes: data.sizes ?? [], colors: data.colors ?? [],
      inStock: data.inStock ?? true, featured: data.featured ?? false,
      deliveryIncluded: data.deliveryIncluded ?? true,
    }).returning();
    res.status(201).json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

// DELETE /admin/products/:id
router.delete("/admin/products/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await db.delete(productsTable).where(eq(productsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
