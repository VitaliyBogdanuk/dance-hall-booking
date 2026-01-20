import { NextRequest } from "next/server";
import { jsonOk, jsonError } from "@/server/http/response";
import { MethodNotAllowedError } from "@/server/http/errors";
import { logger } from "@/server/utils/logger";
import { getRequestId } from "@/server/http/requestContext";
import { UnauthorizedError } from "@/server/http/errors";

/**
 * Daily cron job handler.
 * Protected by x-cron-secret header.
 *
 * This endpoint can be called by:
 * - Vercel Cron Jobs (configure in vercel.json)
 * - External schedulers (cron-job.org, EasyCron, etc.)
 *
 * Set CRON_SECRET environment variable to protect this endpoint.
 */
export async function GET(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.logInfo("CRON_REQUEST", { requestId, path: "/api/cron/daily" });

  try {
    // Verify cron secret
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      logger.logWarn("CRON_SECRET_NOT_SET", { requestId });
      // In development, allow without secret
      if (process.env.NODE_ENV === "production") {
        throw new UnauthorizedError("Cron secret not configured");
      }
    } else if (cronSecret !== expectedSecret) {
      logger.logWarn("CRON_SECRET_MISMATCH", { requestId });
      throw new UnauthorizedError("Invalid cron secret");
    }

    // Perform daily maintenance tasks
    const results: string[] = [];

    // 1. Clean up expired rate limit entries (handled automatically by interval, but log it)
    results.push("Rate limit cleanup: handled by automatic interval");

    // 2. Optional: Mark past ClassSessions as completed
    // This is a no-op for MVP, but can be extended later
    // const pastClasses = await ClassService.markPastClassesAsCompleted();
    // results.push(`Marked ${pastClasses} past classes as completed`);

    logger.logInfo("CRON_COMPLETED", { requestId, results });

    return jsonOk(
      {
        success: true,
        timestamp: new Date().toISOString(),
        results,
      },
      200
    );
  } catch (error) {
    logger.logError("CRON_ERROR", { requestId }, error);
    return jsonError(error);
  }
}

// Only GET is allowed
export async function POST() {
  return jsonError(new MethodNotAllowedError());
}

export async function PATCH() {
  return jsonError(new MethodNotAllowedError());
}

export async function DELETE() {
  return jsonError(new MethodNotAllowedError());
}
