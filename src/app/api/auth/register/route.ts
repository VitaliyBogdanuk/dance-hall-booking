import { NextRequest } from "next/server";
import { validateBody } from "@/server/http/validateRequest";
import { z } from "zod";
import { UserModel, type IUser } from "@/server/db/models/user.model";
import { connectOnce } from "@/server/db/mongoose";
import { jsonOk, jsonError } from "@/server/http/response";
import { logger } from "@/server/utils/logger";
import { ConflictError } from "@/server/http/errors";
import bcrypt from "bcryptjs";

const registerBody = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectOnce();

    const body = await validateBody(request, registerBody);

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: body.email.toLowerCase() 
    }).lean() as IUser | null;
    
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create new user with PARENT role only (admin can only be created via DB)
    const newUser = new UserModel({
      email: body.email.toLowerCase(),
      passwordHash,
      name: body.name.trim(),
      phone: body.phone?.trim(),
      role: "PARENT", // Only allow PARENT registration
    });

    const savedUser = await newUser.save();

    logger.logInfo("User registered", { 
      userId: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role
    });

    return jsonOk({
      _id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
    }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
