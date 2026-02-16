import type { Request, Response, NextFunction } from "express";
import * as tagsService from "./tags.service.js";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagsService.listWithCount();
    res.json({ status: "success", data: { tags } });
  } catch (error) {
    next(error);
  }
}

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
