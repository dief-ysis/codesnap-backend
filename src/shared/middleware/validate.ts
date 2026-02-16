import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../errors/AppError.js";

/** Schemas that can be validated against a request's body, params, or query. */
interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Creates an Express middleware that validates request data against Zod schemas.
 *
 * @param schemas - Object containing optional body, params, and query Zod schemas
 * @returns Express middleware that parses and validates, or passes a {@link BadRequestError}
 * @throws {BadRequestError} When any schema validation fails
 *
 * @example
 * ```ts
 * router.post("/", validate({ body: createSnippetSchema }), controller.create);
 * ```
 */
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
