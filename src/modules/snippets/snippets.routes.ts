import { Router } from "express";
import * as snippetsController from "./snippets.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import {
  createSnippetSchema,
  updateSnippetSchema,
  snippetIdParamSchema,
  shareSlugParamSchema,
  listSnippetsQuerySchema,
  searchSnippetsQuerySchema,
} from "./snippets.schema.js";

const router = Router();

/**
 * @openapi
 * /snippets/public:
 *   get:
 *     tags: [Snippets]
 *     summary: List public snippets
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: language
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of public snippets }
 */
router.get(
  "/public",
  validate({ query: listSnippetsQuerySchema }),
  snippetsController.listPublic
);

/**
 * @openapi
 * /snippets/search:
 *   get:
 *     tags: [Snippets]
 *     summary: Full-text search public snippets
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: language
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Search results }
 */
router.get(
  "/search",
  validate({ query: searchSnippetsQuerySchema }),
  snippetsController.search
);

/**
 * @openapi
 * /snippets/share/{shareSlug}:
 *   get:
 *     tags: [Snippets]
 *     summary: Get snippet by share slug (public/unlisted)
 *     parameters:
 *       - in: path
 *         name: shareSlug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Snippet detail }
 *       404: { description: Not found }
 */
router.get(
  "/share/:shareSlug",
  validate({ params: shareSlugParamSchema }),
  snippetsController.getByShareSlug
);

/**
 * @openapi
 * /snippets:
 *   post:
 *     tags: [Snippets]
 *     summary: Create a new snippet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Snippet created }
 */
router.post(
  "/",
  authenticate,
  validate({ body: createSnippetSchema }),
  snippetsController.create
);

/**
 * @openapi
 * /snippets:
 *   get:
 *     tags: [Snippets]
 *     summary: List own snippets
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of user snippets }
 */
router.get(
  "/",
  authenticate,
  validate({ query: listSnippetsQuerySchema }),
  snippetsController.listMine
);

/**
 * @openapi
 * /snippets/{id}:
 *   get:
 *     tags: [Snippets]
 *     summary: Get snippet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Snippet detail }
 *       404: { description: Not found }
 */
router.get(
  "/:id",
  validate({ params: snippetIdParamSchema }),
  snippetsController.getById
);

/**
 * @openapi
 * /snippets/{id}:
 *   patch:
 *     tags: [Snippets]
 *     summary: Update snippet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Snippet updated }
 */
router.patch(
  "/:id",
  authenticate,
  validate({ params: snippetIdParamSchema, body: updateSnippetSchema }),
  snippetsController.update
);

/**
 * @openapi
 * /snippets/{id}:
 *   delete:
 *     tags: [Snippets]
 *     summary: Delete snippet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Snippet deleted }
 */
router.delete(
  "/:id",
  authenticate,
  validate({ params: snippetIdParamSchema }),
  snippetsController.remove
);

/**
 * @openapi
 * /snippets/{id}/fork:
 *   post:
 *     tags: [Snippets]
 *     summary: Fork a snippet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Forked snippet created }
 */
router.post(
  "/:id/fork",
  authenticate,
  validate({ params: snippetIdParamSchema }),
  snippetsController.fork
);

export default router;
