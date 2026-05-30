// Vercel serverless entry — exports the Express app without binding to a port.
// The index.ts file starts a long-running server; this file is imported by
// api/index.mjs at the repo root so Vercel runs the app as a function.
export { default } from "./app";
