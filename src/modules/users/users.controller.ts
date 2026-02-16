import type { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service.js";

/** Handles GET /users/:id — returns a user's public profile. */
export async function getPublicProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await usersService.getPublicProfile(id);
    res.json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
}

/** Handles PUT /users/:id — updates the authenticated user's profile. */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.updateProfile(req.userId!, req.body);
    res.json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
}
