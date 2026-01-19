import mongoose, { Schema, model, models } from "mongoose";

export type UserRole = "ADMIN" | "TRAINER" | "PARENT";

export interface IUser {
  email: string;
  passwordHash?: string; // MVP credentials
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, required: true, enum: ["ADMIN", "TRAINER", "PARENT"], index: true },
  },
  { timestamps: true }
);

export const UserModel = models.User || model<IUser>("User", UserSchema);
