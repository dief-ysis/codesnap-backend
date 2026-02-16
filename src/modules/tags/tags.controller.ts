import type { Request, Response, NextFunction } from "express";
import * as tagsService from "./tags.service.js";

/** Handles GET /tags — lists all tags with snippet counts. */
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagsService.listWithCount();
    res.json({ status: "success", data: { tags } });
  } catch (error) {
    next(error);
  }
}

/** Handles GET /tags/:name/snippets — lists public snippets for a tag. */
export async function getSnippetsByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await tagsService.getSnippetsByTag(
      req.params.name as string,
      Number(page),
      Number(limit)
    );
    res.json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}
