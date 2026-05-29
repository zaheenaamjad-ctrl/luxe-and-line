import { Router } from "express";
import { db, reviewsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/reviews", async (req, res) => {
  try {
    const productIdRaw = req.query.productId;
    const productId = productIdRaw ? parseInt(productIdRaw as string) : undefined;

    const reviews = productId
      ? await db
          .select()
          .from(reviewsTable)
          .where(and(eq(reviewsTable.approved, true), eq(reviewsTable.productId, productId)))
          .orderBy(desc(reviewsTable.createdAt))
      : await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.approved, true))
          .orderBy(desc(reviewsTable.createdAt));

    res.json(reviews);
  } catch (err) {
    req.log.error({ err }, "Failed to list reviews");
    res.status(500).json({ error: "Failed to list reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const { productId, customerName, customerEmail, rating, title, body } = req.body as Record<string, unknown>;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      res.status(400).json({ error: "Name is required" }); return;
    }
    if (!body || typeof body !== "string" || !body.trim()) {
      res.status(400).json({ error: "Review text is required" }); return;
    }
    const ratingNum = parseInt(String(rating));
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" }); return;
    }

    const [review] = await db
      .insert(reviewsTable)
      .values({
        productId: productId ? parseInt(String(productId)) : null,
        customerName: customerName.trim(),
        customerEmail: typeof customerEmail === "string" ? customerEmail.trim() || null : null,
        rating: ratingNum,
        title: typeof title === "string" && title.trim() ? title.trim() : null,
        body: body.trim(),
        approved: true,
        verified: false,
      })
      .returning();

    res.status(201).json(review);
  } catch (err) {
    req.log.error({ err }, "Failed to submit review");
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
