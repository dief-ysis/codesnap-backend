import type { Request, Response, NextFunction } from "express";
import * as collectionsService from "./collections.service.js";

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await collectionsService.create(req.userId!, req.body);
    res.status(201).json({ status: "success", data: { collection } });
  } catch (error) {
    next(error);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collections = await collectionsService.listByUser(req.userId!);
    res.json({ status: "success", data: { collections } });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await collectionsService.getById(req.params.id as string, req.userId!);
    res.json({ status: "success", data: { collection } });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const collection = await collectionsService.update(req.params.id as string, req.userId!, req.body);
    res.json({ status: "success", data: { collection } });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await collectionsService.remove(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function addSnippet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await collectionsService.addSnippet(req.params.id as string, req.body.snippetId, req.userId!);
    res.status(201).json({ status: "success", message: "Snippet added to collection" });
  } catch (error) {
    next(error);
  }
}

export async function removeSnippet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await collectionsService.removeSnippet(
      req.params.id as string,
      req.params.snippetId as string,
      req.userId!
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
