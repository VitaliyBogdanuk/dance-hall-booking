import { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/rbac";
import { validateBody } from "@/server/http/validateRequest";
import { z } from "zod";
import { UserModel, type IUser } from "@/server/db/models/user.model";
import { TrainerProfileModel } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { logger } from "@/server/utils/logger";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import bcrypt from "bcryptjs";

const updateTrainerBody = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  specialties: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    await connectOnce();

    const trainerId = params.id;
    const body = await validateBody(request, updateTrainerBody);

    // Find trainer profile
    const trainerProfile = await TrainerProfileModel.findById(trainerId).populate("userId");
    if (!trainerProfile) {
      throw new NotFoundError("Trainer profile not found");
    }

    const userId = trainerProfile.userId as unknown as IUser;

    // Update user fields if provided
    if (body.name || body.email || body.phone || body.password) {
      const userUpdate: Partial<IUser> = {};
      
      if (body.name) {
        userUpdate.name = body.name;
      }
      
      if (body.email) {
        const emailLower = body.email.toLowerCase();
        // Check if email is already taken by another user
        const existingUser = await UserModel.findOne({ 
          email: emailLower,
          _id: { $ne: userId._id }
        }).lean() as IUser | null;
        
        if (existingUser) {
          throw new ConflictError("Email is already taken by another user");
        }
        userUpdate.email = emailLower;
      }
      
      if (body.phone !== undefined) {
        userUpdate.phone = body.phone || undefined;
      }
      
      if (body.password) {
        userUpdate.passwordHash = await bcrypt.hash(body.password, 10);
      }

      await UserModel.findByIdAndUpdate(userId._id, userUpdate);
    }

    // Update trainer profile fields
    const profileUpdate: Partial<typeof trainerProfile> = {};
    
    if (body.bio !== undefined) {
      profileUpdate.bio = body.bio || undefined;
    }
    
    if (body.specialties !== undefined) {
      profileUpdate.specialties = body.specialties || undefined;
    }
    
    if (body.isActive !== undefined) {
      profileUpdate.isActive = body.isActive;
    }

    // Update profile if there are changes
    if (Object.keys(profileUpdate).length > 0) {
      await TrainerProfileModel.findByIdAndUpdate(trainerId, profileUpdate);
    }

    // Fetch updated trainer profile with populated user data
    const updatedProfile = await TrainerProfileModel.findById(trainerId)
      .populate("userId", "name email phone")
      .lean();

    if (!updatedProfile) {
      throw new NotFoundError("Trainer profile not found after update");
    }

    logger.logInfo("Trainer updated", { 
      adminId: admin.userId, 
      trainerId: trainerId,
      updatedFields: Object.keys(body)
    });

    return jsonOk(updatedProfile, 200);
  } catch (error) {
    return jsonError(error);
  }
}
