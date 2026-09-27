import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import leadRoutes from "./routes/lead.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN.split(",").map((value) => value.trim()),
  credentials: false
}));
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp({ logger }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a minute." }
}));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ai-lead-research-agent",
    demoMode: !env.OPENAI_API_KEY
  });
});

app.use("/api/leads", leadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
