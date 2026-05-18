import { Router } from "express";
import { db, ordersTable, usersTable, reviewsTable } from "@workspace/db";
import { sql, desc, eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAILS = ["syedimad348@gmail.com", "zaheenaamjad@gmail.com", "luxeline26@gmail.com"];
const ADMIN_TOKEN = "luxe_admin_secret_token_2024";

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
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }

    const orders = await db.select().from(ordersTable);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "verified")
      .reduce((sum, o) => sum + o.total, 0);

    const ordersByStatus: Record<string, number> = {};
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM products`);
    const countRow = countResult.rows[0] as Record<string, unknown>;
    const totalProducts = parseInt(String(countRow?.count ?? "0"));

    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const userCountRow = userCountResult.rows[0] as Record<string, unknown>;
    const totalUsers = parseInt(String(userCountRow?.count ?? "0"));

    res.json({
      totalOrders: orders.length,
      pendingOrders: ordersByStatus["pending"] ?? 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProducts,
      totalUsers,
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin dashboard");
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

// GET /admin/users
router.get("/admin/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Failed to list users" });
  }
});

// GET /admin/reviews
router.get("/admin/reviews", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }
    const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch (err) {
    req.log.error({ err }, "Failed to list reviews");
    res.status(500).json({ error: "Failed to list reviews" });
  }
});

// PATCH /admin/reviews/:id/approve
router.patch("/admin/reviews/:id/approve", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }
    const id = parseInt(req.params.id);
    const { approved } = req.body as { approved?: boolean };
    await db.update(reviewsTable).set({ approved: approved ?? true }).where(eq(reviewsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update review");
    res.status(500).json({ error: "Failed to update review" });
  }
});

export default router;
