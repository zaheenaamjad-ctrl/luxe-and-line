import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams } from "@workspace/api-zod";

const router = Router();

// In-memory session-based cart (keyed by a simple session cookie)
const carts = new Map<string, CartItem[]>();

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string | null;
}

function getSessionId(req: any, res: any): string {
  let sid = req.cookies?.["luxe_cart_session"];
  if (!sid) {
    sid = `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    res.cookie("luxe_cart_session", sid, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  return sid;
}

function computeCart(items: CartItem[]) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  return { items, total: Math.round(total * 100) / 100, itemCount };
}

// GET /cart
router.get("/cart", (req, res) => {
  const sid = getSessionId(req, res);
  const items = carts.get(sid) ?? [];
  res.json(computeCart(items));
});

// POST /cart
router.post("/cart", async (req, res) => {
  try {
    const parsed = AddToCartBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid cart data" });

    const { productId, quantity, size } = parsed.data;

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId));

    if (!product) return res.status(404).json({ error: "Product not found" });

    const sid = getSessionId(req, res);
    const items = carts.get(sid) ?? [];
    const existing = items.find(
      (i) => i.productId === productId && i.size === (size ?? null)
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      const images = product.images as string[];
      items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: images[0] ?? "",
        size: size ?? null,
      });
    }

    carts.set(sid, items);
    res.json(computeCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to add to cart");
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// DELETE /cart
router.delete("/cart", (req, res) => {
  const sid = getSessionId(req, res);
  carts.set(sid, []);
  res.json(computeCart([]));
});

// PATCH /cart/:productId
router.patch("/cart/:productId", (req, res) => {
  try {
    const params = UpdateCartItemParams.safeParse({ productId: parseInt(req.params.productId) });
    if (!params.success) return res.status(400).json({ error: "Invalid product ID" });

    const parsed = UpdateCartItemBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

    const sid = getSessionId(req, res);
    const items = carts.get(sid) ?? [];
    const item = items.find((i) => i.productId === params.data.productId);

    if (!item) return res.status(404).json({ error: "Item not in cart" });

    item.quantity = parsed.data.quantity;
    if (item.quantity <= 0) {
      const idx = items.indexOf(item);
      items.splice(idx, 1);
    }

    carts.set(sid, items);
    res.json(computeCart(items));
  } catch (err) {
    req.log.error({ err }, "Failed to update cart item");
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// DELETE /cart/:productId
router.delete("/cart/:productId", (req, res) => {
  try {
    const params = RemoveFromCartParams.safeParse({ productId: parseInt(req.params.productId) });
    if (!params.success) return res.status(400).json({ error: "Invalid product ID" });

    const sid = getSessionId(req, res);
    const items = carts.get(sid) ?? [];
    const filtered = items.filter((i) => i.productId !== params.data.productId);
    carts.set(sid, filtered);
    res.json(computeCart(filtered));
  } catch (err) {
    req.log.error({ err }, "Failed to remove from cart");
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

export default router;
