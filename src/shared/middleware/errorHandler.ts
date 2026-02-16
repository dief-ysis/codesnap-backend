import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Global Express error handler. Distinguishes operational {@link AppError}s
 * (which return the appropriate status code) from unexpected errors (logged
 * and returned as 500).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Operational errors (AppError subclasses) are expected conditions (validation,
  // auth, not-found) — safe to expose their message and status code to the client.
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Unexpected errors (uncaught throws, DB failures, etc.) are logged for debugging
  // but masked as a generic 500 to avoid leaking internal details to the client.
  logger.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
