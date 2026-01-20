import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateBody, validateParams } from "@/server/http/validateRequest";
import { hallIdParams } from "@/server/validation/halls";
import { createHallBlockBody } from "@/server/validation/blocks";
import { BlockService } from "@/server/services/blockService";
import { jsonOk, jsonError } from "@/server/http/response";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "POST", path: `/api/halls/${params.id}/blocks` });

  try {
    const user = await requireAdmin(); // ADMIN only for writes
    const { id: hallId } = validateParams(params, hallIdParams);
    const body = await validateBody(request, createHallBlockBody);
    const block = await BlockService.createBlock(hallId, body, user.userId, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 201, path: `/api/halls/${hallId}/blocks` });
    return jsonOk(block, 201);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/halls/${params.id}/blocks` }, error);
    return jsonError(error);
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Reads allowed for all (no auth required)
    const { id: hallId } = validateParams(params, hallIdParams);
    const blocks = await BlockService.listBlocksForHall(hallId);
    return jsonOk(blocks, 200);
  } catch (error) {
    return jsonError(error);
  }
}
