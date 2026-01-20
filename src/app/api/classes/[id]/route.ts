import { NextRequest } from "next/server";
import { requireTrainer } from "@/server/auth/rbac";
import { validateParams, validateBody } from "@/server/http/validateRequest";
import { classIdParams } from "@/server/validation/classes";
import { updateClassBody } from "@/server/validation/classes";
import { ClassService } from "@/server/services/classService";
import { TrainerProfileModel } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { NotFoundError, ForbiddenError } from "@/server/http/errors";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "GET", path: `/api/classes/${params.id}` });

  try {
    const { id } = validateParams(params, classIdParams);
    const classSession = await ClassService.getClassById(id);
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/classes/${id}` });
    return jsonOk(classSession, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/classes/${params.id}` }, error);
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "PATCH", path: `/api/classes/${params.id}` });

  try {
    const user = await requireTrainer();
    await connectOnce();

    const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean();
    if (!trainerProfile) {
      throw new NotFoundError("Trainer profile not found");
    }

    const { id } = validateParams(params, classIdParams);
    
    // Verify trainer owns this class
    // Get class without populate to get raw trainerId for comparison
    const { ClassSessionModel } = await import("@/server/db/models/classSession.model");
    const existing = await ClassSessionModel.findById(id).lean();
    if (!existing) {
      throw new NotFoundError("Class session not found");
    }

    // Compare trainerId (should be ObjectId, not populated)
    const classTrainerId = existing.trainerId.toString();
    if (classTrainerId !== trainerProfile._id.toString() && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only update your own classes");
    }

    const body = await validateBody(request, updateClassBody);
    const classSession = await ClassService.updateClassSession(id, body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 200, path: `/api/classes/${id}` });
    return jsonOk(classSession, 200);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: `/api/classes/${params.id}` }, error);
    return jsonError(error);
  }
}
