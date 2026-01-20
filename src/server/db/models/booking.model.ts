import mongoose, { Schema, model, Types } from "mongoose";

export type BookingStatus = "BOOKED" | "CANCELED";

export interface IBooking {
  classSessionId: Types.ObjectId;
  childId: Types.ObjectId;
  parentId: Types.ObjectId;
  status: BookingStatus;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    classSessionId: { type: Schema.Types.ObjectId, ref: "ClassSession", required: true, index: true },
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, required: true, enum: ["BOOKED", "CANCELED"], default: "BOOKED", index: true },
    canceledAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicates: one booking record per child per class.
// We will toggle status BOOKED/CANCELED instead of creating a new row.
BookingSchema.index({ classSessionId: 1, childId: 1 }, { unique: true });

BookingSchema.index({ parentId: 1, createdAt: -1 });

export const BookingModel = (mongoose.models && mongoose.models.Booking) || model<IBooking>("Booking", BookingSchema);
