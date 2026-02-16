import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../errors/AppError.js";

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        next(new BadRequestError(`Validation failed — ${details}`));
        return;
      }
      next(error);
    }
  };
}
