// @ts-nocheck
// Vercel serverless function — imports the pre-compiled Express app bundle.
// Vercel's TypeScript compiler only sees this file; it never touches the TS source
// in artifacts/api-server/src/, avoiding node16/nodenext module resolution errors.
import app from "../artifacts/api-server/dist/app.mjs";

export default app;
