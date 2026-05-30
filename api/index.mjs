// Vercel serverless function — wraps the Express app so all /api/* routes
// and /sitemap.xml are served by the same handler.
// Built by: pnpm --filter @workspace/api-server run build
export { default } from "../artifacts/api-server/dist/handler.mjs";
