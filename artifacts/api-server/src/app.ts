import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";

const app: Express = express();

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Limit referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict browser features
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()");
  // HSTS: enforce HTTPS for 1 year, include subdomains, submit to preload list
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // Allow Google Sign-In popup without breaking security isolation
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  // Prevent cross-origin embedding of API resources
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  // Comprehensive CSP:
  //  - media-src: required for <video> elements
  //  - frame-src: required for Google Sign-In popup
  //  - worker-src: required for Vite HMR in dev / any service workers
  //  - connect-src: all GA4 + GTM domains required for analytics
  //  - base-uri / form-action: defence-in-depth against injection
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://gsi.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://region1.google-analytics.com",
      "frame-src https://accounts.google.com",
      "worker-src 'self' blob:",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  next();
});

app.use(compression());
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /sitemap.xml served at root (Vercel routes /sitemap.xml → this serverless function)
app.use(sitemapRouter);

app.use("/api", router);

// Global error boundary — catches any error passed to next(err) or thrown in
// synchronous middleware. Must have exactly 4 parameters for Express to treat
// it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  const status = (err as { status?: number; statusCode?: number })?.status
    ?? (err as { status?: number; statusCode?: number })?.statusCode
    ?? 500;
  req.log?.error({ err, status }, "Unhandled route error");
  if (!res.headersSent) {
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: status === 500 ? "Internal server error" : message,
    });
  }
});

export default app;
