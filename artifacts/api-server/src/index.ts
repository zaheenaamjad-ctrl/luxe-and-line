import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Keep the dev server alive on unexpected errors rather than crashing.
// In Vercel serverless these are no-ops (each invocation is a fresh process).
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection — server staying up");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — server staying up");
});

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
