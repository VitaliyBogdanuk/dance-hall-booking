import { NextRequest } from "next/server";
import { getServerUser } from "@/server/auth/session";
import { validateBody } from "@/server/http/validateRequest";
import { z } from "zod";
import { UserModel, type IUser } from "@/server/db/models/user.model";
import { TrainerProfileModel, type ITrainerProfile } from "@/server/db/models/trainerProfile.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { logger } from "@/server/utils/logger";
import { NotFoundError, ConflictError } from "@/server/http/errors";
import bcrypt from "bcryptjs";

const updateProfileBody = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  specialties: z.string().max(200).optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await getServerUser();
    await connectOnce();

    const userDoc = await UserModel.findById(user.userId).lean() as IUser | null;
    if (!userDoc) {
      throw new NotFoundError("User not found");
    }

    // For trainers, also get profile data
    let profileData: { bio?: string; specialties?: string } | null = null;
    if (user.role === "TRAINER") {
      const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean() as ITrainerProfile | null;
      if (trainerProfile) {
        profileData = {
          bio: trainerProfile.bio,
          specialties: trainerProfile.specialties,
        };
      }
    }

    return jsonOk({
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      role: userDoc.role,
      ...profileData,
    }, 200);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getServerUser();
    await connectOnce();

    const body = await validateBody(request, updateProfileBody);

    // Get current user
    const userDoc = await UserModel.findById(user.userId).lean() as IUser | null;
    if (!userDoc) {
      throw new NotFoundError("User not found");
    }

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
          _id: { $ne: user.userId }
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

      await UserModel.findByIdAndUpdate(user.userId, userUpdate);
    }

    // For trainers, update profile fields
    if (user.role === "TRAINER" && (body.bio !== undefined || body.specialties !== undefined)) {
      const profileUpdate: { bio?: string; specialties?: string } = {};
      
      if (body.bio !== undefined) {
        profileUpdate.bio = body.bio || undefined;
      }
      
      if (body.specialties !== undefined) {
        profileUpdate.specialties = body.specialties || undefined;
      }

      await TrainerProfileModel.findOneAndUpdate(
        { userId: user.userId },
        profileUpdate,
        { upsert: true }
      );
    }

    // Fetch updated user data
    const updatedUser = await UserModel.findById(user.userId).lean() as IUser | null;
    if (!updatedUser) {
      throw new NotFoundError("User not found after update");
    }

    // Get updated profile data for trainers
    let profileData: { bio?: string; specialties?: string } | null = null;
    if (user.role === "TRAINER") {
      const trainerProfile = await TrainerProfileModel.findOne({ userId: user.userId }).lean() as ITrainerProfile | null;
      if (trainerProfile) {
        profileData = {
          bio: trainerProfile.bio,
          specialties: trainerProfile.specialties,
        };
      }
    }

    logger.logInfo("Profile updated", { 
      userId: user.userId,
      updatedFields: Object.keys(body)
    });

    return jsonOk({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      ...profileData,
    }, 200);
  } catch (error) {
    return jsonError(error);
  }
}
