import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";

const app: Express = express();

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
