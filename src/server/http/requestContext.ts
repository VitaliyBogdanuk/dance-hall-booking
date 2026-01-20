import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

/**
 * Gets or generates a request ID for the current request.
 * Uses x-request-id header if present, otherwise generates a new UUID.
 */
export function getRequestId(req: NextRequest): string {
  const headerId = req.headers.get("x-request-id");
  if (headerId) {
    return headerId;
  }
  return randomUUID();
}

/**
 * Extracts client information from the request.
 */
export function getClientInfo(req: NextRequest): { ip?: string; userAgent?: string } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;

  const userAgent = req.headers.get("user-agent") || undefined;

  return { ip, userAgent };
}
