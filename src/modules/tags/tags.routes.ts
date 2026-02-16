import { Router } from "express";
import * as tagsController from "./tags.controller.js";

const router = Router();

/**
 * @openapi
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: List all tags with usage count
 *     responses:
 *       200: { description: List of tags }
 */
router.get("/", tagsController.list);

/**
 * @openapi
 * /tags/{name}/snippets:
 *   get:
 *     tags: [Tags]
 *     summary: Get public snippets by tag name
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Snippets with this tag }
 */
router.get("/:name/snippets", tagsController.getSnippetsByTag);

export default router;
