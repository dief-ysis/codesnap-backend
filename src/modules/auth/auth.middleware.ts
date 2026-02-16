import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../shared/utils/jwt.js";
import { UnauthorizedError } from "../../shared/errors/AppError.js";

/** Augments Express Request with an optional `userId` property set by {@link authenticate}. */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Express middleware that extracts and verifies a JWT from the Authorization
 * header, then attaches the `userId` to the request object.
 *
 * @throws {UnauthorizedError} If the token is missing, malformed, or expired
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or invalid token"));
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
