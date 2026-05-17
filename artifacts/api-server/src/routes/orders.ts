import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { sendOrderConfirmationEmail } from "../mailer.js";

const router = Router();

// GET /orders
router.get("/orders", async (req, res) => {
  try {
    const query = ListOrdersQueryParams.safeParse(req.query);
    let orders = await db.select().from(ordersTable);

    if (query.success && query.data.status) {
      orders = orders.filter((o) => o.status === query.data.status);
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(orders);
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

// POST /orders
router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid order data", details: parsed.error });
    }

    const { data } = parsed;
    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city ?? null,
        postCode: data.postCode ?? null,
        addressLine2: data.addressLine2 ?? null,
        items: data.items,
        total: data.total,
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        status: "pending",
        paymentStatus: "pending",
      })
      .returning();

    // Send confirmation email (non-blocking — errors are swallowed in mailer)
    sendOrderConfirmationEmail({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      address: order.address,
      city: order.city,
      postCode: order.postCode,
      paymentMethod: order.paymentMethod,
      items: order.items as Array<{ name: string; quantity: number; price: number }>,
      total: order.total,
    }).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /orders/:id
router.get("/orders/:id", async (req, res) => {
  try {
    const params = GetOrderParams.safeParse({ id: parseInt(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid ID" });

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, params.data.id));

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Failed to get order" });
  }
});

// PATCH /orders/:id
router.patch("/orders/:id", async (req, res) => {
  try {
    const params = UpdateOrderStatusParams.safeParse({ id: parseInt(req.params.id) });
    if (!params.success) return res.status(400).json({ error: "Invalid ID" });

    const parsed = UpdateOrderStatusBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

    const updateData: Partial<typeof ordersTable.$inferInsert> = {
      status: parsed.data.status,
    };
    if (parsed.data.paymentStatus) {
      updateData.paymentStatus = parsed.data.paymentStatus;
    }

    const [order] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, params.data.id))
      .returning();

    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
