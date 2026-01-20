export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}

// Helper functions
export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(message, 400, "BAD_REQUEST", details);
}

export function unauthorized(message: string = "Unauthorized"): AppError {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message: string = "Forbidden"): AppError {
  return new AppError(message, 403, "FORBIDDEN");
}

export function notFound(resource: string = "Resource"): AppError {
  return new AppError(`${resource} not found`, 404, "NOT_FOUND");
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, "CONFLICT");
}

export class MethodNotAllowedError extends AppError {
  constructor(message: string = "Method not allowed") {
    super(message, 405, "METHOD_NOT_ALLOWED");
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = "Not implemented") {
    super(message, 501, "NOT_IMPLEMENTED");
  }
}
