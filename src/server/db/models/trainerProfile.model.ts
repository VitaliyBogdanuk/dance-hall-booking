import mongoose, { Schema, model, models, Types } from "mongoose";

export interface ITrainerProfile {
  userId: Types.ObjectId;
  bio?: string;
  specialties?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerProfileSchema = new Schema<ITrainerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    bio: { type: String },
    specialties: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const TrainerProfileModel =
  models.TrainerProfile || model<ITrainerProfile>("TrainerProfile", TrainerProfileSchema);
