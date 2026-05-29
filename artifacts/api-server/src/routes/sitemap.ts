import { Router } from "express";
import { db, productsTable } from "@workspace/db";

const router = Router();

const SITE_URL =
  (process.env.SITE_URL ?? "").replace(/\/$/, "") ||
  "https://www.luxeandline.uk";

const today = () => new Date().toISOString().split("T")[0];

const STATIC_PAGES = [
  { path: "/",        priority: "1.0", changefreq: "daily" },
  { path: "/shop",    priority: "0.9", changefreq: "daily" },
  { path: "/about",   priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/reviews", priority: "0.6", changefreq: "weekly" },
  { path: "/policy",  priority: "0.4", changefreq: "yearly" },
  { path: "/terms",   priority: "0.4", changefreq: "yearly" },
];

// GET /sitemap.xml  — served at root level (Vercel routes /sitemap.xml → /api/index)
router.get("/sitemap.xml", async (req, res) => {
  try {
    const products = await db
      .select({ id: productsTable.id, updatedAt: productsTable.updatedAt })
      .from(productsTable);

    const urlEntry = (
      path: string,
      priority: string,
      changefreq: string,
      lastmod: string
    ) =>
      `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

    const now = today();

    const staticEntries = STATIC_PAGES.map((p) =>
      urlEntry(p.path, p.priority, p.changefreq, now)
    ).join("\n");

    const productEntries = products
      .map((p) => {
        const lastmod = p.updatedAt
          ? new Date(p.updatedAt).toISOString().split("T")[0]
          : now;
        return urlEntry(`/product/${p.id}`, "0.8", "weekly", lastmod);
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${productEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.setHeader("X-Robots-Tag", "noindex");
    res.send(xml);
  } catch (err) {
    req.log.error({ err }, "Sitemap generation failed");
    res.status(500).type("text/plain").send("Failed to generate sitemap");
  }
});

export default router;
