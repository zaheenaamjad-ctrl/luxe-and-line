import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAILS = ["syedimad348@gmail.com", "15568@cityuniversity.edu.pk"];
const ADMIN_TOKEN = "luxe_admin_secret_token_2024";

// POST /admin/login
router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

  if (!ADMIN_EMAILS.includes(parsed.data.email)) {
    return res.status(401).json({ success: false, token: "" });
  }

  res.json({ success: true, token: ADMIN_TOKEN });
});

// GET /admin/dashboard
router.get("/admin/dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.includes(ADMIN_TOKEN)) {
      return res.status(401).json({ error: "Unauthorized" });
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

    const [countRow] = await db.execute(
      sql`SELECT COUNT(*) as count FROM products`
    );
    const totalProducts = parseInt((countRow as any).count ?? "0");

    res.json({
      totalOrders: orders.length,
      pendingOrders: ordersByStatus["pending"] ?? 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProducts,
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin dashboard");
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

export default router;
