import type { Request, Response, NextFunction } from "express";
import * as snippetsService from "./snippets.service.js";

/** Handles POST /snippets — creates a new snippet. */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const snippet = await snippetsService.create(req.userId!, req.body);
    res.status(201).json({ status: "success", data: { snippet } });
  } catch (error) {
    next(error);
  }
}

/** Handles GET /snippets — lists the authenticated user's snippets. */
export async function listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, language } = res.locals.query;
    const result = await snippetsService.listByUser(req.userId!, page, limit, language);
    res.json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}

/** Handles GET /snippets/:id — retrieves a single snippet. */
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const snippet = await snippetsService.getById(req.params.id as string, req.userId);
    res.json({ status: "success", data: { snippet } });
  } catch (error) {
    next(error);
  }
}

/** Handles PUT /snippets/:id — updates a snippet. */
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const snippet = await snippetsService.update(req.params.id as string, req.userId!, req.body);
    res.json({ status: "success", data: { snippet } });
  } catch (error) {
    next(error);
  }
}

/** Handles DELETE /snippets/:id — deletes a snippet. */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await snippetsService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/** Handles GET /snippets/public — lists public snippets. */
export async function listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, language } = res.locals.query;
    const result = await snippetsService.listPublic(page, limit, language);
    res.json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}

/** Handles GET /snippets/share/:shareSlug — retrieves a snippet by its share slug. */
export async function getByShareSlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const snippet = await snippetsService.getByShareSlug(req.params.shareSlug as string);
    res.json({ status: "success", data: { snippet } });
  } catch (error) {
    next(error);
  }
}

/** Handles GET /snippets/search — full-text search across public snippets. */
export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q, language, page, limit } = res.locals.query;
    const result = await snippetsService.search(q, page, limit, language);
    res.json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}

/** Handles POST /snippets/:id/fork — forks a snippet. */
export async function fork(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const snippet = await snippetsService.fork(req.params.id as string, req.userId!);
    res.status(201).json({ status: "success", data: { snippet } });
  } catch (error) {
    next(error);
  }
}
