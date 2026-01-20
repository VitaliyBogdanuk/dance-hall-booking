import { NextRequest } from "next/server";
import { requireTrainer } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { createClassBody } from "@/server/validation/classes";
import { ClassService } from "@/server/services/classService";
import { jsonOk, jsonError } from "@/server/http/response";
import { TrainerProfileModel, type ITrainerProfile } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { NotFoundError } from "@/server/http/errors";
import { getRequestId } from "@/server/http/requestContext";
import { logger } from "@/server/utils/logger";

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  logger.logInfo("API_REQUEST", { requestId, method: "POST", path: "/api/classes" });

  try {
    const user = await requireTrainer(); // TRAINER only
    await connectOnce();

    const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean() as ITrainerProfile | null;
    if (!trainerProfile || !trainerProfile._id) {
      throw new NotFoundError("Trainer profile not found");
    }

    const body = await validateBody(request, createClassBody);
    const classSession = await ClassService.createClassSession(trainerProfile._id.toString(), body, {
      req: request,
      actor: { userId: user.userId, role: user.role },
    });
    logger.logInfo("API_RESPONSE", { requestId, status: 201, path: "/api/classes" });
    return jsonOk(classSession, 201);
  } catch (error) {
    logger.logError("API_ERROR", { requestId, path: "/api/classes" }, error);
    return jsonError(error);
  }
}
