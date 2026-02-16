import { Router } from "express";
import * as collectionsController from "./collections.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
  collectionSnippetParamSchema,
  addSnippetSchema,
} from "./collections.schema.js";

const router = Router();

// All routes are protected
router.use(authenticate);

/**
 * @openapi
 * /collections:
 *   post:
 *     tags: [Collections]
 *     summary: Create a collection
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Collection created }
 */
router.post(
  "/",
  validate({ body: createCollectionSchema }),
  collectionsController.create
);

/**
 * @openapi
 * /collections:
 *   get:
 *     tags: [Collections]
 *     summary: List own collections
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of collections }
 */
router.get("/", collectionsController.list);

/**
 * @openapi
 * /collections/{id}:
 *   get:
 *     tags: [Collections]
 *     summary: Get collection with snippets
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Collection detail }
 */
router.get(
  "/:id",
  validate({ params: collectionIdParamSchema }),
  collectionsController.getById
);

/**
 * @openapi
 * /collections/{id}:
 *   patch:
 *     tags: [Collections]
 *     summary: Update collection
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Collection updated }
 */
router.patch(
  "/:id",
  validate({ params: collectionIdParamSchema, body: updateCollectionSchema }),
  collectionsController.update
);

/**
 * @openapi
 * /collections/{id}:
 *   delete:
 *     tags: [Collections]
 *     summary: Delete collection
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Collection deleted }
 */
router.delete(
  "/:id",
  validate({ params: collectionIdParamSchema }),
  collectionsController.remove
);

/**
 * @openapi
 * /collections/{id}/snippets:
 *   post:
 *     tags: [Collections]
 *     summary: Add snippet to collection
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Snippet added }
 */
router.post(
  "/:id/snippets",
  validate({ params: collectionIdParamSchema, body: addSnippetSchema }),
  collectionsController.addSnippet
);

/**
 * @openapi
 * /collections/{id}/snippets/{snippetId}:
 *   delete:
 *     tags: [Collections]
 *     summary: Remove snippet from collection
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Snippet removed }
 */
router.delete(
  "/:id/snippets/:snippetId",
  validate({ params: collectionSnippetParamSchema }),
  collectionsController.removeSnippet
);

export default router;
