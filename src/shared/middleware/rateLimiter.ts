import rateLimit from "express-rate-limit";

/** General rate limiter: 100 requests per 15-minute window. Applied globally. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests, try again later" },
});

/** Stricter rate limiter for auth routes: 20 requests per 15-minute window. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many auth attempts, try again later" },
});
