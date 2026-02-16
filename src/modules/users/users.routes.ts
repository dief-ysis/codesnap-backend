import { Router } from "express";
import * as usersController from "./users.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import { updateProfileSchema, userIdParamSchema } from "./users.schema.js";

const router = Router();

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get public user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile }
 *       404: { description: User not found }
 */
router.get(
  "/:id",
  validate({ params: userIdParamSchema }),
  usersController.getPublicProfile
);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update own profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName: { type: string }
 *               bio: { type: string }
 *               avatarUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: Updated profile }
 *       401: { description: Unauthorized }
 */
router.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileSchema }),
  usersController.updateProfile
);

export default router;
