import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { authLimiter } from "../../shared/middleware/rateLimiter.js";
import { authenticate } from "./auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3, maxLength: 30 }
 *               password: { type: string, minLength: 8 }
 *               displayName: { type: string }
 *     responses:
 *       201: { description: User created successfully }
 *       409: { description: Email or username already taken }
 */
router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  authController.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  authController.login
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get("/me", authenticate, authController.getMe);

export default router;
