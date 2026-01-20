import mongoose, { Schema, model, Types } from "mongoose";

export interface IChild {
  _id?: Types.ObjectId;
  parentId: Types.ObjectId;
  name: string;
  birthDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChildSchema = new Schema<IChild>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    birthDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

ChildSchema.index({ parentId: 1, createdAt: -1 });

export const ChildModel = (mongoose.models && mongoose.models.Child) || model<IChild>("Child", ChildSchema);
