/**
 * Base application error. All domain errors extend this class.
 * Operational errors are expected (e.g. validation); non-operational ones are bugs.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Required because TypeScript's ES5 output breaks the prototype chain for
    // built-in classes (Error). Without this, `instanceof AppError` would fail.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 Bad Request — invalid input or validation failure. @extends AppError */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/** 401 Unauthorized — missing or invalid authentication. @extends AppError */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 Forbidden — authenticated but lacks required permissions. @extends AppError */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/** 404 Not Found — the requested resource does not exist. @extends AppError */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/** 409 Conflict — a resource with the same unique constraint already exists. @extends AppError */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}
