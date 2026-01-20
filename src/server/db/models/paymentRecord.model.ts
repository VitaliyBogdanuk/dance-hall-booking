import mongoose, { Schema, model, Types } from "mongoose";

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";

export interface IPaymentRecord {
  parentId: Types.ObjectId;
  month: string; // YYYY-MM
  amount: number;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
    amount: { type: Number, required: true, min: 0, max: 1000000 },
    status: { type: String, required: true, enum: ["PENDING", "PAID", "OVERDUE"], default: "PENDING", index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentRecordSchema.index({ parentId: 1, month: 1 }, { unique: true });

export const PaymentRecordModel =
  (mongoose.models && mongoose.models.PaymentRecord) || model<IPaymentRecord>("PaymentRecord", PaymentRecordSchema);
