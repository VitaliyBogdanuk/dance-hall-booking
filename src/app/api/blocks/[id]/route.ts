import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateParams } from "@/server/http/validateRequest";
import { blockIdParams } from "@/server/validation/blocks";
import { BlockService } from "@/server/services/blockService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Reads allowed for all (no auth required)
    const { id } = validateParams(params, blockIdParams);
    // Note: getById not implemented in BlockService for MVP
    return jsonError(new Error("Get by ID not implemented"), 501);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "DELETE", path: `/api/blocks/${params.id}` });

  try {
    const user = await requireAdmin(); // ADMIN only for writes
    const { id } = validateParams(params, blockIdParams);
    await BlockService.deleteBlock(id, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/blocks/${id}` });
    return jsonOk({ success: true }, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/blocks/${params.id}` }, error);
    return jsonError(error);
  }
}
