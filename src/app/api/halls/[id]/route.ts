import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateParams, validateBody } from "@/server/http/validateRequest";
import { hallIdParams, updateHallBody } from "@/server/validation/halls";
import { HallService } from "@/server/services/hallService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "GET", path: `/api/halls/${params.id}` });

  try {
    // Reads allowed for all (no auth required)
    const { id } = validateParams(params, hallIdParams);
    const hall = await HallService.getHallById(id);
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/halls/${id}` });
    return jsonOk(hall, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/halls/${params.id}` }, error);
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "PATCH", path: `/api/halls/${params.id}` });

  try {
    const user = await requireAdmin(); // ADMIN only for writes
    const { id } = validateParams(params, hallIdParams);
    const body = await validateBody(request, updateHallBody);
    const hall = await HallService.updateHall(id, body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/halls/${id}` });
    return jsonOk(hall, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/halls/${params.id}` }, error);
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(); // ADMIN only for writes
    const { id } = validateParams(params, hallIdParams);
    // Note: Delete not implemented in HallService for MVP
    return jsonError(new Error("Delete not implemented"), 501);
  } catch (error) {
    return jsonError(error);
  }
}
