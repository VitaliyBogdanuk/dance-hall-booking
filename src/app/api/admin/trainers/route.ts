import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { z } from "zod";
import { objectId } from "@/server/validation/common";
import { UserModel } from "@/server/db/models/user.model";
import { TrainerProfileModel } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { logger } from "@/server/utils/logger";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import bcrypt from "bcryptjs";

const createTrainerBody = z.object({
  userId: objectId.optional(),
  email: z.string().email().optional(),
  name: z.string().min(2).max(80),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  specialties: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectOnce();

    const body = await validateBody(request, createTrainerBody);

    let userId: string;

    if (body.userId) {
      const user = await UserModel.findById(body.userId).lean();
      if (!user) {
        throw new NotFoundError("User not found");
      }
      if (user.role !== "TRAINER") {
        throw new ConflictError("User is not a trainer");
      }
      userId = body.userId;
    } else if (body.email) {
      const existingUser = await UserModel.findOne({ email: body.email.toLowerCase() }).lean();
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      if (!body.password) {
        throw new Error("Password is required when creating new user");
      }

      const passwordHash = await bcrypt.hash(body.password, 10);
      const newUser = new UserModel({
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        phone: body.phone,
        role: "TRAINER",
      });
      const savedUser = await newUser.save();
      userId = savedUser._id.toString();
    } else {
      throw new Error("Either userId or email must be provided");
    }

    const existingProfile = await TrainerProfileModel.findOne({ userId }).lean();
    if (existingProfile) {
      throw new ConflictError("Trainer profile already exists for this user");
    }

    const trainerProfile = new TrainerProfileModel({
      userId,
      bio: body.bio,
      specialties: body.specialties,
      isActive: true,
    });
    const saved = await trainerProfile.save();

    logger.info("Trainer created", { adminId: admin.userId, trainerId: saved._id.toString() });
    return jsonOk(saved, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectOnce();

    const trainers = await TrainerProfileModel.find({ isActive: true })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return jsonOk(trainers, 200);
  } catch (error) {
    return jsonError(error);
  }
}
