import { NextRequest } from "next/server";
import { validateQuery } from "@/server/http/validateRequest";
import { scheduleQuery } from "@/server/validation/schedule";
import { ClassService } from "@/server/services/classService";
import { jsonOk, jsonError } from "@/server/http/response";
import { rateLimit, getRateLimitKey } from "@/server/http/rateLimit";
import { getClientInfo } from "@/server/http/requestContext";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 120 requests per minute per IP
    const clientInfo = getClientInfo(request);
    rateLimit({
      key: getRateLimitKey(undefined, clientInfo.ip),
      limit: 120,
      windowMs: 60 * 1000, // 1 minute
    });

    const filters = validateQuery(request.nextUrl, scheduleQuery);
    const classes = await ClassService.listSchedule(filters);
    return jsonOk(classes, 200);
  } catch (error) {
    return jsonError(error);
  }
}

// Only GET is allowed
export async function POST() {
  return jsonError(new Error("Method not allowed"), 405);
}

export async function PATCH() {
  return jsonError(new Error("Method not allowed"), 405);
}

export async function DELETE() {
  return jsonError(new Error("Method not allowed"), 405);
}
