import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  logger.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
