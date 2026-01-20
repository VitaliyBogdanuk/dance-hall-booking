import { NextRequest } from "next/server";
import { requireTrainer } from "@/server/auth/rbac";
import { ClassService } from "@/server/services/classService";
import { TrainerProfileModel, type ITrainerProfile } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { NotFoundError } from "@/server/http/errors";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireTrainer();
    await connectOnce();

    const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean() as ITrainerProfile | null;
    if (!trainerProfile || !trainerProfile._id) {
      throw new NotFoundError("Trainer profile not found");
    }

    const classes = await ClassService.listMyClasses(trainerProfile._id.toString());
    return jsonOk(classes, 200);
  } catch (error) {
    return jsonError(error);
  }
}
