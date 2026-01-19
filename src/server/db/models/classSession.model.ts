import { Schema, model, models, Types } from "mongoose";

export type ClassStatus = "SCHEDULED" | "CANCELED";

export interface IClassSession {
  trainerId: Types.ObjectId; // TrainerProfile _id
  hallId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  capacity: number;
  takenSeats: number;
  status: ClassStatus;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSessionSchema = new Schema<IClassSession>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "TrainerProfile", required: true, index: true },
    hallId: { type: Schema.Types.ObjectId, ref: "Hall", required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    capacity: { type: Number, required: true, min: 1, max: 60 },
    takenSeats: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, required: true, enum: ["SCHEDULED", "CANCELED"], default: "SCHEDULED", index: true },
    price: { type: Number, min: 0 },
  },
  { timestamps: true }
);

ClassSessionSchema.index({ hallId: 1, startAt: 1, endAt: 1 });
ClassSessionSchema.index({ trainerId: 1, startAt: 1 });

export const ClassSessionModel =
  models.ClassSession || model<IClassSession>("ClassSession", ClassSessionSchema);
