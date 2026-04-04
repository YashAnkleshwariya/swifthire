export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(required: number, available: number) {
    super(
      `Insufficient credits: need ${required}, have ${available}`,
      402,
      "INSUFFICIENT_CREDITS"
    );
    this.name = "InsufficientCreditsError";
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} API error: ${message}`, 502, "EXTERNAL_API_ERROR");
    this.name = "ExternalAPIError";
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error instanceof Error ? error.message : String(error));

  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error && "issues" in error) {
    return Response.json(
      {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: (error as { issues: unknown }).issues,
      },
      { status: 400 }
    );
  }

  return Response.json(
    { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}
