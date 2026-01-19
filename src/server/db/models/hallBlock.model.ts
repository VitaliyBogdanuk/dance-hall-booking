import { Schema, model, models, Types } from "mongoose";

export interface IHallBlock {
  hallId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  reason: string;
  createdByAdminId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const HallBlockSchema = new Schema<IHallBlock>(
  {
    hallId: { type: Schema.Types.ObjectId, ref: "Hall", required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// For overlap checks
HallBlockSchema.index({ hallId: 1, startAt: 1, endAt: 1 });

export const HallBlockModel = models.HallBlock || model<IHallBlock>("HallBlock", HallBlockSchema);
