import mongoose, { Schema, model, Types } from "mongoose";

export interface IHall {
  _id?: Types.ObjectId;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HallSchema = new Schema<IHall>(
  {
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const HallModel = (mongoose.models && mongoose.models.Hall) || model<IHall>("Hall", HallSchema);
