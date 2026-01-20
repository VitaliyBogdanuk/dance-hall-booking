import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function jsonOk<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function jsonError(error: unknown): NextResponse<{
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}> {
  if (error instanceof AppError) {
    const response: {
      error: {
        code: string;
        message: string;
        details?: unknown;
        retryAfter?: number;
      };
    } = {
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message,
      },
    };

    // Include details only in development
    if (process.env.NODE_ENV === "development" && error.details) {
      response.error.details = error.details;
    }

    // Include retryAfter for rate limit errors
    if (error.statusCode === 429 && "retryAfter" in error) {
      response.error.retryAfter = (error as { retryAfter?: number }).retryAfter;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "An internal error occurred"
              : error.message,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}
