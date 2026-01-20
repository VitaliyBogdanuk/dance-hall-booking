import { NextRequest } from "next/server";
import { requireTrainer } from "@/server/auth/rbac";
import { validateParams } from "@/server/http/validateRequest";
import { classIdParams } from "@/server/validation/classes";
import { BookingService } from "@/server/services/bookingService";
import { TrainerProfileModel, type ITrainerProfile } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { NotFoundError, ForbiddenError } from "@/server/http/errors";
import type { IClassSession } from "@/server/db/models/classSession.model";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireTrainer();
    await connectOnce();

    const { id: classSessionId } = validateParams(params, classIdParams);
    
    // Get class without populate to get raw trainerId
    const { ClassSessionModel } = await import("@/server/db/models/classSession.model");
    const classSession = await ClassSessionModel.findById(classSessionId).lean() as IClassSession | null;
    if (!classSession) {
      throw new NotFoundError("Class session not found");
    }

    const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean() as ITrainerProfile | null;
    if (!trainerProfile || !trainerProfile._id) {
      throw new NotFoundError("Trainer profile not found");
    }

    // Compare trainerId (should be ObjectId, not populated)
    const classTrainerId = classSession.trainerId.toString();
    if (classTrainerId !== trainerProfile._id.toString() && user.role !== "ADMIN") {
      throw new ForbiddenError("You can only view bookings for your own classes");
    }

    const bookings = await BookingService.getBookingsByClassSession(classSessionId);
    return jsonOk(bookings, 200);
  } catch (error) {
    return jsonError(error);
  }
}
