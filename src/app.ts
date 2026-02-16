import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/index.js";
import { swaggerSpec } from "./config/swagger.js";
import { generalLimiter } from "./shared/middleware/rateLimiter.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

export const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(morgan(config.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// Error handler (must be last)
app.use(errorHandler);
