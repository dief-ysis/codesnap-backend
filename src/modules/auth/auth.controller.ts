import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginInput);
    res.json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await authService.getMe(req.userId!);
    res.json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
}
