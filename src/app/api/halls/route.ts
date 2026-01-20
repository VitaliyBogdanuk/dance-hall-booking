import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { createHallBody } from "@/server/validation/halls";
import { HallService } from "@/server/services/hallService";
import { jsonOk, jsonError } from "@/server/http/response";
import { MethodNotAllowedError } from "@/server/http/errors";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "POST", path: "/api/halls" });

  try {
    const user = await requireAdmin(); // ADMIN only for writes
    const body = await validateBody(request, createHallBody);
    const hall = await HallService.createHall(body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 201, path: "/api/halls" });
    return jsonOk(hall, 201);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: "/api/halls" }, error);
    return jsonError(error);
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Reads allowed for all (no auth required)
    const halls = await HallService.listHalls();
    return jsonOk(halls, 200);
  } catch (error) {
    return jsonError(error);
  }
}

// Only GET and POST are allowed
export async function PATCH() {
  return jsonError(new MethodNotAllowedError());
}

export async function DELETE() {
  return jsonError(new MethodNotAllowedError());
}
