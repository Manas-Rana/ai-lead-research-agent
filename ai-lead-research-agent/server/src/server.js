import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { initDb } from "./db/database.js";
import { logger } from "./utils/logger.js";

initDb();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "AI Lead Research Agent API started");
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
